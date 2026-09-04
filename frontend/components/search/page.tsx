"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { Search, X, Store, Package } from "lucide-react"

import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { useDebounce } from "@/hooks/useDebounce"

type Product = {
    id: number
    name: string
    slug: string
    sale_price: number
    main_image: string
}

type Store = {
    id: number
    name: string
    slug: string
    image_url: string
    description: string
}

type Results = {
    products: Product[]
    stores: Store[]
}

function SearchBar() {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<Results | null>(null)
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const debouncedQuery = useDebounce(query, 350)
    const containerRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    useEffect(() => {
        if (debouncedQuery.length < 2) {
            setResults(null)
            return
        }
        const fetch_ = async () => {
            setLoading(true)
            try {
                const { data } = await api.get("/search", {
                    params: { q: debouncedQuery },
                })
                setResults(data)
                setOpen(true)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetch_()
    }, [debouncedQuery])

    // close on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [])

    const handleClear = () => {
        setQuery("")
        setResults(null)
        setOpen(false)
    }

    const hasResults = results && (results.products.length > 0 || results.stores.length > 0)

    return (
        <div ref={containerRef} className="relative w-full max-w-xl mx-auto">
            {/* input */}
            <div className="relative flex items-center">
                <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => hasResults && setOpen(true)}
                    placeholder="Search products or stores..."
                    className="w-full h-11 pl-10 pr-10 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                {query && (
                    <button
                        onClick={handleClear}
                        className="absolute right-3 text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* dropdown */}
            {open && (
                <div className="absolute top-12 left-0 right-0 z-50 bg-white rounded-xl border shadow-lg overflow-hidden">
                    {loading ? (
                        <div className="p-4 text-sm text-muted-foreground text-center animate-pulse">
                            Searching...
                        </div>
                    ) : !hasResults ? (
                        <div className="p-4 text-sm text-muted-foreground text-center">
                            No results for "{query}"
                        </div>
                    ) : (
                        <div className="max-h-96 overflow-y-auto divide-y">
                            {/* stores */}
                            {results.stores.length > 0 && (
                                <div>
                                    <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide bg-slate-50">
                                        Stores
                                    </p>
                                    {results.stores.map((store) => (
                                        <Link
                                            key={store.id}
                                            href={`/stores/${store.slug}`}
                                            onClick={() => setOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                                        >
                                            {store.image_url ? (
                                                <img
                                                    src={store.image_url}
                                                    alt={store.name}
                                                    className="w-9 h-9 rounded-lg object-cover border"
                                                />
                                            ) : (
                                                <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
                                                    <Store className="h-4 w-4 text-orange-500" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm font-medium">{store.name}</p>
                                                <p className="text-xs text-muted-foreground line-clamp-1">
                                                    {store.description}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* products */}
                            {results.products.length > 0 && (
                                <div>
                                    <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide bg-slate-50">
                                        Products
                                    </p>
                                    {results.products.map((product) => (
                                        <Link
                                            key={product.id}
                                            href={`/products/${product.slug}`}
                                            onClick={() => setOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                                        >
                                            {product.main_image ? (
                                                <img
                                                    src={product.main_image}
                                                    alt={product.name}
                                                    className="w-9 h-9 rounded-lg object-cover border"
                                                />
                                            ) : (
                                                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                                                    <Package className="h-4 w-4 text-slate-400" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                                                <p className="text-xs text-orange-500 font-semibold">
                                                    {formatCurrency.format(Number(product.sale_price))}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default SearchBar