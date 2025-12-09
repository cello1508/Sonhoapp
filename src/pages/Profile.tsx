import { useApp } from '../context/AppContext';
import { MobileLayout } from '../components/layout/MobileLayout';
import { Header } from '../components/layout/Header';
import { User, Trophy, Calendar } from 'lucide-react';

export function Profile() {
    const { stats } = useApp();

    return (
        <MobileLayout>
            <Header title="Perfil" subtitle="Suas Estatísticas" />

            <div className="px-6 pb-20">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-4 border-4 border-slate-900 shadow-xl">
                        <User size={40} className="text-slate-500" />
                    </div>
                    <h2 className="text-xl font-bold">Viajante dos Sonhos</h2>
                    <p className="text-dream-400 font-medium">Nível {stats.level}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <StatCard icon={Trophy} label="XP Total" value={stats.xp} color="text-yellow-400" />
                    <StatCard icon={Calendar} label="Dias Seguidos" value={stats.streak} color="text-orange-500" />
                    <StatCard icon={Cloud} label="Sonhos" value={stats.dreamsRecorded} color="text-blue-400" />
                </div>

                <button
                    onClick={async () => {
                        const { authService } = await import('../services/authService');
                        await authService.signOut();
                        window.location.reload();
                    }}
                    className="w-full bg-slate-900 border border-slate-700 text-red-500 font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors"
                >
                    Sair da Conta
                </button>
            </div>
        </MobileLayout>
    );
}

function Cloud({ size, className }: any) {
    return <Calendar size={size} className={className} />; // Reuse icon purely for demo
}

function StatCard({ icon: Icon, label, value, color }: any) {
    return (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center space-y-2">
            <Icon className={`w-6 h-6 ${color}`} />
            <span className="text-2xl font-bold text-white">{value}</span>
            <span className="text-xs text-slate-500 uppercase font-bold">{label}</span>
        </div>
    )
}
