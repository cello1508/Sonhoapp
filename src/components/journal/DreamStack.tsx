"use client"

import { useState } from "react"
import { motion, AnimatePresence, LayoutGroup, type PanInfo } from "framer-motion"
import { cn } from "../../lib/utils"
import { Grid3X3, Layers, LayoutList, Star, Calendar } from "lucide-react"
import type { Dream } from "../../types"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

export type LayoutMode = "stack" | "grid" | "list"

export interface DreamStackProps {
    dreams?: Dream[]
    className?: string
    defaultLayout?: LayoutMode
    onDreamClick?: (dream: Dream) => void
}

const layoutIcons = {
    stack: Layers,
    grid: Grid3X3,
    list: LayoutList,
}

const SWIPE_THRESHOLD = 50

export function DreamStack({
    dreams = [],
    className,
    defaultLayout = "stack",
    onDreamClick,
}: DreamStackProps) {
    const [layout, setLayout] = useState<LayoutMode>(defaultLayout)
    const [expandedCard, setExpandedCard] = useState<string | null>(null)
    const [activeIndex, setActiveIndex] = useState(0)
    const [isDragging, setIsDragging] = useState(false)

    if (!dreams || dreams.length === 0) {
        return null
    }

    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const { offset, velocity } = info
        const swipe = Math.abs(offset.x) * velocity.x

        if (offset.x < -SWIPE_THRESHOLD || swipe < -1000) {
            // Swiped left - go to next card
            setActiveIndex((prev) => (prev + 1) % dreams.length)
        } else if (offset.x > SWIPE_THRESHOLD || swipe > 1000) {
            // Swiped right - go to previous card
            setActiveIndex((prev) => (prev - 1 + dreams.length) % dreams.length)
        }
        setIsDragging(false)
    }

    const getStackOrder = () => {
        const reordered = []
        for (let i = 0; i < dreams.length; i++) {
            const index = (activeIndex + i) % dreams.length
            reordered.push({ ...dreams[index], stackPosition: i })
        }
        return reordered.reverse() // Reverse so top card renders last (on top)
    }

    const getLayoutStyles = (stackPosition: number) => {
        switch (layout) {
            case "stack":
                return {
                    top: stackPosition * 8,
                    left: stackPosition * 8,
                    zIndex: dreams.length - stackPosition,
                    rotate: (stackPosition - 1) * 2,
                }
            case "grid":
                return {
                    top: 0,
                    left: 0,
                    zIndex: 1,
                    rotate: 0,
                }
            case "list":
                return {
                    top: 0,
                    left: 0,
                    zIndex: 1,
                    rotate: 0,
                }
        }
    }

    const containerStyles = {
        stack: "relative h-80 w-full max-w-xs mx-auto mt-10",
        grid: "grid grid-cols-2 gap-3 pb-20",
        list: "flex flex-col gap-3 pb-20",
    }

    const displayDreams = layout === "stack" ? getStackOrder() : dreams.map((d, i) => ({ ...d, stackPosition: i }))

    return (
        <div className={cn("space-y-6", className)}>
            {/* Layout Toggle */}
            <div className="flex items-center justify-center gap-1 rounded-lg bg-slate-900/50 p-1 w-fit mx-auto border border-slate-800">
                {(Object.keys(layoutIcons) as LayoutMode[]).map((mode) => {
                    const Icon = layoutIcons[mode]
                    return (
                        <button
                            key={mode}
                            onClick={() => setLayout(mode)}
                            className={cn(
                                "rounded-md p-2 transition-all",
                                layout === mode
                                    ? "bg-dream-500 text-white shadow-lg shadow-dream-500/20"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800",
                            )}
                            aria-label={`Switch to ${mode} layout`}
                        >
                            <Icon className="h-4 w-4" />
                        </button>
                    )
                })}
            </div>

            {/* Cards Container */}
            <LayoutGroup>
                <motion.div layout className={cn(containerStyles[layout], "mx-auto")}>
                    <AnimatePresence mode="popLayout">
                        {displayDreams.map((dream) => {
                            const styles = getLayoutStyles(dream.stackPosition)
                            const isExpanded = expandedCard === dream.id
                            const isTopCard = layout === "stack" && dream.stackPosition === 0

                            return (
                                <motion.div
                                    key={dream.id}
                                    layoutId={dream.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{
                                        opacity: 1,
                                        scale: isExpanded ? 1.05 : 1,
                                        x: 0,
                                        ...styles,
                                    }}
                                    exit={{ opacity: 0, scale: 0.8, x: -200 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 25,
                                    }}
                                    drag={isTopCard ? "x" : false}
                                    dragConstraints={{ left: 0, right: 0 }}
                                    dragElastic={0.7}
                                    onDragStart={() => setIsDragging(true)}
                                    onDragEnd={handleDragEnd}
                                    whileDrag={{ scale: 1.02, cursor: "grabbing" }}
                                    onClick={() => {
                                        if (isDragging) return
                                        setExpandedCard(isExpanded ? null : dream.id)
                                        onDreamClick?.(dream)
                                    }}
                                    className={cn(
                                        "cursor-pointer rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl",
                                        "hover:border-dream-500/50 transition-colors",
                                        layout === "stack" && "absolute w-full h-auto min-h-[200px] left-0 right-0",
                                        layout === "stack" && isTopCard && "cursor-grab active:cursor-grabbing",
                                        layout === "grid" && "w-full aspect-square overflow-hidden",
                                        layout === "list" && "w-full",
                                        isExpanded && "ring-2 ring-dream-500 z-50",
                                    )}
                                >
                                    <div className="flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center text-xs font-medium text-dream-400 bg-dream-500/10 px-2 py-1 rounded-md">
                                                <Calendar size={10} className="mr-1.5" />
                                                {format(parseISO(dream.date), "dd MMM", { locale: ptBR })}
                                            </div>
                                            {dream.isLucid && (
                                                <div className="p-1 rounded-full bg-yellow-500/20 text-yellow-400">
                                                    <Star size={12} fill="currentColor" />
                                                </div>
                                            )}
                                        </div>

                                        <h3 className={cn(
                                            "font-bold text-white mb-1",
                                            layout === "grid" ? "text-sm line-clamp-2" : "text-lg"
                                        )}>
                                            {dream.title}
                                        </h3>

                                        <p
                                            className={cn(
                                                "text-sm text-slate-400 mt-1",
                                                layout === "stack" && !isExpanded && "line-clamp-3",
                                                layout === "grid" && "line-clamp-3 text-xs",
                                                layout === "list" && !isExpanded && "line-clamp-2",
                                            )}
                                        >
                                            {dream.description}
                                        </p>

                                        {layout === "stack" && isTopCard && (
                                            <div className="mt-auto pt-4 flex justify-center">
                                                <div className="h-1 w-12 rounded-full bg-slate-800" />
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </motion.div>
            </LayoutGroup>

            {layout === "stack" && dreams.length > 1 && (
                <div className="flex justify-center gap-1.5 pt-4">
                    {dreams.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveIndex(index)}
                            className={cn(
                                "h-1.5 rounded-full transition-all duration-300",
                                index === activeIndex ? "w-4 bg-dream-500" : "w-1.5 bg-slate-800 hover:bg-slate-700",
                            )}
                            aria-label={`Go to dream ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
