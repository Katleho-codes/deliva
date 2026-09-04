"use client"

import { cn } from "@/lib/utils";

type EmptyStateProps = {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
};

function EmptyState({
    icon,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center gap-2 text-center px-6 py-12",
                className,
            )}
        >
            {icon && <div className="text-3xl">{icon}</div>}
            <p className="font-medium text-[#191919]">{title}</p>
            {description && (
                <p className="text-sm text-[#999] max-w-sm">{description}</p>
            )}
            {action && <div className="mt-3">{action}</div>}
        </div>
    );
}

export default EmptyState;
