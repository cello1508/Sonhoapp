import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;
if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
}

export const aiService = {
    async transcribeAudio(audioBlob: Blob): Promise<string> {
        if (!genAI) throw new Error("API Key config missing");

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            // Convert Blob to Base64
            const reader = new FileReader();
            return new Promise((resolve, reject) => {
                reader.readAsDataURL(audioBlob);
                reader.onloadend = async () => {
                    const base64data = reader.result as string;
                    // Remove data URL prefix (e.g., "data:audio/wav;base64,")
                    const base64Audio = base64data.split(',')[1];
                    const mimeType = audioBlob.type || 'audio/webm'; // Default to webm if unknown, usually webm/wav from browser

                    try {
                        const result = await model.generateContent([
                            {
                                inlineData: {
                                    mimeType: mimeType,
                                    data: base64Audio
                                }
                            },
                            { text: "Transcreva este áudio de um relato de sonho com precisão. Corrija pontuação e deixe o texto fluído. Retorne apenas o texto transcrito, sem comentários." }
                        ]);
                        const response = await result.response;
                        resolve(response.text());
                    } catch (err) {
                        reject(err);
                    }
                };
                reader.onerror = reject;
            });
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
    }
};
