"use client"

import MainNav from "@/components/MainNav";
import { ProductPrice } from "@/components/ProductPrice";
import ReviewSection from "@/components/ReviewSection";
import { StarRating } from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCartContext } from "@/contexts/CartContext";
import useGetStoreByName from "@/hooks/stores/get-store-by-name";
import { useSession } from "@/lib/auth-client";
import { formatCurrency } from "@/lib/utils";
import useStoresStateStore from "@/state_stores/stores_state";
import { Mail, MapPin, Phone, ShieldCheck, ShoppingBasketIcon } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type SortContentProps = {
    sortItem: string;
    handleSortItemChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};
type FilterContentProps = {
    brand: string;
    handleBrandChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    category: string;
    handleCategoryChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
};
function ViewStoreScreen() {
    const params = useParams(); // Fetch URL parameters
    const name = typeof params.name === "string" ? params.name : undefined;
    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = useSession()




    const { addToCart } = useCartContext()
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
            quantity: 1,
            image: product.main_image,
            slug: product.slug
        });
    };

    const router = useRouter();
    const searchParams = useSearchParams();
    const { store } = useStoresStateStore();
    const { storeListLoading, totalProductsByStore
    } = useGetStoreByName(name, searchParams.toString());

    const [sheetOpen, setSheetOpen] = useState(false);
    const [sheetView, setSheetView] = useState<"filter" | "sort" | null>(null);
    const [activeTab, setActiveTab] = useState<"products" | "reviews">("products")

    const [sortItem, setSortItem] = useState(searchParams.get("sort") ?? "");
    const [category, setCategory] = useState(searchParams.get("category") ?? "");
    const [brand, setBrand] = useState(searchParams.get("brand") ?? "");
    // Keep local state in sync if user navigates back/forward
    useEffect(() => {
        setSortItem(searchParams.get("sort") ?? "");
        setCategory(searchParams.get("category") ?? "");
        setBrand(searchParams.get("brand") ?? "");
    }, [searchParams]);

    const handleBrandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBrand(e.target.value);
    };
    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCategory(e.target.value);
    };
    const handleSortChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setSortItem(e.target.value);
    };


    const applyParams = (e: React.SyntheticEvent) => {
        e.preventDefault();

        const next = new URLSearchParams(searchParams.toString());

        // Set or remove sort
        if (sortItem) {
            next.set("sort", sortItem);
        } else {
            next.delete("sort");
        }

        // Set or remove filter
        if (category) {
            next.set("category", category);
        } else {
            next.delete("category");
        }
        if (brand) {
            next.set("brand", brand);
        } else {
            next.delete("brand");
        }

        // Reset to page 1 whenever sort/filter changes
        next.set("page", "1");

        router.push(`?${next.toString()}`);
        setSheetOpen(false)
    };

    const clearParams = () => {
        setSortItem("");
        setCategory("");
        setBrand("");
        router.push("?"); // back to original data, no query string
        setSheetOpen(false)
    };

    if (store?.products.length === 0) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-3">
                <p className="text-2xl">📦</p>
                <p className="font-medium">Store has no products currently</p>
                <Button variant="outline" onClick={() => router.push("/")}>Back to home</Button>
            </div>
        </div>
    )
    // if (storeListLoading) return <p>Loading store...</p>
    if (storeListLoading) return (
        <div className="min-h-screen bg-[#FAFAF8]">
            <div className="h-48 bg-slate-100 animate-pulse" />
            <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
                <div className="h-8 bg-slate-100 rounded animate-pulse w-48" />
                <div className="h-4 bg-slate-100 rounded animate-pulse w-72" />
            </div>
        </div>
    )
    return (
        <>
            <MainNav />
            <div className="lg:mx-auto lg:container max-w-7xl mx-auto px-6 lg:px-8 pb-3">
                {/* banner */}
                <div className="h-48 md:h-64 relative overflow-hidden bg-linear-to-br from-[#F86624]/10 to-[#F15025]/20">
                    {store?.banner_url && (
                        <img src={store?.banner_url} alt={store?.name}
                            className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
                </div>
                <div className="max-w-4xl mx-auto px-4">
                    {/* store header */}
                    <div className="bg-white rounded-2xl border border-[#E5E4DF] p-6 -mt-8 relative z-10 mb-6">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold text-[#191919]">{store?.name}</h1>

                                    <ShieldCheck className="h-5 w-5 text-blue-500" />

                                </div>
                                {store?.description && (
                                    <p className="text-sm text-[#666] max-w-lg">{store?.description}</p>
                                )}
                                <div className="flex items-center gap-2 pt-1">
                                    <StarRating rating={Number(store?.average_rating)} size="sm" />
                                    <span className="text-sm text-[#666]">
                                        {store && store?.average_rating > 0
                                            ? `${store?.average_rating} · ${store?.total_reviews} review${store?.total_reviews !== 1 ? "s" : ""}`
                                            : "No reviews yet"
                                        }
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1.5 text-sm text-[#666]">
                                {store?.city && store?.province && (
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                                        {store?.city}, {store?.province}
                                    </div>
                                )}
                                {store?.phone && (
                                    <div className="flex items-center gap-1.5">
                                        <Phone className="h-3.5 w-3.5 shrink-0" />
                                        {store?.phone}
                                    </div>
                                )}
                                {store?.email && (
                                    <div className="flex items-center gap-1.5">
                                        <Mail className="h-3.5 w-3.5 shrink-0" />
                                        {store?.email}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* tabs */}
                    <Card className="flex gap-1 mb-6 bg-white rounded-xl border border-cardline p-1 w-fit shadow-none">
                        {(["products", "reviews"] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${activeTab === tab
                                    ? "bg-[#191919] text-white"
                                    : "text-[#666] hover:text-[#191919]"
                                    }`}
                            >
                                {tab}
                                {tab === "reviews" && store && store?.total_reviews > 0 && (
                                    <span className="ml-1.5 text-xs opacity-70">({store.total_reviews})</span>
                                )}
                            </button>
                        ))}
                    </Card>
                    {/* products tab */}
                    {activeTab === "products" && (
                        <>
                            <div className="space-x-2 mb-3">
                                <Button
                                    className=""
                                    onClick={() => {
                                        setSheetView("sort");
                                        setSheetOpen(true);
                                    }}
                                >
                                    Sort
                                </Button>
                                <Button
                                    className=""
                                    onClick={() => {
                                        setSheetView("filter");
                                        setSheetOpen(true);
                                    }}
                                >
                                    Filter
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                {store && store?.products.length === 0 ? (
                                    <div className="col-span-full py-16 text-center">
                                        <p className="text-[#999]">No products yet</p>
                                    </div>
                                ) : store?.products.map(product => (
                                    <div
                                        key={product.id}
                                        className="group overflow-hidden rounded-xl bg-white border border-sm border-[#eee]"
                                    >

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
                                        {/* Content */}                            <div className="p-6">
                                            <h3 className="mb-2 font-semibold text-neutral-900 truncate">
                                                {product.name}
                                            </h3>
                                            <p className='text-sm truncate'>{name}</p>


                                            <p className="font-bold text-neutral-900">
                                                {formatCurrency.format(product.sale_price)}
                                            </p>
                                            {!session ? <Button disabled className="w-full my-2">Login to add to cart</Button> : <Button className="w-full my-2" onClick={() => handleAddToCart(product)}><ShoppingBasketIcon className="w-6 h-6" />Add to cart</Button>
                                            }
                                        </div>

                                    </div>

                                ))}
                            </div>
                        </>

                    )}

                    {/* reviews tab */}
                    {activeTab === "reviews" && (
                        <div className="pb-10">
                            <ReviewSection slug={store?.slug as string} />
                        </div>
                    )}
                </div>

                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetContent className="px-1" side="left">
                        <SheetHeader>
                            {sheetView === "sort" && <SheetTitle>Sort</SheetTitle>}
                            {sheetView === "filter" && <SheetTitle>Filter</SheetTitle>}
                            <SheetDescription>This action cannot be undone.</SheetDescription>
                        </SheetHeader>
                        {sheetView === "sort" && <SortContent sortItem={sortItem} handleSortItemChange={handleSortChange} />}
                        {sheetView === "filter" && <FilterContent category={category} handleCategoryChange={handleCategoryChange} brand={brand} handleBrandChange={handleBrandChange} />}

                        <SheetFooter>
                            <div className="flex items-center gap-2">
                                <Button className="block flex-1" variant="outline" type="button" onClick={clearParams}>Clear</Button>
                                <Button className="block flex-1" type="button" onClick={applyParams}>Show results</Button>
                            </div>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </div>

        </>

    )
}

const SortContent = ({
    sortItem,
    handleSortItemChange,
}: SortContentProps) => {
    return (
        <div className="px-2">
            <div>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name="sort_items"
                        value="newest"
                        checked={sortItem === 'newest'}
                        onChange={handleSortItemChange}
                    /> Newest
                </label>
            </div>
            <div>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name="sort_items"
                        value="lowest"
                        checked={sortItem === 'lowest'}
                        onChange={handleSortItemChange}
                    /> Lowest price
                </label>
            </div>
            <div>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name="sort_items"
                        value="highest"
                        checked={sortItem === 'highest'}
                        onChange={handleSortItemChange}
                    /> Highest price
                </label>
            </div>
        </div>
    )
}
const FilterContent = ({
    category,
    handleCategoryChange, brand, handleBrandChange
}: FilterContentProps) => {
    return (

        <>
            {/* Category filter */}
            <select value={category} onChange={handleCategoryChange}>
                <option value="">All Categories</option>
                <option value="Household">Household</option>
                <option value="Food">Food</option>
                <option value="Beverages">Beverages</option>
            </select>

            {/* Brand filter */}
            <input
                type="text"
                placeholder="Filter by brand..."
                value={brand}
                onChange={handleBrandChange}
            />
        </>
    )

}
export default ViewStoreScreen