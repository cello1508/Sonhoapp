"use client"

import { useState, useRef, useEffect } from "react"
import { motion, useMotionValue, useTransform } from "framer-motion"
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
    const constraintsRef = useRef<HTMLDivElement>(null)
    const [width, setWidth] = useState(0)
    const x = useMotionValue(0)

    // Convert value to x position
    useEffect(() => {
        if (width > 0) {
            const percentage = (value - min) / (max - min)
            const targetX = percentage * width
            x.set(targetX)
        }
    }, [value, min, max, width, x])

    // Update width on mount/resize
    useEffect(() => {
        if (constraintsRef.current) {
            setWidth(constraintsRef.current.offsetWidth)
        }
    }, [])

    const handleDrag = () => {
        const currentX = x.get()
        const percentage = Math.max(0, Math.min(1, currentX / width))
        const newValue = Math.round((min + percentage * (max - min)) / step) * step
        if (newValue !== value) {
            onChange(newValue)
            // Haptic feedback logic could go here if supported
        }
    }

    const fillWidth = useTransform(x, [0, width], ["0%", "100%"])

    return (
        <div className={cn("w-full space-y-2", className)}>
            {label && (
                <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-slate-300">{label}</span>
                    <span className="font-bold text-dream-400">{value}%</span>
                </div>
            )}

            <div
                className="relative h-12 rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 overflow-hidden cursor-pointer touch-none"
                ref={constraintsRef}
                onClick={(e) => {
                    const rect = constraintsRef.current?.getBoundingClientRect()
                    if (rect) {
                        const clickX = e.clientX - rect.left
                        const percentage = Math.max(0, Math.min(1, clickX / width))
                        const newValue = Math.round((min + percentage * (max - min)) / step) * step
                        onChange(newValue)
                    }
                }}
            >
                {/* Fill */}
                <motion.div
                    className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-dream-600/50 to-dream-500/80"
                    style={{ width: fillWidth }}
                />

                {/* Knob */}
                <motion.div
                    className="absolute top-1 bottom-1 w-10 rounded-xl bg-white shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing z-10"
                    drag="x"
                    dragConstraints={constraintsRef}
                    dragElastic={0}
                    dragMomentum={false}
                    style={{ x }}
                    onDrag={handleDrag}
                >
                    <div className="w-1 h-4 rounded-full bg-slate-200/50" />
                </motion.div>
            </div>
        </div>
    )
}
