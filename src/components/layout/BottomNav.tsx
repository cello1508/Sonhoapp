import { Moon, BookOpen, User, GraduationCap, Plus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

export function BottomNav() {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return ( // Fixed position at bottom of the MobileLayout container
        <nav className="h-16 bg-slate-900 border-t border-slate-800 grid grid-cols-5 items-center px-2 shrink-0">
            <NavItem icon={Moon} label="Sonhos" to="/" active={isActive('/')} />
            <NavItem icon={GraduationCap} label="Aprender" to="/learn" active={isActive('/learn')} />

            <div className="flex justify-center -mt-8">
                <Link to="/add">
                    <div className="bg-dream-500 hover:bg-dream-400 text-white p-4 rounded-full shadow-lg shadow-dream-500/20 transition-all active:scale-95">
                        <Plus size={28} />
                    </div>
                </Link>
            </div>

            <NavItem icon={BookOpen} label="Diário" to="/journal" active={isActive('/journal')} />
            <NavItem icon={User} label="Perfil" to="/profile" active={isActive('/profile')} />
        </nav>
    );
}

function NavItem({ icon: Icon, label, to, active }: { icon: any, label: string, to: string, active: boolean }) {
    return (
        <Link to={to} className="flex flex-col items-center justify-center space-y-1 h-full w-full active:scale-95 transition-transform">
            <Icon size={24} className={cn("transition-colors", active ? "text-dream-400 fill-dream-400/20" : "text-slate-500")} />
            <span className={cn("text-[10px] font-medium transition-colors", active ? "text-dream-400" : "text-slate-500")}>
                {label}
            </span>
        </Link>
    );
}
