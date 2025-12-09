

interface HeaderProps {
    title?: string;
    subtitle?: string;
    rightAction?: React.ReactNode;
}

export function Header({ title, subtitle, rightAction }: HeaderProps) {
    return (
        <header className="px-6 py-6 flex justify-between items-start bg-gradient-to-b from-slate-900/50 to-transparent sticky top-0 z-10 backdrop-blur-sm">
            <div>
                {subtitle && <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{subtitle}</p>}
                {title && <h1 className="text-2xl font-bold text-white leading-tight">{title}</h1>}
            </div>
            {rightAction && <div>{rightAction}</div>}
        </header>
    );
}
