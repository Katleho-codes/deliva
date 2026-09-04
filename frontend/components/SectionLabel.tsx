"use client"

import { cn } from "@/lib/utils";

type SectionLabelProps = {
    children: React.ReactNode;
    tone?: "brand" | "muted";
    className?: string;
};

function SectionLabel({
    children,
    tone = "brand",
    className,
}: SectionLabelProps) {
    return (
        <span
            className={cn(
                "text-xs font-semibold uppercase tracking-widest",
                tone === "brand" ? "text-[#F86624]" : "text-[#999]",
                className,
            )}
        >
            {children}
        </span>
    );
}

export default SectionLabel;
