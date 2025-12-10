import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;
if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
}

export const aiService = {
    async transcribeAudio(audioBlob: Blob): Promise<string> {
        if (!API_KEY) throw new Error("API Key config missing");

        try {
            const mimeType = audioBlob.type || 'audio/webm';
            const numBytes = audioBlob.size;
            const displayName = "AUDIO_" + Date.now();

            // 1. Initial resumable request
            const initialResponse = await fetch(`https://generativelanguage.googleapis.com/upload/v1beta/files?key=${API_KEY}`, {
                method: 'POST',
                headers: {
                    'X-Goog-Upload-Protocol': 'resumable',
                    'X-Goog-Upload-Command': 'start',
                    'X-Goog-Upload-Header-Content-Length': numBytes.toString(),
                    'X-Goog-Upload-Header-Content-Type': mimeType,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ file: { display_name: displayName } })
            });

            if (!initialResponse.ok) {
                const text = await initialResponse.text();
                throw new Error(`Failed to initiate upload: ${initialResponse.status} ${text}`);
            }

            const uploadUrl = initialResponse.headers.get('x-goog-upload-url');
            if (!uploadUrl) throw new Error("No upload URL found in response headers");

            // 2. Upload the actual bytes
            // Note: Command 'upload, finalize' is strictly required for small files uploaded in one go
            const uploadResponse = await fetch(uploadUrl, {
                method: 'POST',
                headers: {
                    'Content-Length': numBytes.toString(),
                    'X-Goog-Upload-Offset': '0',
                    'X-Goog-Upload-Command': 'upload, finalize'
                },
                body: audioBlob
            });

            if (!uploadResponse.ok) {
                const text = await uploadResponse.text();
                throw new Error(`Failed to upload file: ${uploadResponse.status} ${text}`);
            }

            const fileInfo = await uploadResponse.json();
            const fileUri = fileInfo.file.uri;

            // 3. Generate Content using the file URI
            // Using gemini-1.5-flash as requested (standard for this task)
            const genResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: "Transcreva este áudio de um relato de sonho com precisão. Corrija pontuação e deixe o texto fluído. Retorne apenas o texto transcrito, sem comentários." },
                            { file_data: { mime_type: mimeType, file_uri: fileUri } }
                        ]
                    }]
                })
            });

            if (!genResponse.ok) {
                const text = await genResponse.text();
                throw new Error(`Failed to generate content: ${genResponse.status} ${text}`);
            }

            const genData = await genResponse.json();
            const transcription = genData.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!transcription) throw new Error("No transcription text found in response");

            return transcription;

        } catch (error) {
            console.error("Transcription error:", error);
            throw error;
        }
    },

    async generateDreamImage(description: string): Promise<string> {
        if (!genAI) throw new Error("API Key config missing");

        try {
            // Enhance prompt with app aesthetic (Dreamy, Night, Neon Blue/Cyan)
            const aestheticSuffix = " . Art style: Ethereal, dreamlike, surreal, cyan and blue neon lighting, dark atmospheric background, highly detailed, 8k resolution, cinematic composition, digital art.";
            const fullPrompt = description + aestheticSuffix;

            // Implementation using native Gemini Image Generation (gemini-3-pro-image-preview)
            // Using standard fetch to ensure exact payload structure as requested

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        role: "user",
                        parts: [{ text: fullPrompt }]
                    }],
                    generationConfig: {
                        responseModalities: ["IMAGE", "TEXT"],
                        imageConfig: {
                            aspectRatio: "16:9",
                            image_size: "1K" // Or "1024x1024" if 1K is not accepted, keeping user's config
                        }
                    },
                    // Optional: tools if strictly required by this model/preview
                    // tools: [{ googleSearch: {} }] 
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                // If 404/400 (model not found), throw to trigger fallback
                throw new Error(`Gemini API Error (${response.status}): ${errorText}`);
            }

            const data = await response.json();

            // Extract image from response
            // Expected structure: candidates[0].content.parts[].inlineData
            const parts = data.candidates?.[0]?.content?.parts;
            if (parts && Array.isArray(parts)) {
                // Find the part containing the image
                const imagePart = parts.find((p: any) => p.inlineData && p.inlineData.mimeType.startsWith('image/'));
                if (imagePart) {
                    return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
                }
            }

            throw new Error("No image data found in Gemini response");

        } catch (error) {
            console.error("Gemini Image Gen Error:", error);

            // Fallback to Pollinations AI if Gemini fails (e.g. model not available)
            try {
                const encodedPrompt = encodeURIComponent(description.slice(0, 300)); // Limit length
                const seed = Math.floor(Math.random() * 1000000);
                return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=576&seed=${seed}&nologo=true`;
            } catch (err) {
                return "https://images.unsplash.com/photo-1483086431886-3590a88317fe?q=80&w=2574&auto=format&fit=crop";
            }
        }
    },

    async generateDreamQuiz(dreamText: string): Promise<{ question: string; options: string[]; correctAnswer: string }> {
        if (!API_KEY) throw new Error("API Key config missing");

        try {
            const prompt = `
            Atue como um "Detetive de Sonhos" criativo e perspicaz. O usuário teve o seguinte sonho: "${dreamText}".
            
            Sua missão é criar um desafio de memória (Quiz) intrigante para testar se o sonhador realmente prestou atenção nos detalhes.
            
            REGRAS PARA A QUESTÃO:
            1. NÃO faça perguntas óbvias (ex: "O que você fez?").
            2. Foque em detalhes sutis mas presentes: cores específicas, objetos de fundo, sentimentos passageiros, ou a "lógica estranha" do sonho.
            3. Use um tom levemente misterioso ou desafiador.
            
            REGRAS PARA AS OPÇÕES:
            1. Crie 3 opções: A, B e C.
            2. Apenas UMA deve ser correta (exatamente como no texto).
            3. As outras duas (distratores) devem ser PLAUSÍVEIS dentro do contexto do sonho. Não coloque coisas absurdas que entreguem a resposta. Elas devem confundir levemente quem não lembra bem.
            
            Retorne APENAS um JSON válido com este formato:
            {
                "question": "Sua pergunta intrigante aqui?",
                "options": ["Opção plausível (falsa)", "Opção correta (verdadeira)", "Opção plausível (falsa)"],
                "correctAnswer": "Opção correta (verdadeira)"
            }
            `;

            const genResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            if (!genResponse.ok) throw new Error("Failed to generate quiz");

            const genData = await genResponse.json();
            let text = genData.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) throw new Error("No text generated");

            // Clean markdown just in case
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();

            const json = JSON.parse(text);
            return json;

        } catch (error) {
            console.error("Quiz Gen Error:", error);
            // Fallback quiz if AI fails
            return {
                question: "Qual era o sentimento predominante neste sonho?",
                options: ["Medo", "Alegria", "Confusão"],
                correctAnswer: "Confusão" // Generic fallback
            };
        }
    }
};
