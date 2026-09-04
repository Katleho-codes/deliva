import React, { useCallback, useRef } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CartItemCardProps {
    image?: string;
    name?: string;
    sale_price?: number | bigint | undefined | any;
    quantity?: number;
    onQuantityChange?: (newQuantity: number) => void;
    onRemove?: () => void;
}

export default function CartItemCard({
    image,
    name,
    sale_price,
    quantity = 1,
    onQuantityChange,
    onRemove
}: CartItemCardProps) {
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const handleDecrease = () => {
        if (quantity > 1 && onQuantityChange) {
            onQuantityChange(quantity - 1);
        }
    };


    const handleIncrease = useCallback(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            if (onQuantityChange) onQuantityChange(quantity + 1);
        }, 300);
    }, [quantity, onQuantityChange]);


    const formatter = new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
    });
    return (
        <div className="flex gap-3 rounded-xl mb-2 bg-white p-3 border border-[#E5E4DF] hover:shadow-sm transition-shadow">
            {/* image */}
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#F5F4F0] p-2">
                {image ? (
                    <img src={image} alt={name} className="h-full w-full object-contain" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                )}
            </div>

            {/* content — outside image div */}
            <div className="flex flex-1 flex-col justify-between min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <h3 className="font-semibold text-sm text-[#191919] truncate">{name}</h3>
                        <p className="text-sm font-bold text-[#F86624] mt-0.5">
                            {formatter.format(Number(sale_price))}
                        </p>
                    </div>
                    {onRemove && (
                        <button
                            onClick={onRemove}
                            className="text-[#ccc] hover:text-red-400 transition-colors shrink-0 p-1"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* quantity */}
                <div className="flex items-center gap-2 mt-2">
                    <button
                        onClick={handleDecrease}
                        disabled={quantity <= 1}
                        className="w-7 h-7 rounded-lg border border-[#E5E4DF] flex items-center justify-center text-[#666] hover:border-[#F86624] hover:text-[#F86624] disabled:opacity-40 transition-colors"
                    >
                        <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold text-[#191919]">
                        {quantity}
                    </span>
                    <button
                        onClick={handleIncrease}
                        className="w-7 h-7 rounded-lg border border-[#E5E4DF] flex items-center justify-center text-[#666] hover:border-[#F86624] hover:text-[#F86624] transition-colors"
                    >
                        <Plus className="h-3 w-3" />
                    </button>
                </div>
            </div>
        </div>
    );
}