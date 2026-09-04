"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import api from "@/lib/api"
import MainNav from "@/components/MainNav"

type Step = {
    status: string
    label: string
    description: string
    icon: string
    completed: boolean
    current: boolean
}

type TrackingData = {
    order_number: string
    tracking_number: string
    courier: string
    current_status: string
    cancelled?: boolean
    steps: Step[]
}

function TrackOrderScreen() {
    const { id: orderId } = useParams()
    const [tracking, setTracking] = useState<TrackingData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTracking = async () => {
            try {
                const { data } = await api.get(`/api/orders/track/${orderId}`)
                setTracking(data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchTracking()
    }, [orderId])

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-muted-foreground text-sm animate-pulse">Loading tracking info...</p>
        </div>
    )

    if (!tracking) return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Order not found</p>
        </div>
    )

    const currentStep = tracking.steps.find(s => s.current)

    return (
        <div className="min-h-screen">
            <MainNav />
            <div className="max-w-xl mx-auto px-4 py-10 space-y-4 h-[calc(100vh-64px)] mt-22">

                {/* Header */}
                <div className="bg-white rounded-xl border p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-semibold">Order Tracking</h1>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${tracking.current_status === "delivered" ? "bg-green-100 text-green-700" :
                            tracking.current_status === "shipped" ? "bg-blue-100 text-blue-700" :
                                tracking.current_status === "paid" ? "bg-indigo-100 text-indigo-700" :
                                    tracking.current_status === "processing" ? "bg-yellow-100 text-yellow-700" :
                                        "bg-slate-100 text-slate-600"
                            }`}>
                            {currentStep?.label ?? tracking.current_status}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                        <div>
                            <p className="text-xs text-muted-foreground">Order number</p>
                            <p className="text-sm font-medium">{tracking.order_number}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Tracking number</p>
                            <p className="text-sm font-medium">{tracking.tracking_number}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Courier</p>
                            <p className="text-sm font-medium">{tracking.courier}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Status</p>
                            <p className="text-sm font-medium capitalize">{tracking.current_status.replace("_", " ")}</p>
                        </div>
                    </div>
                </div>

                {/* Steps */}
                <div className="bg-white rounded-xl border p-6">
                    <h2 className="text-base font-semibold mb-6">Delivery progress</h2>

                    <div className="relative">
                        {tracking.steps.map((step, index) => (
                            <div key={step.status} className="flex gap-4">
                                {/* icon + line */}
                                <div className="flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 border-2 transition-all
                                        ${step.current ? "border-indigo-500 bg-indigo-50 shadow-sm shadow-indigo-100" :
                                            step.completed ? "border-green-500 bg-green-50" :
                                                "border-slate-200 bg-slate-50"}`}
                                    >
                                        {step.icon}
                                    </div>
                                    {index < tracking.steps.length - 1 && (
                                        <div className={`w-0.5 my-1 flex-1 min-h-8 rounded-full transition-all ${step.completed ? "bg-green-300" : "bg-slate-200"
                                            }`} />
                                    )}
                                </div>

                                {/* text */}
                                <div className="pb-6 pt-1.5">
                                    <p className={`text-sm font-medium leading-tight ${step.current ? "text-indigo-600" :
                                        step.completed ? "text-foreground" :
                                            "text-muted-foreground"
                                        }`}>
                                        {step.label}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {step.description}
                                    </p>
                                    {step.current && (
                                        <span className="inline-block mt-1.5 text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                                            Current status
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Help */}
                <div className="bg-white rounded-xl border p-4 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium">Need help?</p>
                        <p className="text-xs text-muted-foreground">Contact us about your order</p>
                    </div>

                    <a href="mailto:support@yourapp.com"
                        className="text-sm text-indigo-600 hover:underline font-medium"
                    >
                        Get support
                    </a>
                </div>
            </div>

        </div>
    )
}

export default TrackOrderScreen