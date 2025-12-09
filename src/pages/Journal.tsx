import { useApp } from '../context/AppContext';
import { MobileLayout } from '../components/layout/MobileLayout';
import { Header } from '../components/layout/Header';
import { StatsHeader } from '../components/gamification/StatsHeader';
import { DreamStack } from '../components/journal/DreamStack';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

export function Journal() {
    const { dreams, stats } = useApp();

    return (
        <MobileLayout>
            <Header
                title="Meus Sonhos"
                subtitle={new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            />

            <StatsHeader stats={stats} />

            <div className="px-6 pb-20">
                {dreams.length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <h3 className="text-xl font-medium mb-2">Nenhum sonho ainda</h3>
                        <p className="text-sm">Durma bem e anote seus sonhos ao acordar!</p>
                        <Link to="/add" className="mt-6 inline-flex items-center text-dream-400 font-bold bg-dream-500/10 px-4 py-2 rounded-full">
                            <Plus size={16} className="mr-2" />
                            Registrar Primeiro Sonho
                        </Link>
                    </div>
                ) : (
                    <>
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Histórico</h2>
                        <DreamStack dreams={dreams} />
                    </>
                )}
            </div>
        </MobileLayout>
    );
}

