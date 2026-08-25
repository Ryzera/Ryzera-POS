import { cn } from "@/lib/utils"

function Label({ className, ...props }: React.ComponentProps<"label">) {
    return (
        <label
            data-slot="label"
            className={cn(
                "mb-1.5 block text-xs font-medium text-muted-foreground select-none",
                className
            )}
            {...props}
        />
    )
}

export { Label }