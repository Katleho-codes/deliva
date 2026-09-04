"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import Link from "next/link"
import { StarRating } from "@/components/StarRating"
import { Card } from "@/components/ui/card"
import { MapPin } from "lucide-react"

type NearbyStore = {
    id: number
    name: string
    slug: string
    banner_url: string | null
    average_rating: number
    total_reviews: number
    city: string
    distance_km: number
}

type Phase = "welcome" | "scanning" | "results" | "done"

export default function OnboardingScreen() {
    const router = useRouter()
    const [phase, setPhase] = useState<Phase>("welcome")
    const [stores, setStores] = useState<NearbyStore[]>([])
    const [radius, setRadius] = useState(5)
    const [scanStep, setScanStep] = useState(0)
    const [error, setError] = useState("")

    const scanSteps = [
        { label: "Getting your location", duration: 1000 },
        { label: "Scanning 5km radius", duration: 1200 },
        { label: "Finding spaza shops", duration: 1000 },
        { label: "Almost done", duration: 800 },
    ]

    const startScan = () => {
        setPhase("scanning")
        setScanStep(0)

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                // animate through scan steps
                for (let i = 0; i < scanSteps.length; i++) {
                    setScanStep(i)
                    await new Promise(r => setTimeout(r, scanSteps[i].duration))
                }

                try {
                    const { data } = await api.get("/api/stores/nearby", {
                        params: {
                            lat: pos.coords.latitude,
                            lng: pos.coords.longitude,
                            radius,
                        },
                    })
                    setStores(data)
                    setPhase("results")
                } catch (err) {
                    setError("Could not find stores")
                    setPhase("results")
                }
            },
            () => {
                setError("Location access denied")
                setPhase("results")
            }
        )
    }

    const expandSearch = async () => {
        const newRadius = radius + 5
        setRadius(newRadius)
        setPhase("scanning")
        setScanStep(0)

        navigator.geolocation.getCurrentPosition(async (pos) => {
            for (let i = 0; i < scanSteps.length; i++) {
                setScanStep(i)
                await new Promise(r => setTimeout(r, 600))
            }
            const { data } = await api.get("/api/stores/nearby", {
                params: {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    radius: newRadius,
                },
            })
            setStores(data)
            setPhase("results")
        })
    }

    return (
        <div className="min-h-screen bg-[#FAFAF8] flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`
                @keyframes ping-slow {
                    0% { transform: scale(1); opacity: 0.8; }
                    100% { transform: scale(2.5); opacity: 0; }
                }
                @keyframes sweep {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .ping-1 { animation: ping-slow 2s ease-out infinite; }
                .ping-2 { animation: ping-slow 2s ease-out infinite 0.6s; }
                .ping-3 { animation: ping-slow 2s ease-out infinite 1.2s; }
                .sweep { animation: sweep 2s linear infinite; transform-origin: 50% 50%; }
            `}</style>

            <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">

                {/* welcome */}
                {phase === "welcome" && (
                    <div className="max-w-sm w-full text-center space-y-8">
                        <div>
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F86624] to-[#F15025] flex items-center justify-center mx-auto mb-4">
                                <span className="text-white font-bold text-2xl">D</span>
                            </div>
                            <h1 className="text-3xl font-light" style={{ fontFamily: "'Fraunces', serif" }}>
                                Welcome to <em>Deliva</em>
                            </h1>
                            <p className="text-sm text-[#666] mt-2">
                                Let's find spaza shops in your neighbourhood
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl border border-[#E5E4DF] p-6 text-left space-y-3">
                            {[
                                { icon: "🏪", text: "Discover local spaza shops near you" },
                                { icon: "🛒", text: "Order from your favourite shops" },
                                { icon: "🚚", text: "Track your delivery in real time" },
                            ].map(item => (
                                <div key={item.text} className="flex items-center gap-3">
                                    <span className="text-xl">{item.icon}</span>
                                    <p className="text-sm text-[#666]">{item.text}</p>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={startScan}
                            className="w-full h-12 bg-[#F15025] hover:bg-[#F86624] text-white rounded-xl font-medium transition-colors"
                        >
                            Find shops near me
                        </button>

                        <button
                            onClick={() => router.push("/")}
                            className="text-sm text-[#999] hover:text-[#666]"
                        >
                            Skip for now
                        </button>
                    </div>
                )}

                {/* scanning */}
                {phase === "scanning" && (
                    <div className="flex flex-col items-center gap-8">
                        {/* radar */}
                        <div className="relative w-56 h-56 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border border-[#F86624]/20 ping-1" />
                            <div className="absolute inset-0 rounded-full border border-[#F86624]/20 ping-2" />
                            <div className="absolute inset-0 rounded-full border border-[#F86624]/20 ping-3" />
                            <div className="absolute inset-0 rounded-full border border-[#E5E4DF]" />
                            <div className="absolute inset-8 rounded-full border border-[#E5E4DF]" />
                            <div className="absolute inset-16 rounded-full border border-[#E5E4DF]" />

                            {/* sweep */}
                            <div className="absolute inset-0 sweep overflow-hidden rounded-full">
                                <div className="absolute top-1/2 left-1/2 w-1/2 h-px origin-left"
                                    style={{ background: "linear-gradient(to right, #F86624cc, transparent)" }} />
                                <div className="absolute top-1/2 left-1/2 w-2 h-2 -mt-1 -ml-1 bg-[#F86624] rounded-full" />
                            </div>

                            <div className="w-3 h-3 bg-[#F86624] rounded-full z-10" />
                        </div>

                        {/* steps */}
                        <div className="space-y-2 text-center">
                            {scanSteps.map((step, i) => (
                                <div key={step.label} className={`flex items-center gap-2 text-sm transition-all ${i < scanStep ? "text-green-600" :
                                    i === scanStep ? "text-[#191919] font-medium" :
                                        "text-[#ccc]"
                                    }`}>
                                    <span>{i < scanStep ? "✓" : i === scanStep ? "→" : "·"}</span>
                                    {step.label}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* results */}
                {phase === "results" && (
                    <div className="max-w-sm w-full space-y-5">
                        <div className="text-center">
                            <p className="text-xs font-semibold uppercase tracking-widest text-[#F86624]">
                                {radius}km radius
                            </p>
                            <h2 className="text-2xl font-light mt-1" style={{ fontFamily: "'Fraunces', serif" }}>
                                {stores.length > 0
                                    ? <><em>{stores.length} shop{stores.length !== 1 ? "s" : ""}</em> found</>
                                    : "No shops found nearby"
                                }
                            </h2>
                        </div>

                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                        {stores.length === 0 ? (
                            <button
                                onClick={expandSearch}
                                className="w-full h-12 border-2 border-[#E5E4DF] rounded-xl text-sm font-medium hover:border-[#F86624] hover:text-[#F86624] transition-colors"
                            >
                                Expand search to {radius + 5}km
                            </button>
                        ) : (
                            <div className="space-y-3">
                                {stores.map((store, i) => (
                                    <Link key={store.id} href={`/stores/${store.slug}`}>
                                        <Card className="bg-white rounded-xl border border-cardline p-4 flex items-center gap-3 shadow-none hover:shadow-sm transition-shadow">
                                            <div className="w-8 h-8 rounded-lg bg-[#F5F4F0] flex items-center justify-center shrink-0">
                                                <span className="text-xs font-bold text-[#999]">{i + 1}</span>
                                            </div>
                                            {store.banner_url ? (
                                                <img src={store.banner_url} alt={store.name}
                                                    className="w-10 h-10 rounded-lg object-cover shrink-0" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F86624]/10 to-[#F15025]/20 flex items-center justify-center shrink-0">
                                                    <span>🏪</span>
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-[#191919] truncate">{store.name}</p>
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3 text-[#999]" />
                                                    <p className="text-xs text-[#999]">{store.city}</p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-sm font-bold text-[#F86624]">{store.distance_km}km</p>
                                            </div>
                                        </Card>
                                    </Link>
                                ))}

                                <button
                                    onClick={expandSearch}
                                    className="w-full py-2.5 border-2 border-dashed border-[#E5E4DF] rounded-xl text-xs text-[#999] hover:border-[#F86624] hover:text-[#F86624] transition-colors"
                                >
                                    Search further — expand to {radius + 5}km
                                </button>
                            </div>
                        )}

                        <button
                            onClick={() => router.push("/")}
                            className="w-full h-12 bg-[#191919] hover:bg-[#333] text-white rounded-xl font-medium text-sm transition-colors"
                        >
                            Start shopping →
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}