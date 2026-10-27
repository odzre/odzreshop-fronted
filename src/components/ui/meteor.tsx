"use client"

import { useMemo } from "react"

type Meteor = {
    left: number
    delay: number
    duration: number
}

type MeteorProps = {
    count?: number
}

export function Meteor({ count = 40 }: MeteorProps) {
    const meteors = useMemo<Meteor[]>(() => {
        return Array.from({ length: count }).map(() => ({
            left: Math.floor(Math.random() * 3000 - 1500), // -1500px s/d +1500px
            delay: Math.random() * 0.8,
            duration: Math.floor(Math.random() * 7) + 3, // 3–10s
        }))
    }, [count])

    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {meteors.map((m, i) => (
                <span
                    key={i}
                    className="absolute top-[-20px] left-1/2 h-1 w-1 rounded-full bg-white
                     shadow-[0_0_0_1px_#ffffff10]
                     before:absolute before:top-1/2 before:left-0
                     before:h-[1px] before:w-[80px]
                     before:bg-gradient-to-r before:from-white before:to-transparent
                     animate-meteor"
                    style={{
                        left: `${m.left}px`,
                        animationDelay: `${m.delay}s`,
                        animationDuration: `${m.duration}s`,
                    }}
                />
            ))}
        </div>
    )
}
