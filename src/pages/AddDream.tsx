import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { dreamService } from '../services/dreamService';
import { MobileLayout } from '../components/layout/MobileLayout';
import { ArrowLeft, Star, Loader, Sparkles } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { AIVoiceInput } from '../components/ui/AIVoiceInput';
import { FluidSlider } from '../components/ui/FluidSlider';
import { aiService } from '../services/aiService';
import { SoninhoMascot } from '../components/ui/SoninhoMascot';

export function AddDream() {
    const { addDream: addDreamToLocal } = useApp(); // Keep local for fallback
    const { user } = useAuth();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [clarity, setClarity] = useState(3);
    const [isLucid, setIsLucid] = useState(false);
    const [tags, setTags] = useState('');
    const [hasAudio, setHasAudio] = useState(false);
    const [saving, setSaving] = useState(false);

    // AI Image State
    const [generatingImage, setGeneratingImage] = useState(false);
    const [coverImage, setCoverImage] = useState<string | null>(null);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!description && !hasAudio) return;

        setSaving(true);

        const dreamData = {
            title: title || 'Sonho sem título',
            description: description || (hasAudio ? '🎙️ Gravação de áudio anexada' : ''),
            clarity,
            isLucid,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            coverImage // Add this to saved data if backend supports it later
        };

        // If user is logged in, save to Supabase
        if (user) {
            try {
                // 1. Create a "Night" entry
                const nightDate = new Date().toISOString().split('T')[0];

                const { data: night, error: nightError } = await dreamService.createNight({
                    user_id: user.id,
                    date: nightDate,
                    sleep_quality: 3
                });

                if (nightError) throw nightError;
                if (!night) throw new Error('Failed to create night');

                const { error: dreamError } = await dreamService.addDream({
                    night_id: night.id,
                    user_id: user.id,
                    title: dreamData.title,
                    raw_text: dreamData.description,
                    lucid: dreamData.isLucid,
                    recall_clarity: dreamData.clarity,
                    tags: dreamData.tags,
                    // @ts-ignore: Schema updated manually, type gen pending
                    cover_image: coverImage
                });

                if (dreamError) throw dreamError;

            } catch (err) {
                console.error("Failed to save to Supabase", err);
            }
        }

        // Keep local context update
        addDreamToLocal({
            ...dreamData,
            coverImage: dreamData.coverImage || undefined
        });

        setSaving(false);
        navigate('/');
    };

    return (
        <MobileLayout showNav={false}>
            <header className="px-4 py-4 flex items-center justify-between sticky top-0 bg-slate-950 z-10 border-b border-slate-800/50 backdrop-blur-md">
                <Link to="/" className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft />
                </Link>
                <h1 className="font-bold text-lg">Novo Sonho</h1>
                <button
                    onClick={() => handleSubmit()}
                    disabled={(!description && !hasAudio) || saving}
                    className="p-2 -mr-2 text-dream-400 font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:text-dream-300 transition-colors"
                >
                    {saving ? <Loader className="animate-spin w-5 h-5" /> : 'Salvar'}
                </button>
            </header>

            <div className="px-6 py-6 space-y-8">

                {/* Audio Recording Section */}
                <section>
                    <div className="flex justify-between items-center mb-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Gravar Relato</label>
                    </div>
                    <AIVoiceInput
                        visualizerBars={30}
                        onStop={async (_, blob, transcript) => {
                            setHasAudio(true);
                            if (transcript) {
                                const newText = transcript.trim();
                                const formattedText = newText.charAt(0).toUpperCase() + newText.slice(1);

                                setDescription(prev => {
                                    return prev ? prev + "\n\n" + formattedText : formattedText;
                                });

                                if (!title) setTitle("Relato de Sonho (Áudio)");
                            } else if (blob) {
                                // Fallback
                                if (!description) {
                                    setDescription("🎙️ Gravação de áudio anexada (Transcrição não disponível)");
                                }
                            }
                        }}
                    />
                </section>

                <section className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Título (Opcional)</label>
                    <input
                        type="text"
                        placeholder="Ex: Voo sobre a cidade"
                        className="w-full bg-transparent text-xl font-bold placeholder:text-slate-700 focus:outline-none border-b border-slate-800 focus:border-dream-500 py-2 transition-all"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />
                </section>

                <section className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Descrição Detalhada</label>
                    <textarea
                        placeholder="Descreva seu sonho com o máximo de detalhes..."
                        className="w-full h-40 bg-slate-900/50 p-4 rounded-xl text-base leading-relaxed placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-dream-500/50 border border-slate-800 resize-none transition-all"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                </section>

                {/* AI Image Generation Section */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ilustração (IA)</label>
                        {coverImage && (
                            <button
                                onClick={() => setCoverImage(null)}
                                className="text-xs text-red-400 hover:text-red-300"
                            >
                                Remover
                            </button>
                        )}
                    </div>

                    {!coverImage ? (
                        <button
                            onClick={async () => {
                                setGeneratingImage(true);
                                try {
                                    const imageUrl = await aiService.generateDreamImage(description || title);
                                    setCoverImage(imageUrl);
                                } catch (error) {
                                    console.error("Image Gen Error", error);
                                    alert("Erro ao gerar imagem.");
                                } finally {
                                    setGeneratingImage(false);
                                }
                            }}
                            disabled={generatingImage || (!description && !title)}
                            className={`w-full rounded-3xl border-2 border-dashed border-slate-700 hover:border-dream-500 hover:bg-slate-800/30 flex flex-col items-center justify-center gap-2 transition-all group disabled:opacity-100 disabled:cursor-wait h-64 ${generatingImage ? 'border-dream-500 bg-slate-800/20' : ''}`}
                        >
                            {generatingImage ? (
                                <div className="flex flex-col items-center animate-in fade-in duration-500">
                                    <SoninhoMascot variant="painting" size="xl" />
                                    <span className="text-sm font-medium text-dream-400 animate-pulse mt-4">Pintando seu sonho...</span>
                                </div>
                            ) : (
                                <>
                                    <Sparkles className="text-slate-500 group-hover:text-dream-400 transition-colors" />
                                    <span className="text-sm font-medium text-slate-400 group-hover:text-dream-300">
                                        Gerar Capa com IA
                                    </span>
                                </>
                            )}
                        </button>
                    ) : (
                        <div className="relative w-full h-64 rounded-3xl overflow-hidden border border-slate-700 group">
                            <img src={coverImage} alt="Dream Cover" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                <Sparkles className="text-white w-8 h-8" />
                            </div>
                        </div>
                    )}
                </section>

                <section className="space-y-4">
                    <FluidSlider
                        label="Nível de Clareza"
                        value={clarity}
                        onChange={setClarity}
                        min={1}
                        max={5}
                        step={1}
                    />
                </section>

                <section className="flex items-center justify-between bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full transition-colors ${isLucid ? 'bg-yellow-400/20 text-yellow-400 shadow-lg shadow-yellow-400/10' : 'bg-slate-800 text-slate-600'}`}>
                            <Star className={`w-6 h-6 ${isLucid ? 'fill-current' : ''}`} />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Lucidez</h3>
                            <p className="text-xs text-slate-400">Você sabia que estava sonhando?</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={isLucid} onChange={e => setIsLucid(e.target.checked)} />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-dream-500"></div>
                    </label>
                </section>

                <section className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tags</label>
                    <input
                        type="text"
                        placeholder="Ex: Pesadelo, Voar, Família"
                        className="w-full bg-slate-900/50 p-3 rounded-xl text-sm placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-dream-500/50 border border-slate-800 transition-all"
                        value={tags}
                        onChange={e => setTags(e.target.value)}
                    />
                </section>
            </div>
        </MobileLayout>
    );
}
