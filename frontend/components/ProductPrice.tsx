import { formatCurrency } from "@/lib/utils"

type Props = {
    sale_price: string | number
    effectivePrice: string | number
    isOnSale: boolean
    discount?: number | null
    size?: "sm" | "md" | "lg"
}

export function ProductPrice({ sale_price, effectivePrice, isOnSale, discount, size = "md" }: Props) {
    const sizes = {
        sm: { current: "text-sm font-semibold", original: "text-xs", badge: "text-xs px-1.5 py-0.5" },
        md: { current: "text-lg font-bold", original: "text-sm", badge: "text-xs px-2 py-0.5" },
        lg: { current: "text-3xl font-bold", original: "text-base", badge: "text-sm px-2 py-1" },
    }

    const s = sizes[size]

    if (!isOnSale) {
        return (
            <span className={`${s.current} text-[#191919]`}>
                {formatCurrency.format(Number(sale_price))}
            </span>
        )
    }
    return (
        <div className="flex items-center gap-2 flex-wrap">
            <span className={`${s.current} text-[#F86624]`}>
                {formatCurrency.format(Number(effectivePrice))}
            </span>
            <span className={`${s.original} text-[#999] line-through`}>
                {formatCurrency.format(Number(sale_price))}
            </span>
            {discount && (
                <span className={`${s.badge} rounded-full bg-green-100 text-green-700 font-semibold`}>
                    {discount}% off
                </span>
            )}
        </div>
    )
}