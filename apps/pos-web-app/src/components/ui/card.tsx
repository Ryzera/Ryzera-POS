import * as React from "react"
import { cn } from "@/lib/utils"

function Card({
                  className,
                  size = "default",
                  ...props
              }: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
    return (
        <div
            data-slot="card"
            data-size={size}
            className={cn(
                "group/card flex flex-col gap-4 overflow-hidden rounded-xl border border-border bg-card py-4 text-sm text-card-foreground shadow-sm data-[size=sm]:gap-3 data-[size=sm]:py-3",
                className
            )}
            {...props}
        />
    )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-header"
            className={cn(
                "group/card-header flex items-center justify-between gap-2 px-5 py-4 border-b border-border has-data-[slot=card-action]:grid has-data-[slot=card-action]:grid-cols-[1fr_auto]",
                className
            )}
            {...props}
        />
    )
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
    return (
        <h3
            data-slot="card-title"
            className={cn(
                "flex items-center gap-2 text-base font-semibold text-foreground group-data-[size=sm]/card:text-sm",
                className
            )}
            {...props}
        />
    )
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
    return (
        <p
            data-slot="card-description"
            className={cn("text-xs text-muted-foreground mt-0.5", className)}
            {...props}
        />
    )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-action"
            className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
            {...props}
        />
    )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-content"
            className={cn("p-5 group-data-[size=sm]/card:p-3", className)}
            {...props}
        />
    )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-footer"
            className={cn(
                "flex items-center px-5 py-4 border-t border-border bg-muted/50 rounded-b-xl group-data-[size=sm]/card:p-3",
                className
            )}
            {...props}
        />
    )
}

export {
    Card,
    CardHeader,
    CardFooter,
    CardTitle,
    CardAction,
    CardDescription,
    CardContent,
}