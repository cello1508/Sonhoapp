import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { MobileLayout } from '../components/layout/MobileLayout';
import { Mail, Lock, Loader, ArrowRight } from 'lucide-react';
import { ShaderBackground } from '../components/ui/ShaderBackground';

export function Login() {
    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        try {
            if (isSignUp) {
                const { error } = await signUp(email, password);
                if (error) throw error;
                setSuccessMsg('Conta criada! Verifique seu email se necessário, ou tente entrar.');
                setIsSignUp(false); // Switch to login view
            } else {
                const { error } = await signIn(email, password);
                if (error) throw error;
                navigate(from, { replace: true });
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Ocorreu um erro. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <MobileLayout showNav={false}>
            <div className="relative min-h-screen flex flex-col justify-center px-6">
                <ShaderBackground />

                <div className="relative z-10 w-full max-w-sm mx-auto space-y-8">
                    <div className="text-center space-y-2">
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            {isSignUp ? 'Criar Conta' : 'Bem-vindo'}
                        </h1>
                        <p className="text-slate-400">
                            {isSignUp ? 'Comece sua jornada onírica' : 'Continue sua exploração'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                <input
                                    type="email"
                                    required
                                    placeholder="Seu email"
                                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-12 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-dream-500 focus:ring-1 focus:ring-dream-500/50 transition-all backdrop-blur-sm"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                <input
                                    type="password"
                                    required
                                    placeholder="Sua senha"
                                    minLength={6}
                                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-12 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-dream-500 focus:ring-1 focus:ring-dream-500/50 transition-all backdrop-blur-sm"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        {successMsg && (
                            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm text-center">
                                {successMsg}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-dream-600 hover:bg-dream-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-dream-900/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {loading ? (
                                <Loader className="animate-spin" />
                            ) : (
                                <>
                                    <span>{isSignUp ? 'Criar Conta' : 'Entrar na Mente'}</span>
                                    {!isSignUp && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center">
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-slate-500 hover:text-white transition-colors text-sm font-medium"
                        >
                            {isSignUp ? 'Já tem uma conta? Entrar' : 'Não tem conta? Criar agora'}
                        </button>
                    </div>
                </div>
            </div>
        </MobileLayout>
    );
}
