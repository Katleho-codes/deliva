"use client"

type Props = {
    rating: number
    max?: number
    size?: "sm" | "md" | "lg"
    interactive?: boolean
    onChange?: (rating: number) => void
}

export function StarRating({ rating, max = 5, size = "md", interactive = false, onChange }: Props) {
    const sizes = { sm: "text-sm", md: "text-xl", lg: "text-3xl" }

    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: max }).map((_, i) => (
                <button
                    key={i}
                    type="button"
                    disabled={!interactive}
                    onClick={() => interactive && onChange?.(i + 1)}
                    className={`${sizes[size]} transition-transform ${interactive ? "hover:scale-110 cursor-pointer" : "cursor-default"
                        } ${i < rating ? "text-yellow-400" : "text-slate-200"}`}
                >
                    ★
                </button>
            ))}
        </div>
    )
}