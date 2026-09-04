"use client"

import { useState, useEffect } from "react"
import api from "@/lib/api"
import Link from "next/link"
import { StarRating } from "@/components/StarRating"
import { Card } from "@/components/ui/card"
import { MapPin, Radio } from "lucide-react"

type NearbyStore = {
    id: number
    name: string
    slug: string
    description: string
    banner_url: string | null
    average_rating: number
    total_reviews: number
    city: string
    province: string
    distance_km: number
}

export default function DiscoverScreen() {
    const [stores, setStores] = useState<NearbyStore[]>([])
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)
    const [radius, setRadius] = useState(5)
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
    const [locationError, setLocationError] = useState("")
    const [scanPhase, setScanPhase] = useState(0)

    const scanMessages = [
        "Getting your location...",
        "Scanning nearby area...",
        "Looking for spaza shops...",
        "Almost there...",
    ]

    const getLocation = () => {
        setLoading(true)
        setSearched(false)
        setScanPhase(0)

        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser")
            setLoading(false)
            return
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const coords = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    accuracy: pos.coords.accuracy // Measured in meters
                }
                setLocation(coords)
                searchNearby(coords, radius)
            },
            () => {
                setLocationError("Could not get your location. Please allow location access.")
                setLoading(false)
            }, {
            enableHighAccuracy: true,  // Forces GPS usage if available
            timeout: 10000,            // Waits up to 10 seconds for a fix
            maximumAge: 0              // Disallows cached results
        }
        )
    }

    const searchNearby = async (coords: { lat: number; lng: number }, searchRadius: number) => {
        setLoading(true)

        // simulate scan phases
        const interval = setInterval(() => {
            setScanPhase(p => {
                if (p >= scanMessages.length - 1) {
                    clearInterval(interval)
                    return p
                }
                return p + 1
            })
        }, 800)

        try {
            // minimum 3s for the radar effect
            const [res] = await Promise.all([
                api.get("/api/stores/nearby", {
                    params: { lat: coords.lat, lng: coords.lng, radius: searchRadius },
                }),
                new Promise(r => setTimeout(r, 3000))
            ])
            setStores(res.data)
            setSearched(true)
        } catch (err) {
            console.error(err)
        } finally {
            clearInterval(interval)
            setLoading(false)
        }
    }

    const expandRadius = () => {
        const newRadius = radius + 5
        setRadius(newRadius)
        if (location) searchNearby(location, newRadius)
    }

    return (
        <div className="min-h-screen bg-[#FAFAF8]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`
                @keyframes radar-ping {
                    0% { transform: scale(0.5); opacity: 1; }
                    100% { transform: scale(2.5); opacity: 0; }
                }
                @keyframes radar-rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .radar-ping { animation: radar-ping 1.5s ease-out infinite; }
                .radar-ping-2 { animation: radar-ping 1.5s ease-out infinite 0.5s; }
                .radar-ping-3 { animation: radar-ping 1.5s ease-out infinite 1s; }
                .radar-sweep {
                    animation: radar-rotate 2s linear infinite;
                    transform-origin: center;
                }
            `}</style>

            <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#F86624]">
                        Community
                    </p>
                    <h1 className="text-3xl font-light mt-1" style={{ fontFamily: "'Fraunces', serif" }}>
                        Find shops <em>near you</em>
                    </h1>
                    <p className="text-sm text-[#666] mt-2">
                        Discover local spaza shops in your neighbourhood
                    </p>
                </div>

                {/* radar */}
                <div className="flex flex-col items-center gap-6">
                    <div className="relative w-48 h-48 flex items-center justify-center">
                        {/* outer rings */}
                        <div className={`absolute inset-0 rounded-full border-2 ${loading ? "border-[#F86624]/30" : "border-[#E5E4DF]"}`} />
                        <div className={`absolute inset-6 rounded-full border-2 ${loading ? "border-[#F86624]/40" : "border-[#E5E4DF]"}`} />
                        <div className={`absolute inset-12 rounded-full border-2 ${loading ? "border-[#F86624]/50" : "border-[#E5E4DF]"}`} />

                        {/* ping rings — only when loading */}
                        {loading && (
                            <>
                                <div className="absolute inset-0 rounded-full border-2 border-[#F86624]/40 radar-ping" />
                                <div className="absolute inset-0 rounded-full border-2 border-[#F86624]/30 radar-ping-2" />
                                <div className="absolute inset-0 rounded-full border-2 border-[#F86624]/20 radar-ping-3" />
                            </>
                        )}

                        {/* sweep line — only when loading */}
                        {loading && (
                            <div className="absolute inset-0 radar-sweep">
                                <div className="absolute top-1/2 left-1/2 w-1/2 h-0.5 origin-left"
                                    style={{
                                        background: "linear-gradient(to right, #F86624, transparent)"
                                    }}
                                />
                            </div>
                        )}

                        {/* store dots — when found */}
                        {searched && stores.length > 0 && (
                            <>
                                <div className="absolute top-4 right-8 w-2.5 h-2.5 bg-[#F86624] rounded-full" />
                                <div className="absolute bottom-8 left-6 w-2 h-2 bg-[#F86624] rounded-full" />
                                <div className="absolute top-12 left-4 w-2 h-2 bg-[#F86624] rounded-full" />
                                {stores.length > 3 && (
                                    <div className="absolute bottom-4 right-10 w-2 h-2 bg-[#F86624] rounded-full" />
                                )}
                            </>
                        )}

                        {/* center dot */}
                        <div className={`w-4 h-4 rounded-full z-10 ${loading ? "bg-[#F86624]" : "bg-[#191919]"}`} />
                    </div>

                    {/* status message */}
                    {loading && (
                        <p className="text-sm text-[#666] animate-pulse">
                            {scanMessages[scanPhase]}
                        </p>
                    )}

                    {!loading && !searched && (
                        <div className="text-center space-y-3">
                            <p className="text-sm text-[#666]">
                                We'll search within <span className="font-semibold text-[#191919]">{radius}km</span> of your location
                            </p>
                            {locationError && (
                                <p className="text-xs text-red-500">{locationError}</p>
                            )}
                            <button
                                onClick={getLocation}
                                className="flex items-center gap-2 px-6 py-3 bg-[#F15025] hover:bg-[#F86624] text-white rounded-xl font-medium text-sm transition-colors mx-auto"
                            >
                                <Radio className="h-4 w-4" />
                                Find shops near me
                            </button>
                        </div>
                    )}

                    {searched && !loading && (
                        <p className="text-sm text-[#666]">
                            Found <span className="font-semibold text-[#191919]">{stores.length}</span> shop{stores.length !== 1 ? "s" : ""} within {radius}km
                        </p>
                    )}
                </div>

                {/* results */}
                {searched && !loading && (
                    <div className="space-y-4">
                        {stores.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-[#E5E4DF] p-10 text-center">
                                <p className="text-2xl mb-2">🏪</p>
                                <p className="font-medium text-[#191919]">No shops found nearby</p>
                                <p className="text-sm text-[#999] mt-1">Try expanding your search radius</p>
                                <button
                                    onClick={expandRadius}
                                    className="mt-4 px-4 py-2 border-2 border-[#E5E4DF] rounded-xl text-sm font-medium hover:border-[#F86624] hover:text-[#F86624] transition-colors"
                                >
                                    Expand to {radius + 5}km
                                </button>
                            </div>
                        ) : (
                            <>
                                {stores.map((store, i) => (
                                    <Link key={store.id} href={`/stores/${store.slug}`}>
                                        <Card className="bg-white rounded-xl border border-cardline p-4 gap-0 shadow-none hover:shadow-md transition-shadow flex items-center gap-4">
                                            {/* rank */}
                                            <div className="w-8 h-8 rounded-full bg-[#F5F4F0] flex items-center justify-center shrink-0">
                                                <span className="text-xs font-bold text-[#666]">{i + 1}</span>
                                            </div>

                                            {/* image */}
                                            {store.banner_url ? (
                                                <img src={store.banner_url} alt={store.name}
                                                    className="w-12 h-12 rounded-xl object-cover shrink-0" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F86624]/10 to-[#F15025]/20 flex items-center justify-center shrink-0">
                                                    <span className="text-lg">🏪</span>
                                                </div>
                                            )}

                                            {/* info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-[#191919] truncate">{store.name}</p>
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    <MapPin className="h-3 w-3 text-[#999]" />
                                                    <p className="text-xs text-[#999]">{store.city}</p>
                                                </div>
                                                {store.average_rating > 0 && (
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        <StarRating rating={Number(store.average_rating)} size="sm" />
                                                        <span className="text-xs text-[#999]">({store.total_reviews})</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* distance */}
                                            <div className="text-right shrink-0">
                                                <p className="text-sm font-bold text-[#F86624]">{store.distance_km}km</p>
                                                <p className="text-xs text-[#999]">away</p>
                                            </div>
                                        </Card>
                                    </Link>
                                ))}

                                {/* expand radius */}
                                <button
                                    onClick={expandRadius}
                                    className="w-full py-3 border-2 border-dashed border-[#E5E4DF] rounded-xl text-sm text-[#999] hover:border-[#F86624] hover:text-[#F86624] transition-colors"
                                >
                                    Search further — expand to {radius + 5}km
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}