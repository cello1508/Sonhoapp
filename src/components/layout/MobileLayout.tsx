import React from 'react';
import { cn } from '../../lib/utils';
import { BottomNav } from './BottomNav';
import ShaderBackground from '../ui/ShaderBackground';

interface MobileLayoutProps {
    children: React.ReactNode;
    showNav?: boolean;
    className?: string;
}

export function MobileLayout({ children, showNav = true, className }: MobileLayoutProps) {
    // Check if we are in a sub-page that might want to hide nav or handle layouts differently
    // For now we default to showing nav unless explicitly disabled props

    return (
        <div className="min-h-screen bg-black text-slate-100 flex justify-center relative overflow-hidden">

            {/* Global Background */}
            <div className="fixed inset-0 z-0">
                <ShaderBackground />
            </div>

            <div className={cn(
                "w-full max-w-md h-[100dvh] flex flex-col relative z-10 bg-slate-950/30 backdrop-blur-sm",
                className
            )}>
                <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
                    {children}
                </main>

                {showNav && <BottomNav />}
            </div>
        </div>
    );
}
