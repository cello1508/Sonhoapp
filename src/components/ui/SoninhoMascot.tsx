
interface SoninhoMascotProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showGlow?: boolean;
    variant?: 'idle' | 'painting';
}

export function SoninhoMascot({ className = '', size = 'md', showGlow = true, variant = 'idle' }: SoninhoMascotProps) {
    const sizeClasses = {
        sm: 'w-16 h-16',
        md: 'w-32 h-32',
        lg: 'w-48 h-48',
        xl: 'w-64 h-64'
    };

    const videoSources = {
        idle: "/assets/soninho_idle.mp4",
        painting: "/assets/soninho_painting.mp4"
    };

    return (
        <div className={`relative flex items-center justify-center ${sizeClasses[size]} ${className}`}>
            {showGlow && (
                <div className="absolute inset-0 bg-indigo-500/30 blur-3xl rounded-full z-0 animate-pulse" />
            )}

            <div className="relative z-10 w-full h-full rounded-3xl overflow-hidden bg-transparent transform transition-transform hover:scale-105 duration-500">
                <video
                    key={variant} // Force re-render on change
                    src={videoSources[variant]}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover scale-150"
                    style={{ mixBlendMode: 'screen' }}
                />
            </div>
        </div>
    );
}
