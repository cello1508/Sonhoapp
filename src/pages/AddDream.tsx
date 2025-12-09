import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MobileLayout } from '../components/layout/MobileLayout';
import { ArrowLeft, Star } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export function AddDream() {
    const { addDream } = useApp();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [clarity, setClarity] = useState(3);
    const [isLucid, setIsLucid] = useState(false);
    const [tags, setTags] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description) return;

        addDream({
            title: title || 'Sonho sem título',
            description,
            clarity,
            isLucid,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean)
        });

        navigate('/');
    };

    return (
        <MobileLayout showNav={false}>
            <header className="px-4 py-4 flex items-center justify-between sticky top-0 bg-slate-950 z-10">
                <Link to="/" className="p-2 -ml-2 text-slate-400 hover:text-white">
                    <ArrowLeft />
                </Link>
                <h1 className="font-bold text-lg">Novo Sonho</h1>
                <button
                    onClick={handleSubmit}
                    disabled={!description}
                    className="p-2 -mr-2 text-dream-400 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Salvar
                </button>
            </header>

            <form className="px-6 py-4 space-y-8" onSubmit={handleSubmit}>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Título (Opcional)</label>
                    <input
                        type="text"
                        placeholder="Ex: Voo sobre a cidade"
                        className="w-full bg-transparent text-xl font-bold placeholder:text-slate-700 focus:outline-none"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Descrição</label>
                    <textarea
                        placeholder="Descreva seu sonho com o máximo de detalhes..."
                        className="w-full h-40 bg-slate-900/50 p-4 rounded-xl text-base leading-relaxed placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-dream-500/50 border-none resize-none"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Clareza</label>
                        <span className="text-xs font-bold text-dream-400">{clarity}/5</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={clarity}
                        onChange={e => setClarity(Number(e.target.value))}
                        className="w-full accent-dream-500"
                    />
                </div>

                <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-xl">
                    <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${isLucid ? 'bg-yellow-400/20 text-yellow-400' : 'bg-slate-800 text-slate-600'}`}>
                            <Star size={20} fill={isLucid ? "currentColor" : "none"} />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">Sonho Lúcido?</h3>
                            <p className="text-xs text-slate-500">Você sabia que estava sonhando?</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={isLucid} onChange={e => setIsLucid(e.target.checked)} />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-dream-500"></div>
                    </label>
                </div>

                <div className="space-y-2 hidden">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tags (separadas por vírgula)</label>
                    <input
                        type="text"
                        placeholder="pesadelo, voar, escola..."
                        className="w-full bg-slate-900/50 px-4 py-3 rounded-xl border-none focus:ring-1 focus:ring-dream-500/50"
                        value={tags}
                        onChange={e => setTags(e.target.value)}
                    />
                </div>
            </form>
        </MobileLayout>
    );
}
