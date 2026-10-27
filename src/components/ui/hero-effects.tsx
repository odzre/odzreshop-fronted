"use client"

import { Snow } from "@/components/ui/snow"
import { Meteor } from "@/components/ui/meteor"

type HeroEffectsProps = {
    effect: number
}

export function HeroEffects({ effect }: HeroEffectsProps) {
    switch (effect) {
        case 1:
            return <Snow />
        case 2:
            return <Meteor />
        default:
            return null
    }
}
