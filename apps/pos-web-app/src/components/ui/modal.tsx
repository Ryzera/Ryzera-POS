"use client"

import { X } from "lucide-react"
import { cn } from "@/lib/utils"

function Modal({
                   open,
                   onClose,
                   className,
                   children,
               }: {
    open: boolean
    onClose: () => void
    className?: string
    children: React.ReactNode
}) {
    if (!open) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className={cn("w-full max-w-lg rounded-xl border border-border bg-card shadow-xl", className)}>
                {children}
            </div>
        </div>
    )
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
    return (
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            <button
                onClick={onClose}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
                <X size={16} />
            </button>
        </div>
    )
}

export { Modal, ModalHeader }