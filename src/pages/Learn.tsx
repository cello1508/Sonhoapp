import { MobileLayout } from '../components/layout/MobileLayout';
import { Header } from '../components/layout/Header';
import { Lightbulb, Brain, Cloud } from 'lucide-react';

const TIPS = [
    {
        category: "Básico",
        title: "Reality Checks",
        desc: "Pergunte a si mesmo: 'Estou sonhando?' várias vezes ao dia. Olhe para as mãos ou tente ler algo.",
        icon: Lightbulb,
        color: "bg-yellow-500"
    },
    {
        category: "Técnica",
        title: "MILD",
        desc: "Ao acordar e voltar a dormir, repita: 'Na próxima vez que eu sonhar, vou lembrar que estou sonhando'.",
        icon: Brain,
        color: "bg-purple-500"
    },
    {
        category: "Hábito",
        title: "Diário de Sonhos",
        desc: "Anotar os sonhos melhora a memória onírica, essencial para a lucidez.",
        icon: Cloud,
        color: "bg-blue-500"
    }
];

export function Learn() {
    return (
        <MobileLayout>
            <Header title="Aprender" subtitle="Guia do Onironauta" />

            <div className="px-6 space-y-4 pb-20">
                {TIPS.map((tip, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-start space-x-4">
                        <div className={`${tip.color} p-3 rounded-xl text-white shadow-lg shadow-${tip.color}/20`}>
                            <tip.icon size={20} />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{tip.category}</span>
                            <h3 className="font-bold text-lg mb-1">{tip.title}</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">{tip.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </MobileLayout>
    );
}
