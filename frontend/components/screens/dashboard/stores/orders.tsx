"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import api from "@/lib/api"
import { Card } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

type Order = {
    id: number
    order_number: string
    status: string
    total_amount: string
    created_at: string
    customer_name: string
    customer_email: string
    items: { product_name: string; quantity: number; sale_price: number }[]
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

const STATUSES = ["all", "pending", "awaiting_payment", "paid", "processing", "shipped", "delivered", "cancelled"]

export default function StoreOrdersScreen() {
    const { slug } = useParams()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [status, setStatus] = useState("all")
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [expanded, setExpanded] = useState<number | null>(null)

    const fetchOrders = async () => {
        setLoading(true)
        try {
            const { data } = await api.get(
                `/api/dashboard/stores/${slug}/orders`,
                { params: { page, limit: 10, ...(status !== "all" && { status }) } },
            )
            setOrders(data.data)
            setTotalPages(data.meta.totalPages)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchOrders() }, [slug, status, page])

    return (
        <div className="space-y-5">
            <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#F86624]">Store</p>
                <h1 className="text-2xl font-light mt-1">Orders</h1>
            </div>

            {/* status filter */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {STATUSES.map(s => (
                    <button
                        key={s}
                        onClick={() => { setStatus(s); setPage(1) }}
                        className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${status === s
                            ? "bg-[#191919] text-white border-[#191919]"
                            : "bg-white text-[#666] border-[#E5E4DF] hover:border-[#999]"
                            }`}
                    >
                        {s.replace("_", " ")}
                    </button>
                ))}
            </div>

            {/* table */}
            <Card className="bg-white rounded-xl border border-cardline gap-0 shadow-none p-0 overflow-hidden">
                {loading ? (
                    <div className="divide-y divide-[#E5E4DF]">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="px-5 py-4 flex items-center justify-between animate-pulse">
                                <div className="space-y-1.5">
                                    <div className="h-4 bg-slate-100 rounded w-32" />
                                    <div className="h-3 bg-slate-100 rounded w-24" />
                                </div>
                                <div className="h-6 bg-slate-100 rounded w-20" />
                            </div>
                        ))}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="py-16 text-center">
                        <p className="text-sm text-[#999]">No orders found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-[#E5E4DF]">
                        {orders.map(order => (
                            <div key={order.id}>
                                <button
                                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                                    className="w-full px-5 py-4 flex items-center justify-between gap-4 hover:bg-[#FAFAF8] transition-colors text-left"
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-[#191919]">{order.order_number}</p>
                                        <p className="text-xs text-[#999] mt-0.5">
                                            {order.customer_name} · {new Date(order.created_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[order.status] ?? "bg-slate-100 text-slate-600"}`}>
                                            {order.status.replace("_", " ")}
                                        </span>
                                        <p className="text-sm font-semibold">{formatCurrency.format(Number(order.total_amount))}</p>
                                    </div>
                                </button>

                                {/* expanded items */}
                                {expanded === order.id && (
                                    <div className="px-5 pb-4 bg-[#FAFAF8] border-t border-[#E5E4DF]">
                                        <p className="text-xs font-semibold text-[#999] uppercase tracking-wide mt-3 mb-2">Items</p>
                                        <div className="space-y-1.5">
                                            {order.items?.map((item, i) => (
                                                <div key={i} className="flex items-center justify-between text-sm">
                                                    <p className="text-[#191919]">{item.product_name} <span className="text-[#999]">× {item.quantity}</span></p>
                                                    <p className="text-[#666]">{formatCurrency.format(Number(item.sale_price))}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs text-[#999] mt-3">{order.customer_email}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1.5 text-xs border border-[#E5E4DF] rounded-lg disabled:opacity-40 hover:border-[#999] transition-colors"
                    >
                        Previous
                    </button>
                    <span className="text-xs text-[#999]">Page {page} of {totalPages}</span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3 py-1.5 text-xs border border-[#E5E4DF] rounded-lg disabled:opacity-40 hover:border-[#999] transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    )
}