import { X } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils"; // Assuming utils.ts has `cn`

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className={cn(
                    "bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden transform animate-in zoom-in-95 duration-200",
                    className
                )}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="px-6 py-4">
                    {children}
                </div>
            </div>
        </div>
    );
}
