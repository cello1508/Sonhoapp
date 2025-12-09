import type { Dream } from '../../types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Tag, Star } from 'lucide-react';

export function DreamCard({ dream }: { dream: Dream }) {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-4 active:scale-[0.99] transition-transform shadow-sm">
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-dream-400 bg-dream-500/10 px-2 py-1 rounded-md uppercase tracking-wide">
                    {format(parseISO(dream.date), "dd 'de' MMM", { locale: ptBR })}
                </span>
                {dream.isLucid && (
                    <div className="flex items-center text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full text-[10px] font-bold space-x-1">
                        <Star size={10} fill="currentColor" />
                        <span>LÚCIDO</span>
                    </div>
                )}
            </div>

            <h3 className="text-lg font-bold text-white mb-2 leading-snug">{dream.title || 'Sonho sem título'}</h3>
            <p className="text-slate-400 text-sm line-clamp-3 mb-4 leading-relaxed">
                {dream.description}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                <div className="flex gap-2">
                    {dream.tags.map(tag => (
                        <span key={tag} className="text-xs text-slate-500 flex items-center">
                            <Tag size={12} className="mr-1" /> {tag}
                        </span>
                    ))}
                </div>
                <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < dream.clarity ? 'bg-dream-500' : 'bg-slate-800'}`} />
                    ))}
                </div>
            </div>
        </div>
    );
}
