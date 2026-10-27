import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "w-full rounded-lg border border-border/50 bg-input px-3 h-9 origin-left text-[16px] md:text-sm text-muted-foreground placeholder:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)

Input.displayName = "Input"

export { Input }