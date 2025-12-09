import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ChevronRight, Moon, Sparkles, Feather, Palette, Brain, Shield, Clock, Smile, Frown, Rocket } from 'lucide-react';
import { StarField } from '../components/ui/StarField';

const STEPS = [
    {
        id: 'intro',
        type: 'info',
        title: 'Acorde para a Vida',
        description: 'Seus sonhos são um playground infinito. Está pronto para assumir o controle?',
        Icon: Moon,
        iconColor: 'text-yellow-100', // Moonlight
        glowColor: 'shadow-yellow-200/50'
    },
    {
        id: 'benefit_1',
        type: 'info',
        title: 'Lucidez Total',
        description: 'Imagine voar, encontrar ídolos ou visitar outros planetas. No Sonho Lúcido, a única regra é sua imaginação.',
        Icon: Sparkles,
        iconColor: 'text-cyan-300',
        glowColor: 'shadow-cyan-400/50'
    },
    {
        id: 'goal',
        type: 'choice',
        title: 'Qual sua missão hoje?',
        options: [
            { id: 'fly', label: 'Exploração Absoluta', icon: Feather, color: 'bg-blue-500' },
            { id: 'create', label: 'Criatividade Ilimitada', icon: Palette, color: 'bg-purple-500' },
            { id: 'self', label: 'Curar & Evoluir', icon: Brain, color: 'bg-emerald-500' },
            { id: 'nightmare', label: 'Superar Medos', icon: Shield, color: 'bg-red-500' }
        ]
    },
    {
        id: 'recall',
        type: 'choice',
        title: 'Como é sua memória onírica?',
        options: [
            { id: 'always', label: 'Lembro de tudo! (HD)', icon: Smile, color: 'bg-yellow-500' },
            { id: 'sometimes', label: 'Flashes ocasionais', icon: Clock, color: 'bg-orange-500' },
            { id: 'rarely', label: 'Escuridão total', icon: Frown, color: 'bg-slate-500' }
        ]
    },
    {
        id: 'name',
        type: 'input',
        title: 'Identidade do Viajante',
        description: 'Para processar seu visto onírico, precisamos saber como te chamar.',
        placeholder: 'Digite seu nome...',
        Icon: Rocket,
        iconColor: 'text-orange-400'
    }
];

export function Onboarding() {
    const [currentStep, setCurrentStep] = useState(0);
    const [direction, setDirection] = useState(1);
    const [name, setName] = useState('');

    const { completeOnboarding } = useApp();
    const navigate = useNavigate();

    const stepData = STEPS[currentStep];

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setDirection(1);
            setCurrentStep(c => c + 1);
        } else {
            finish();
        }
    };

    const handleChoice = (_: string) => {
        handleNext();
    };

    const finish = async () => {
        completeOnboarding(name || 'Sonhador');
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-dream-500/30">
            <StarField />

            {/* Progress Bar */}
            <div className="absolute top-10 left-10 right-10 h-1 bg-slate-800/50 rounded-full overflow-hidden z-20 backdrop-blur-sm">
                <motion.div
                    className="h-full bg-gradient-to-r from-dream-500 to-purple-500 shadow-[0_0_10px_rgba(14,165,233,0.8)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                />
            </div>

            <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                    key={currentStep}
                    custom={direction}
                    initial={{ x: direction * 100, opacity: 0, scale: 0.9 }}
                    animate={{ x: 0, opacity: 1, scale: 1 }}
                    exit={{ x: direction * -100, opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
                    className="w-full max-w-md flex flex-col items-center text-center z-10"
                >

                    {stepData.type === 'info' && stepData.Icon && (
                        <>
                            <motion.div
                                className={`mb-12 relative p-8 rounded-full bg-gradient-to-tr from-slate-800/50 to-slate-900/50 border border-white/10 backdrop-blur-md shadow-2xl ${stepData.glowColor}`}
                                initial={{ rotate: -10, y: 20 }}
                                animate={{ rotate: 0, y: 0 }}
                                transition={{ duration: 0.8, type: "spring" }}
                                whileHover={{ scale: 1.1, rotate: 5 }}
                            >
                                <stepData.Icon size={120} className={`${stepData.iconColor} drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]`} strokeWidth={1} />
                                {/* Orbiting particles */}
                                <motion.div
                                    className="absolute -top-2 -right-2 w-4 h-4 bg-white rounded-full blur-[2px]"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    style={{ originX: -3, originY: 3 }}
                                />
                            </motion.div>

                            <motion.h1
                                className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                {stepData.title}
                            </motion.h1>

                            <motion.p
                                className="text-slate-300 text-lg leading-relaxed max-w-xs mx-auto font-medium"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                {stepData.description}
                            </motion.p>
                        </>
                    )}

                    {stepData.type === 'choice' && (
                        <>
                            <motion.h1 className="text-3xl font-bold mb-10">{stepData.title}</motion.h1>
                            <div className="w-full grid gap-4">
                                {stepData.options?.map((opt, idx) => (
                                    <motion.button
                                        key={opt.id}
                                        onClick={() => handleChoice(opt.id)}
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                        whileHover={{ scale: 1.02, x: 5 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full p-5 bg-slate-900/60 border border-slate-700/50 rounded-2xl flex items-center hover:bg-slate-800/80 hover:border-dream-500/30 transition-all group backdrop-blur-md relative overflow-hidden"
                                    >
                                        <div className={`p-3 rounded-xl mr-5 ${opt.color} bg-opacity-20 text-white group-hover:scale-110 transition-transform duration-300`}>
                                            <opt.icon size={24} />
                                        </div>
                                        <span className="font-bold text-lg text-slate-200 group-hover:text-white transition-colors">{opt.label}</span>
                                        <ChevronRight className="ml-auto text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />

                                        {/* Hover Glow */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                    </motion.button>
                                ))}
                            </div>
                        </>
                    )}

                    {stepData.type === 'input' && stepData.Icon && (
                        <>
                            <motion.div
                                className="mb-10 relative"
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <div className="absolute inset-0 bg-orange-500 blur-3xl opacity-20 rounded-full" />
                                <stepData.Icon size={100} className={`${stepData.iconColor} relative z-10`} />
                            </motion.div>

                            <h1 className="text-3xl font-bold mb-4">{stepData.title}</h1>
                            <p className="text-slate-400 mb-10 max-w-xs">{stepData.description}</p>

                            <div className="w-full relative group">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder={stepData.placeholder}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-slate-900/50 border-2 border-slate-700 rounded-2xl py-4 px-6 text-center text-xl font-bold focus:outline-none focus:border-dream-500 focus:bg-slate-800/80 transition-all placeholder:text-slate-600 appearance-none"
                                    onKeyDown={(e) => e.key === 'Enter' && name && finish()}
                                />
                                <div className="absolute inset-0 -z-10 bg-dream-500/20 blur-xl rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                            </div>
                        </>
                    )}

                </motion.div>
            </AnimatePresence>

            {/* Footer Actions */}
            <div className="absolute bottom-10 left-0 right-0 px-6 z-20 max-w-md mx-auto">
                {stepData.type === 'info' && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleNext}
                        className="w-full bg-gradient-to-r from-dream-600 to-blue-600 hover:from-dream-500 hover:to-blue-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-900/20 text-lg transition-all border border-white/10 relative overflow-hidden group"
                    >
                        <span className="relative z-10">CONTINUAR</span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </motion.button>
                )}

                {stepData.type === 'input' && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={finish}
                        disabled={!name}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-800 disabled:to-slate-800 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-xl shadow-purple-900/20 text-lg transition-all border border-white/10"
                    >
                        DECOLAR 🚀
                    </motion.button>
                )}
            </div>
        </div>
    );
}
