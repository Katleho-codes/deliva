"use client"
import { Button } from '@/components/ui/button'
import { useCartContext } from '@/contexts/CartContext'
import useGetProduct from '@/hooks/products/get-product'
import { useSession } from '@/lib/auth-client'
import { formatCurrency } from '@/lib/utils'
import useProductStateStore from '@/state_stores/products_state'
import { Badge, ChevronRight, ImageOff, ShoppingCart, Store } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'

export default function ProductScreen() {
    const { slug } = useParams()
    const { productLoading } = useGetProduct(slug as string)
    const { product } = useProductStateStore()
    const { addToCart } = useCartContext()
    const [quantity, setQuantity] = useState(1)
    const [activeImage, setActiveImage] = useState<"main" | "two">("main")

    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = useSession()

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
            sale_price: Number(product.sale_price),
            quantity,
            image: product.main_image,
            slug: product.slug
        });
    };


    if (productLoading) return (
        <div className="min-h-screen">
            <div className="max-w-5xl mx-auto px-4 py-10">
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="aspect-square rounded-2xl bg-slate-200 animate-pulse" />
                    <div className="space-y-4">
                        <div className="h-6 bg-slate-200 rounded animate-pulse w-3/4" />
                        <div className="h-4 bg-slate-200 rounded animate-pulse w-1/2" />
                        <div className="h-10 bg-slate-200 rounded animate-pulse w-1/3" />
                        <div className="h-24 bg-slate-200 rounded animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    )

    if (!product) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-3">
                <p className="text-2xl">📦</p>
                <p className="font-medium">Product not found</p>
                <Link href="/">
                    <Button variant="outline">Back to home</Button>
                </Link>
            </div>
        </div>
    )

    const isOutOfStock = product.stock_quantity === 0
    const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5
    const hasDiscount = product.discount && Number(product.discount) > 0
    const images = [
        product.main_image,
        ...(product.image_two ? [product.image_two] : [])
    ].filter(Boolean)

    const activeImageUrl = activeImage === "main" ? product.main_image : product.image_two

    return (
        <div className="min-h-screen">
            <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

                {/* breadcrumb */}
                <nav className="flex items-center gap-1.5 text-sm text-muted-foreground min-w-0">
                    <Link href="/" className="hover:text-foreground shrink-0">Home</Link>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                    <Link
                        href={`/stores/${product.store_slug}`}
                        className="hover:text-foreground truncate max-w-30"
                    >
                        {product.store_name}
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-foreground truncate min-w-0">{product.name}</span>
                </nav>

                {/* main content */}
                <div className="grid md:grid-cols-2 gap-8">

                    {/* images */}
                    <div className="space-y-3">
                        <div className="aspect-square rounded-2xl border bg-white overflow-hidden flex items-center justify-center">
                            {activeImageUrl ? (
                                <img
                                    src={activeImageUrl}
                                    alt={product.name}
                                    className="w-full h-full object-contain p-4"
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                    <ImageOff className="h-12 w-12" />
                                    <p className="text-sm">No image</p>
                                </div>
                            )}
                        </div>

                        {/* thumbnails */}
                        {images.length > 1 && (
                            <div className="flex gap-2">
                                {images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveImage(index === 0 ? "main" : "two")}
                                        className={`w-16 h-16 rounded-xl border-2 overflow-hidden bg-white transition-all ${(index === 0 && activeImage === "main") ||
                                            (index === 1 && activeImage === "two")
                                            ? "border-orange-400"
                                            : "border-slate-200"
                                            }`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-contain p-1" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* details */}
                    <div className="space-y-5">

                        {/* category + brand */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {product.category && (
                                <Badge className="text-xs">
                                    {product.category}
                                </Badge>
                            )}
                            {product.brand && (
                                <Badge className="text-xs">
                                    {product.brand}
                                </Badge>
                            )}
                        </div>

                        {/* name */}
                        <h1 className="text-2xl font-bold leading-tight">{product.name}</h1>

                        {/* store */}
                        <Link
                            href={`/stores/${product.store_slug}`}
                            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                        >
                            <Store className="h-3.5 w-3.5" />
                            {product.store_name}
                        </Link>

                        {/* sale_price */}
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold">
                                {formatCurrency.format(Number(product.sale_price))}
                            </span>
                            {hasDiscount && (
                                <span className="text-sm text-muted-foreground line-through">
                                    {formatCurrency.format(
                                        Number(product.sale_price) / (1 - Number(product.discount) / 100)
                                    )}
                                </span>
                            )}
                            {hasDiscount && (
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                    {product.discount}% off
                                </Badge>
                            )}
                        </div>

                        {/* stock status */}
                        {isOutOfStock ? (
                            <p className="text-sm font-medium text-red-500">Out of stock</p>
                        ) : isLowStock ? (
                            <p className="text-sm font-medium text-orange-500">
                                Only {product.stock_quantity} left
                            </p>
                        ) : (
                            <p className="text-sm text-green-600 font-medium">In stock</p>
                        )}

                        {/* description */}
                        {product.description && (
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {product.description}
                            </p>
                        )}

                        {/* sku */}
                        <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>

                        {/* quantity + add to cart */}
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center gap-3">
                                <p className="text-sm font-medium">Quantity</p>
                                <div className="flex items-center border rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="w-9 h-9 flex items-center justify-center hover:bg-slate-50 text-lg"
                                        disabled={quantity <= 1}
                                    >
                                        −
                                    </button>
                                    <span className="w-10 text-center text-sm font-medium">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))}
                                        className="w-9 h-9 flex items-center justify-center hover:bg-slate-50 text-lg"
                                        disabled={quantity >= product.stock_quantity}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            {!session ? <Button disabled className="w-full my-2">Login to add to cart</Button> :

                                <Button
                                    className="w-full gap-2 bg-orange-500 hover:bg-orange-600"
                                    disabled={isOutOfStock}
                                    onClick={() => {
                                        handleAddToCart(product)
                                    }}
                                >
                                    <ShoppingCart className="h-4 w-4" />
                                    {isOutOfStock ? "Out of stock" : "Add to cart"}
                                </Button>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
