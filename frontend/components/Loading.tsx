"use client"

import { cn } from "@/lib/utils";

type LoadingProps = {
    label?: string;
    className?: string;
};

function Loading({ label = "Loading...", className }: LoadingProps) {
    return (
        <div
            className={cn(
                "grid min-h-screen place-content-center",
                className,
            )}
        >
            <p className="text-sm text-[#999] animate-pulse">{label}</p>
        </div>
    );
}

export default Loading;
