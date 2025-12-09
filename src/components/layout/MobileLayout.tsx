import React from 'react';
import { BottomNav } from './BottomNav';

interface MobileLayoutProps {
    children: React.ReactNode;
    showNav?: boolean;
}

export function MobileLayout({ children, showNav = true }: MobileLayoutProps) {
    return (
        <div className="min-h-screen bg-black flex justify-center text-slate-100 font-sans">
            <div className="w-full max-w-md h-[100dvh] bg-slate-950 flex flex-col relative shadow-2xl overflow-hidden">
                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide pb-20">
                    {children}
                </main>

                {/* Navigation */}
                {showNav && (
                    <div className="absolute bottom-0 left-0 right-0 z-50">
                        <BottomNav />
                    </div>
                )}
            </div>
        </div>
    );
}
