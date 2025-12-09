import { useApp } from '../context/AppContext';
import { MobileLayout } from '../components/layout/MobileLayout';
import { Header } from '../components/layout/Header';
import { Trophy, Calendar, Sparkles, Moon, Clock, Settings, LogOut, RotateCcw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

export function Profile() {
    const { stats, updateBedtime, lucidProbability, syncDreams } = useApp();
    const { user } = useAuth();

    // Local state for editing
    const [name, setName] = useState('Viajante dos Sonhos');
    const [bedtime, setBedtime] = useState(stats.bedtime || '23:00');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (stats.bedtime) setBedtime(stats.bedtime);
        // If we had name in stats/context we would set it here. 
        // For MVP name is often in User metadata, let's fetch it or default.
        if (user?.user_metadata?.name) {
            setName(user.user_metadata.name);
        }
    }, [stats, user]);

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);

        try {
            // Update Bedtime explicitly via AppContext (which updates stats -> DB sync)
            updateBedtime(bedtime);

            // Allow name update via auth metadata
            await authService.updateProfile(user.id, {
                name: name
            });

            // Force sync to ensure consistency
            await syncDreams(user.id);

            setIsEditing(false);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <MobileLayout>
            <Header title="Perfil" subtitle="Central de Controle" />

            <div className="px-6 pb-24 space-y-6">

                {/* Profile Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 border border-slate-700 shadow-2xl">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Sparkles size={120} />
                    </div>

                    <div className="flex items-center space-x-6 relative z-10">
                        <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                            <span className="text-3xl font-bold text-white">{name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white mb-1">{name}</h2>
                            <p className="text-indigo-300 text-sm font-medium">Nível {stats.level} • Sonhador</p>
                        </div>
                    </div>

                    {/* Level Progress */}
                    <div className="mt-8 relative z-10">
                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            <span>XP {stats.xp % 100}/100</span>
                            <span>Próximo Nível</span>
                        </div>
                        <div className="w-full bg-slate-950/50 h-3 rounded-full overflow-hidden border border-white/5">
                            <div
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-1000"
                                style={{ width: `${stats.xp % 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Lucid Probability - Featured Stat */}
                    <div className="col-span-2 bg-slate-900/80 backdrop-blur-md border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                        <div className="flex flex-col">
                            <div className="flex items-center text-purple-400 mb-1">
                                <Moon size={16} className="mr-2" />
                                <span className="text-xs font-bold uppercase tracking-wider">Chance de Lucidez</span>
                            </div>
                            <span className="text-3xl font-bold text-white">{Math.round(lucidProbability)}%</span>
                            <span className="text-xs text-slate-500 mt-1">Baseado nos seus hábitos</span>
                        </div>
                        <div className="w-16 h-16 relative flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="32" cy="32" r="28" fill="none" stroke="#1e293b" strokeWidth="6" />
                                <circle
                                    cx="32" cy="32" r="28"
                                    fill="none"
                                    stroke="#a855f7"
                                    strokeWidth="6"
                                    strokeDasharray={`${lucidProbability * 1.75} 200`}
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>
                    </div>

                    <StatCard icon={Trophy} label="XP Total" value={stats.xp} color="text-yellow-400" bgColor="bg-slate-900/50" />
                    <StatCard icon={Calendar} label="Dias Seguidos" value={stats.streak} color="text-orange-500" bgColor="bg-slate-900/50" />
                    <StatCard icon={Sparkles} label="Sonhos" value={stats.dreamsRecorded} color="text-blue-400" bgColor="bg-slate-900/50" />
                    <StatCard icon={Clock} label="Ações Hoje" value={stats.dailyActions} color="text-emerald-400" bgColor="bg-slate-900/50" />
                </div>

                {/* Settings Section */}
                <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                        <div className="flex items-center text-slate-300">
                            <Settings size={18} className="mr-2" />
                            <span className="font-bold">Preferências</span>
                        </div>
                        <button
                            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${isEditing ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                        >
                            {isEditing ? (isSaving ? 'Salvando...' : 'Salvar') : 'Editar'}
                        </button>
                    </div>

                    <div className="p-4 space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs text-slate-500 uppercase font-bold">Nome de Viajante</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={!isEditing}
                                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white font-medium focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-slate-500 uppercase font-bold">Horário de Dormir</label>
                            <div className="flex items-center space-x-4">
                                <div className="relative flex-1">
                                    <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="time"
                                        value={bedtime}
                                        onChange={(e) => setBedtime(e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full bg-slate-950/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white font-medium focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-slate-500">Usado para calcular seu contador de sono.</p>
                        </div>
                    </div>
                </div>

                {/* Danger / Account Actions */}
                <div className="space-y-3 pt-6">
                    <button
                        onClick={async () => {
                            const { authService } = await import('../services/authService');
                            await authService.signOut();
                            window.location.reload();
                        }}
                        className="w-full bg-red-500/10 border border-red-500/20 text-red-400 font-bold py-4 rounded-xl hover:bg-red-500/20 transition-all flex items-center justify-center space-x-2"
                    >
                        <LogOut size={18} />
                        <span>Sair da Conta</span>
                    </button>

                    <button
                        onClick={async () => {
                            if (user) await syncDreams(user.id);
                            alert("Dados sincronizados!");
                        }}
                        className="w-full text-slate-500 text-xs font-medium py-2 flex items-center justify-center space-x-1 hover:text-slate-300 transition-colors"
                    >
                        <RotateCcw size={12} />
                        <span>Forçar Sincronização</span>
                    </button>
                </div>
            </div>
        </MobileLayout>
    );
}

function StatCard({ icon: Icon, label, value, color, bgColor }: any) {
    return (
        <div className={`${bgColor || 'bg-slate-900'} border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center space-y-2 relative overflow-hidden group`}>
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity ${color.replace('text-', 'bg-')}`} />
            <Icon className={`w-6 h-6 ${color}`} />
            <span className="text-2xl font-bold text-white">{value}</span>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{label}</span>
        </div>
    )
}
