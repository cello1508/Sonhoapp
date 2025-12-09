import { BookOpen, User, GraduationCap, Plus, FlaskConical } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export function BottomNav() {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { icon: FlaskConical, label: "Lab", path: "/" },
        { icon: GraduationCap, label: "Aprender", path: "/learn" },
        { icon: Plus, label: "Novo", path: "/add", isAction: true },
        { icon: BookOpen, label: "Diário", path: "/journal" },
        { icon: User, label: "Perfil", path: "/profile" },
    ];

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] z-50">
            <nav className="relative flex items-center justify-between px-2 py-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl shadow-black/50">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    const isAction = item.isAction;

                    if (isAction) {
                        return (
                            <Link key={item.path} to={item.path} className="relative group mx-2">
                                <div className="absolute inset-0 bg-dream-500 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                                <div className="relative bg-dream-500 text-white p-3 rounded-full hover:scale-105 active:scale-95 transition-transform border border-white/10 shadow-lg shadow-dream-500/20">
                                    <item.icon size={24} strokeWidth={2.5} />
                                </div>
                            </Link>
                        )
                    }

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="relative flex flex-col items-center justify-center w-12 h-12"
                        >
                            {active && (
                                <motion.div
                                    layoutId="nav-pill"
                                    className="absolute inset-0 bg-white/10 rounded-full"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}

                            <motion.div
                                animate={{
                                    scale: active ? 1 : 0.9,
                                    y: active ? 0 : 2
                                }}
                                className={cn(
                                    "relative z-10 p-2 rounded-full transition-colors",
                                    active ? "text-white" : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                <item.icon size={20} strokeWidth={active ? 2.5 : 2} />
                            </motion.div>

                            {active && (
                                <motion.div
                                    layoutId="nav-indicator"
                                    className="absolute -bottom-1 w-1 h-1 bg-dream-400 rounded-full"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
