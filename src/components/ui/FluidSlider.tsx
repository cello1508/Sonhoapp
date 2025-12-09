"use client"

import { useState, useRef, useEffect } from "react"
import { motion, useSpring, useTransform, useMotionValue } from "framer-motion"
import { cn } from "../../lib/utils"

interface FluidSliderProps {
    value: number
    onChange: (value: number) => void
    min?: number
    max?: number
    step?: number
    label?: string
    className?: string
}

export function FluidSlider({
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    label,
    className
}: FluidSliderProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [width, setWidth] = useState(0)

    // We use a motion value for raw drag position, but sync it to state
    const x = useMotionValue(0)

    // Create a spring that follows 'x' but with "Apple-like" physics (responsive but smooth)
    const springX = useSpring(x, { stiffness: 300, damping: 30, mass: 0.8 })

    // Update width on mount/resize
    useEffect(() => {
        if (containerRef.current) {
            setWidth(containerRef.current.offsetWidth)
        }
        // Small observer in case of responsive layout changes
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setWidth(entry.contentRect.width)
            }
        });
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [])

    // Sync spring to external value changes (except when dragging, handled by drag controls usually, 
    // but here we are doing custom drag or click)
    useEffect(() => {
        if (width > 0) {
            const percentage = (value - min) / (max - min)
            const targetX = percentage * width
            // We set the motion value, the spring follows
            x.set(targetX)
        }
    }, [value, min, max, width, x])

    const handleInteract = (clientX: number) => {
        if (!containerRef.current || width === 0) return

        const rect = containerRef.current.getBoundingClientRect()
        const clickX = clientX - rect.left

        // Clamp 0 to 1
        let percentage = clickX / width
        percentage = Math.max(0, Math.min(1, percentage))

        // Calculate snapped value
        const rawValue = min + percentage * (max - min)
        const snappedValue = Math.round(rawValue / step) * step

        // Update parent
        onChange(snappedValue)
    }

    // Transform spring X to a percentage string for the width
    // We Map x (pixels) back to percentage 0-100% just for standard CSS usage if needed,
    // or use style={{ width: springX }} directly if pixels.
    // Let's use useTransform to get a % for the fill, ensuring it never exceeds bounds visually.
    const fillWidth = useTransform(springX, (latest) => {
        if (width === 0) return "0%"
        const p = (latest / width) * 100
        return `${Math.max(0, Math.min(100, p))}%`
    })

    return (
        <div className={cn("w-full space-y-3", className)}>
            {label && (
                <div className="flex justify-between items-end px-1">
                    <span className="text-sm font-semibold text-slate-400 tracking-wide uppercase">{label}</span>
                    <span className="text-xl font-bold text-dream-400 font-mono">
                        {value} / {max}
                    </span>
                </div>
            )}

            <motion.div
                ref={containerRef}
                className="relative h-14 w-full rounded-2xl bg-slate-900/50 backdrop-blur-md border border-slate-800/50 overflow-hidden cursor-pointer touch-none shadow-inner"
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onPointerDown={(e) => handleInteract(e.clientX)}
                onPointerMove={(e) => {
                    // Only drag if primary button is pressed
                    if (e.buttons === 1) {
                        handleInteract(e.clientX)
                    }
                }}
            >
                {/* Background Track Patterns/ticks (optional visual flair) */}
                <div className="absolute inset-0 flex justify-between px-4 items-center opacity-10 pointer-events-none">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-0.5 h-3 bg-white rounded-full" />
                    ))}
                </div>

                {/* Filled Bar */}
                <motion.div
                    className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-dream-600 to-dream-400 shadow-[0_0_20px_rgba(56,189,248,0.3)]"
                    style={{ width: fillWidth }}
                />

                {/* Glint/Gloss effect on top */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

                {/* Knob (Visual only, follows tip of bar) */}
                <motion.div
                    className="absolute top-1/2 -translate-y-1/2 h-8 w-1.5 bg-white rounded-full shadow-md z-10 pointer-events-none"
                    style={{ x: springX, left: -3 }} // Offset slightly to center on edge
                />
            </motion.div>
        </div>
    )
}
