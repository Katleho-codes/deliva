"use client"
import useGetProducts from '@/hooks/products/get-products'
import { useSession } from '@/lib/auth-client'
import { formatCurrency } from '@/lib/utils'
import useProductStateStore from '@/state_stores/products_state'
import { ShoppingBasketIcon, StoreIcon, MapPin } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { ProductPrice } from './ProductPrice'

type TProductDataToSendToBackend = {
    product_id: number;
    name: string;
    sale_price: number;
    main_image: string;
    slug: string;
}
type THandleAddToCart = {
    handleAddToCart: (e: React.SyntheticEvent, data: TProductDataToSendToBackend) => void;
}
export default function ProductsDisplay({ handleAddToCart }: THandleAddToCart) {

    const { products } = useProductStateStore()
    const {
        fetchProducts,
        resetProducts,
        currentProductPage,
        totalProductPages,
        productListLoading,
    } = useGetProducts()

    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = useSession()


    const router = useRouter();

    const hasProducts = (products ?? []).some(
        (group) => (group?.products?.length ?? 0) > 0,
    );
    const showEmptyState = !productListLoading && !hasProducts;

    return (
        <>
            {showEmptyState ? (
                <Card className="flex flex-col items-center justify-center gap-0 rounded-2xl border-dashed border-cardline bg-white px-6 py-20 text-center shadow-none">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF0E8] text-[#F86624]">
                        <StoreIcon className="h-7 w-7" />
                    </div>
                    <h2 className="mt-5 text-xl font-semibold text-[#191919]">
                        No stores are selling on Deliva yet
                    </h2>
                    <p className="mt-2 max-w-md text-sm text-[#666]">
                        There aren&apos;t any products to show right now. Find stores
                        near you or be the first to open a store in your area.
                    </p>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <Button
                            asChild
                            className="bg-[#F15025] hover:bg-[#F86624]"
                        >
                            <Link href="/discover">
                                <MapPin className="h-4 w-4" />
                                Find stores near me
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/create-store">Open a store</Link>
                        </Button>
                    </div>
                </Card>
            ) : (
                <>
                    <div className="space-y-8">
                        {products && products?.map((group, idx) => (
                            <section key={`${group.category}-${idx}`}>
                                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                                    {group.category}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {group?.products?.map((product) => {
                                        const isOutOfStock = (product?.stock_quantity ?? 0) <= 0;

                                        return (
                                            <Card
                                                key={product.product_id}
                                                className="group overflow-hidden rounded-2xl border-cardline bg-white hover:shadow-md transition-shadow flex flex-col gap-0 p-0 shadow-none"

                                            >
                                                {/* image area */}
                                                <div className="relative aspect-square bg-[#F5F4F0] overflow-hidden">
                                                    {product.main_image ? (
                                                        <img
                                                            src={product.main_image}
                                                            alt={product.name}
                                                            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                                                    )}

                                                    {/* badges */}
                                                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                                                        {product.is_new && (
                                                            <span className="text-xs bg-[#191919] text-white px-2 py-0.5 rounded-full font-medium">
                                                                New
                                                            </span>
                                                        )}
                                                        {product.is_on_sale && (
                                                            <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-medium">
                                                                {product.discount}% off
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* content */}
                                                <div className="p-4 flex flex-col flex-1 gap-2">
                                                    <div className="flex-1 space-y-1">
                                                        <h3 className="font-semibold text-[#191919] truncate text-sm leading-snug">
                                                            {product.name}
                                                        </h3>
                                                        <p className="text-xs text-[#999] truncate">{product.store_name}</p>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <ProductPrice
                                                            sale_price={product.sale_price}
                                                            effectivePrice={product.effective_price}
                                                            isOnSale={product.is_on_sale}
                                                            discount={product.discount}
                                                            size="sm"
                                                        />
                                                        <span className={`text-xs font-medium ${isOutOfStock ? "text-red-500" : "text-green-600"
                                                            }`}>
                                                            {isOutOfStock ? "Out of stock" : "In stock"}
                                                        </span>
                                                    </div>

                                                    {!session ? (
                                                        <Button
                                                            disabled
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full text-xs"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            Login to add to cart
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            disabled={isOutOfStock}
                                                            size="sm"
                                                            className="w-full gap-1.5 bg-[#F15025] hover:bg-[#F86624] text-xs"
                                                            onClick={(e) => handleAddToCart(e, product)}
                                                        >
                                                            <ShoppingBasketIcon className="w-4 h-4" />
                                                            {isOutOfStock ? "Out of stock" : "Add to cart"}
                                                        </Button>
                                                    )}
                                                </div>
                                            </Card>
                                        );
                                    })}
                                </div>

                            </section>
                        ))}
                    </div>


                    <div className="flex gap-2 justify-center my-4 py-3">
                        {currentProductPage < totalProductPages && (
                            <Button
                                onClick={() => fetchProducts(currentProductPage + 1)}
                                disabled={productListLoading}
                            >
                                {productListLoading ? "Loading..." : "See more items"}
                            </Button>
                        )}

                        {currentProductPage > 1 && (
                            <Button
                                variant="outline"
                                onClick={resetProducts}
                            >
                                Reset
                            </Button>
                        )}
                    </div>
                </>
            )}
        </>
    )
}
