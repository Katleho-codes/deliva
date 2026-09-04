"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import api from "@/lib/api"
import { Card } from "@/components/ui/card"
import { ShoppingBag, Users, Package, TrendingUp } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

type Stats = {
    total_orders: number
    total_revenue: number
    total_products: number
    total_customers: number
}

type RecentOrder = {
    id: number
    order_number: string
    status: string
    total_amount: string
    created_at: string
    customer_name: string
}

const statusColors: Record<string, string> = {
    pending: "bg-slate-100 text-slate-600",
    awaiting_payment: "bg-orange-100 text-orange-600",
    paid: "bg-indigo-100 text-indigo-600",
    processing: "bg-yellow-100 text-yellow-700",
    shipped: "bg-blue-100 text-blue-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-600",
}
export default function StoreDashboardOverviewScreen() {
    const { slug } = useParams()
    const [stats, setStats] = useState<Stats | null>(null)
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetch_ = async () => {
            try {
                const { data } = await api.get(`/api/dashboard/stores/${slug}`)
                setStats(data.stats)
                setRecentOrders(data.recent_orders)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetch_()
    }, [slug])

    const statCards = [
        { label: "Total Orders", value: stats?.total_orders ?? 0, icon: ShoppingBag, color: "text-indigo-500", bg: "bg-indigo-50" },
        { label: "Revenue", value: formatCurrency.format(Number(stats?.total_revenue ?? 0)), icon: TrendingUp, color: "text-green-500", bg: "bg-green-50", isCurrency: true },
        { label: "Products", value: stats?.total_products ?? 0, icon: Package, color: "text-orange-500", bg: "bg-orange-50" },
        { label: "Customers", value: stats?.total_customers ?? 0, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
    ]

    return (
        <div className="space-y-6">
            <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#F86624]">Dashboard</p>
                <h1 className="text-2xl font-light mt-1">
                    Store <em>Overview</em>
                </h1>
            </div>

            {/* stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card) => {
                    const Icon = card.icon
                    return (
                        <Card key={card.label} className="bg-white rounded-xl border border-cardline p-5 gap-0 shadow-none">
                            {loading ? (
                                <div className="space-y-3 animate-pulse">
                                    <div className="w-9 h-9 bg-slate-100 rounded-lg" />
                                    <div className="h-6 bg-slate-100 rounded w-1/2" />
                                    <div className="h-3 bg-slate-100 rounded w-2/3" />
                                </div>
                            ) : (
                                <>
                                    <div className={`w-9 h-9 ${card.bg} rounded-lg flex items-center justify-center mb-3`}>
                                        <Icon className={`h-4 w-4 ${card.color}`} />
                                    </div>
                                    <p className="text-xl font-semibold text-[#191919]">{card.value}</p>
                                    <p className="text-xs text-[#999] mt-0.5">{card.label}</p>
                                </>
                            )}
                        </Card>
                    )
                })}
            </div>

            {/* recent orders */}
            <Card className="bg-white rounded-xl border border-cardline gap-0 shadow-none p-0">
                <div className="px-5 py-4 border-b border-[#E5E4DF] flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-[#191919]">Recent Orders</h2>
                </div>

                {loading ? (
                    <div className="divide-y divide-[#E5E4DF]">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="px-5 py-4 flex items-center justify-between animate-pulse">
                                <div className="space-y-1.5">
                                    <div className="h-4 bg-slate-100 rounded w-28" />
                                    <div className="h-3 bg-slate-100 rounded w-20" />
                                </div>
                                <div className="h-6 bg-slate-100 rounded w-16" />
                            </div>
                        ))}
                    </div>
                ) : recentOrders.length === 0 ? (
                    <div className="py-12 text-center">
                        <p className="text-sm text-[#999]">No orders yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-[#E5E4DF]">
                        {recentOrders.map((order) => (
                            <div key={order.id} className="px-5 py-4 flex items-center justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-[#191919]">{order.order_number}</p>
                                    <p className="text-xs text-[#999] mt-0.5">{order.customer_name} · {new Date(order.created_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}</p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[order.status] ?? "bg-slate-100 text-slate-600"}`}>
                                        {order.status.replace("_", " ")}
                                    </span>
                                    <p className="text-sm font-semibold text-[#191919]">
                                        {formatCurrency.format(Number(order.total_amount))}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    )
}
