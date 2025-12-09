import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ChevronRight, Moon, Sparkles, Feather, Palette, Brain, Shield, Clock, Smile, Frown, Rocket, Share, PlusSquare, Smartphone, BookOpen, Copy } from 'lucide-react';
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
        id: 'install',
        type: 'install',
        title: 'Instale o App',
        description: 'Para a melhor experiência, adicione à sua tela inicial.',
        Icon: Smartphone,
        iconColor: 'text-white'
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

    const { completeOnboarding, hasCompletedOnboarding } = useApp();
    const { user } = useAuth(); // Get user to update DB
    const navigate = useNavigate();

    const stepData = STEPS[currentStep];

    // Redirect if already completed
    useEffect(() => {
        if (hasCompletedOnboarding) {
            navigate('/', { replace: true });
        }
    }, [hasCompletedOnboarding, navigate]);

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
        // 1. Mark local state
        completeOnboarding(name || 'Sonhador');

        // 2. Mark remote state explicitely for reliability
        if (user) {
            await authService.updateOnboardingStatus(user.id, true);
        }

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

                    {stepData.type === 'install' && (
                        <div className="w-full flex flex-col items-center">
                            <motion.div
                                className="mb-8 relative p-6 bg-slate-900/80 rounded-[3rem] border-4 border-slate-700 shadow-2xl overflow-hidden"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                            >
                                {/* Mobile Screen Mock */}
                                <div className="w-56 h-96 bg-black rounded-[2rem] relative overflow-hidden flex flex-col items-center justify-end border border-slate-800">
                                    <div className="absolute inset-0 bg-gradient-to-br from-dream-900 to-slate-900 opacity-50" />

                                    {/* App Icon Preview */}
                                    <div className="absolute top-20 flex flex-col items-center">
                                        <div className="w-16 h-16 bg-dream-500 rounded-xl mb-2 shadow-lg shadow-dream-500/30 flex items-center justify-center">
                                            <Moon className="text-white fill-white" size={32} />
                                        </div>
                                        <div className="text-[10px] text-white font-medium">SonhoApp</div>
                                    </div>

                                    {/* Safari Bottom Bar Mock */}
                                    <div className="w-full h-12 bg-slate-800/90 backdrop-blur-md border-t border-slate-700 flex items-center justify-center relative z-10 gap-8">
                                        <div className="w-6 h-6 rounded text-slate-500"><ChevronRight className="rotate-180 opacity-50" size={20} /></div>
                                        <div className="w-6 h-6 rounded text-slate-500"><ChevronRight className="opacity-50" size={20} /></div>

                                        {/* Share Icon Target */}
                                        <div className="relative">
                                            <div className="w-6 h-6 text-blue-400"><Share size={20} /></div>
                                            <motion.div
                                                className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center w-max"
                                                animate={{ y: [0, -5, 0] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            >
                                                <div className="text-xs font-bold text-white mb-1">1. Toque aqui</div>
                                                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-white mx-auto rotate-180" />
                                            </motion.div>
                                        </div>

                                        <div className="w-6 h-6 rounded text-slate-500"><BookOpen size={20} /></div>
                                        <div className="w-6 h-6 rounded text-slate-500"><Copy size={20} /></div>
                                    </div>

                                    {/* Menu Popup Mock */}
                                    <motion.div
                                        className="absolute bottom-2 left-2 right-2 bg-slate-800/95 backdrop-blur-xl rounded-xl p-2 border border-white/10 z-20"
                                        initial={{ y: 100, opacity: 0 }}
                                        animate={{ y: -60, opacity: 1 }}
                                        transition={{ delay: 2, duration: 0.5 }}
                                    >
                                        <div className="flex items-center p-2 rounded-lg bg-white/10 border border-white/5">
                                            <PlusSquare className="text-white mr-3" size={20} />
                                            <div className="text-left">
                                                <div className="text-[10px] font-bold text-white">Adicionar à Tela de Início</div>
                                            </div>
                                        </div>
                                        <motion.div
                                            className="absolute -right-4 top-1/2 -translate-y-1/2 flex items-center"
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 3 }}
                                        >
                                            <div className="text-xs font-bold text-white mr-2">2. Selecione</div>
                                            <ChevronRight className="text-white rotate-180" size={16} />
                                        </motion.div>
                                    </motion.div>

                                </div>
                            </motion.div>

                            <h1 className="text-3xl font-bold mb-4">{stepData.title}</h1>
                            <p className="text-slate-400 mb-8 max-w-xs">{stepData.description}</p>
                        </div>
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
                {(stepData.type === 'info' || stepData.type === 'install') && (
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
