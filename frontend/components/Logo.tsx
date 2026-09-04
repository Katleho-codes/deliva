"use client"

import { cn } from "@/lib/utils";

type LogoProps = {
    size?: "sm" | "md" | "lg";
    className?: string;
};

const sizeClasses = {
    sm: "w-7 h-7 text-sm",
    md: "w-10 h-10 text-lg",
    lg: "w-12 h-12 text-xl",
};

function Logo({ size = "md", className }: LogoProps) {
    return (
        <div
            className={cn(
                "flex items-center justify-center rounded-xl bg-linear-to-br from-[#F86624] to-[#F15025] font-bold text-white shrink-0",
                sizeClasses[size],
                className,
            )}
        >
            D
        </div>
    );
}

export default Logo;
