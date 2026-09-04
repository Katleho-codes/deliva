"use client";

import { useCartContext } from "@/contexts/CartContext";
import { useSession } from "@/lib/auth-client";
import { TProduct } from "@/utils/types";
import { ShoppingBasketIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
type ViewProductCardProps = {
    product: TProduct;
};

export default function ViewProductCard({
    product,
}: ViewProductCardProps) {

    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = useSession()
    const { addToCart } = useCartContext()
    const [quantity, setQuantity] = useState(1)
    const handleAddToCart = (product: {
        id: number;
        name: string;
        sale_price: number;
        main_image: string;
        slug: string;
    }) => {
        addToCart({
            product_id: product.id,
            name: product.name,
            sale_price: product.sale_price,
            quantity,
            image: product.main_image,
            slug: product.slug
        });
    };
    return (
        <div className="max-w-6xl mx-auto p-4">
            <div className="grid lg:grid-cols-2 gap-6">

                {/* Images */}
                <Card className="gap-0 p-4 shadow-none border-cardline">
                    <div className="aspect-square bg-[#F5F4F0] rounded-xl overflow-hidden">
                        {product.main_image ? (
                            <img
                                src={product.main_image}
                                alt={product.name}
                                className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                        )}

                    </div>


                </Card>

                {/* Details */}
                <div className="space-y-4">

                    {/* Title Card */}
                    <Card className="gap-0 p-4 shadow-none border-cardline">

                        <div className="flex flex-wrap gap-2 mb-3">
                            {product.is_new && (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                    NEW
                                </span>
                            )}


                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF0E8] text-[#F86624]">
                                {Number(product.discount) ?? 0}% off
                            </span>

                        </div>

                        <h1 className="text-2xl font-bold text-[#191919]">
                            {product.name}
                        </h1>


                        <p className="text-sm font-medium text-gray-500 mt-1">Sold by <strong className="text-gray-800">{product.store_name}</strong></p>


                        <div className="mt-4">
                            <p className="text-3xl font-bold text-[#F86624]">
                                R{Number(product.sale_price).toFixed(2)}
                            </p>

                            {product.is_on_sale && (
                                <p className="text-sm text-[#999] line-through">
                                    R{Number(product.cost_price).toFixed(2)}
                                </p>
                            )}
                        </div>
                    </Card>

                    {/* Product Info */}
                    <Card className="gap-0 p-4 shadow-none border-cardline">

                        <h2 className="font-semibold text-[#191919] mb-3">
                            Product Details
                        </h2>

                        <div className="grid grid-cols-2 gap-3 text-sm">

                            <div>
                                <p className="text-[#999]">Category</p>
                                <p className="font-medium">{product.category}</p>
                            </div>

                            <div>
                                <p className="text-[#999]">Brand</p>
                                <p className="font-medium">
                                    {product.brand || "N/A"}
                                </p>
                            </div>

                            <div>
                                <p className="text-[#999]">SKU</p>
                                <p className="font-medium">{product.sku}</p>
                            </div>

                            <div>
                                <p className="text-[#999]">Stock</p>
                                <p
                                    className={`font-medium ${product.stock_quantity <=
                                        product.low_stock_threshold
                                        ? "text-red-500"
                                        : "text-green-600"
                                        }`}
                                >
                                    {product.stock_quantity} available
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Quantity + Cart */}
                    <Card className="gap-0 p-4 shadow-none border-cardline">

                        <div className="flex items-center gap-3 mb-4">

                            <button
                                className="w-10 h-10 rounded-lg border border-[#E5E4DF]
                        flex items-center justify-center
                        hover:border-[#F86624] hover:text-[#F86624]"
                                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            >
                                -
                            </button>

                            <span className="font-semibold text-lg w-10 text-center">
                                {quantity}
                            </span>

                            <button
                                className="w-10 h-10 rounded-lg border border-[#E5E4DF]
                        flex items-center justify-center
                        hover:border-[#F86624] hover:text-[#F86624]"
                                onClick={() =>
                                    setQuantity((q) =>
                                        Math.min(
                                            product.stock_quantity,
                                            q + 1,
                                        ),
                                    )
                                }
                            >
                                +
                            </button>

                        </div>
                        {!session ? <Button
                            disabled
                            variant="outline"
                            size="sm"
                            className="w-full text-xs"
                            onClick={(e) => e.stopPropagation()}

                        >Login to add to cart</Button> : <Button className="w-full my-2" onClick={(e) => {
                            e.stopPropagation(); handleAddToCart(product)
                        }
                        }><ShoppingBasketIcon className="w-6 h-6" />Add to cart</Button>
                        }
                    </Card>
                </div>
            </div>

            {/* Description */}
            <Card className="mt-6 gap-0 p-5 shadow-none border-cardline">
                <h2 className="font-semibold text-lg text-[#191919] mb-3">
                    Description
                </h2>

                <p className="text-[#666] leading-relaxed whitespace-pre-wrap">
                    {product.description}
                </p>
            </Card>
        </div>
    )
}
