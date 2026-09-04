"use client"
import MainNav from '@/components/MainNav';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import useGetUserOrder from '@/hooks/orders/get-user-orders';
import { LocateIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const PRESETS = [
    { label: "All", value: "all" },
    { label: "3 Months", value: "3_months" },
    { label: "6 Months", value: "6_months" },
    { label: "This Year", value: "this_year" },
    { label: "Last Year", value: "last_year" },
    { label: "Custom", value: "custom" },
];


const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
    delivered: { bg: "#e6f4ec", text: "#1a7a3e", dot: "#2ecc71" },
    pending: { bg: "#fff7e6", text: "#a06000", dot: "#f39c12" },
    processing: { bg: "#e8f0fe", text: "#1a4fbb", dot: "#4a7dff" },
    cancelled: { bg: "#fdecea", text: "#a01e1e", dot: "#e74c3c" },
    canceled: { bg: "#fdecea", text: "#a01e1e", dot: "#e74c3c" },
    shipped: { bg: "#f0eaff", text: "#5a1aaa", dot: "#9b59b6" },
};
function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-ZA", {
        day: "2-digit", month: "short", year: "numeric", timeZone: "Africa/Johannesburg",
    });
}

function formatZAR(amount: number) {
    return `R ${Number(amount).toFixed(2)}`;
}

export default function OrdersScreen() {
    const [filter, setFilter] = useState("all");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [expandedId, setExpandedId] = useState<null | number>(null);
    const [orderId, setOrderId] = useState<number | undefined>()
    const router = useRouter()
    const {
        userOrdersList,
        userOrdersListLoading,
        currentUserOrderPage,
        totalUserOrderPages,
        cancelOrder,
        cancelOrderLoading,
        cancelOrderDialog,
        setCancelOrderDialog,
        fetchUserOrders,
    } = useGetUserOrder();

    const onPageChange = (page: number, filter: string, from: string | null, to: string | null) => {
        fetchUserOrders(page, filter, from, to);
    };

    const now = new Date();

    const filtered = (userOrdersList ?? []).filter((o) => {
        const d = new Date(o.created_at);
        if (filter === "3_months") {
            return d >= new Date(now.getTime() - 90 * 864e5);
        }
        if (filter === "6_months") return d >= new Date(now.getTime() - 180 * 864e5);
        if (filter === "this_year") return d.getFullYear() === now.getFullYear();
        if (filter === "last_year") return d.getFullYear() === now.getFullYear() - 1;
        if (filter === "custom") {
            if (from && d < new Date(from)) return false;
            if (to && d > new Date(to + "T23:59:59")) return false;
        }
        return true;
    });


    const goToTrackOrder = (e: React.SyntheticEvent, order_id: number | string) => {
        e.stopPropagation()
        router.push("/orders/track/" + order_id)
    }
    return (
        <>
            <MainNav />
            <div className=" overflow-y-auto">


                <Dialog open={cancelOrderDialog} onOpenChange={setCancelOrderDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Are you sure you want to cancel the order?</DialogTitle>
                            <DialogDescription>
                                This will cancel your order
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col lg:flex-row lg:flex-1 gap-5">
                            <Button onClick={() => setCancelOrderDialog(false)}>Go back</Button>
                            <Button className='bg-red-600' disabled={cancelOrderLoading} onClick={() => orderId && cancelOrder(orderId)}>Yes, continue</Button>
                        </div>
                    </DialogContent>
                </Dialog>


                {/* Header */}
                <div className="orders-header">
                    <div className="text-gray-100">My Account</div>
                    <div className="header-title">Order History</div>
                    <div className="header-sub">Track and manage your purchases</div>
                </div>

                {/* Filters */}
                <div className="filter-section">
                    <div className="preset-pills">
                        {PRESETS.map(p => (
                            <button
                                key={p.value}
                                className={`pill ${filter === p.value ? "active" : ""}`}
                                onClick={() => {
                                    setFilter(p.value);
                                    if (p.value !== "custom") {
                                        onPageChange(1, p.value, null, null);
                                    }
                                }}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    {filter === "custom" && (
                        <div className="date-range">
                            <div className="date-input-wrap">
                                <span className="date-label">From</span>
                                <input
                                    type="date"
                                    className="date-input"
                                    value={from}
                                    onChange={e => {
                                        const val = e.target.value;
                                        setFrom(val);
                                        if (to) onPageChange(1, "custom", val, to);
                                    }}
                                />
                            </div>
                            <div style={{ color: "#c4b49a", fontSize: 18, marginTop: 18 }}>→</div>
                            <div className="date-input-wrap">
                                <span className="date-label">To</span>
                                <input
                                    type="date"
                                    className="date-input"
                                    value={to}
                                    onChange={e => {
                                        const val = e.target.value;
                                        setTo(val);
                                        if (from) onPageChange(1, "custom", from, val);
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Results count */}
                <div className="px-6 pt-3 text-sm text-gray-400">
                    {userOrdersListLoading
                        ? "Loading…"
                        : `${filtered.length} order${filtered.length !== 1 ? "s" : ""} found`}
                </div>

                {/* Orders */}
                <div className="orders-list">
                    {userOrdersListLoading ? (
                        [1, 2, 3].map(n => (
                            <div key={n} className="mx-6 my-2 h-18 rounded-xl bg-gray-100 animate-pulse" />
                        ))
                    ) : filtered.length === 0 ? (
                        <div className="px-6 py-15 text-center">
                            <div className="text-[48px] mb-3">📦</div>
                            <div className="text-base text-gray-400">No orders found for this period</div>
                        </div>
                    ) : (
                        filtered.map((order, i) => {
                            const sc = STATUS_COLORS[order?.status] ?? STATUS_COLORS.pending;
                            const isOpen = expandedId === order.order_id;
                            return (
                                <div key={order.order_id} className="order-card"
                                    style={{ animationDelay: `${i * 60}ms` }}>

                                    <div className="card-header"
                                        onClick={() => setExpandedId(isOpen ? null : order.order_id)}>
                                        <div>
                                            <div className="card-order-num">{order.order_number}</div>
                                            <div className="card-date">
                                                {formatDate(order.created_at)} · {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                                            </div>
                                        </div>
                                        <div className="card-header-right">

                                            {order?.status === "paid" || order?.status === "processing" || order.status === "delivered" || order.status === "shipped" ? <Button className='hidden lg:flex ' onClick={(e) => goToTrackOrder(e, order?.order_id)}>Track <LocateIcon className="h-3.5 w-3.5 text-white" /></Button> : null}
                                            <div className="card-total">{formatZAR(order.total_amount)}</div>
                                            <div className="status-badge" style={{ background: sc.bg, color: sc.text }}>
                                                <div className="status-dot" style={{ background: sc.dot }} />
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </div>
                                            <svg className={`chevron ${isOpen ? "open" : ""}`}
                                                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="6 9 12 15 18 9" />
                                            </svg>
                                        </div>
                                    </div>

                                    {isOpen && (
                                        <>
                                            <div className="items-list">
                                                {order.items.map((item) => (
                                                    <div key={item.product_id} className="item-row">
                                                        {/* <img
                                                            className="item-img"
                                                            src={item.product_image}
                                                            alt={item.product_name}
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = "https://placehold.co/48x48/f5e6c8/8B4513?text=?";
                                                            }}
                                                        /> */}
                                                        <div className="item-info">
                                                            <div className="item-name">{item.product_name}</div>
                                                            <div className="item-meta">
                                                                {formatZAR(item.product_price)} × {item.quantity}
                                                            </div>
                                                        </div>
                                                        <div className="item-line-total">
                                                            {formatZAR(item.product_price * item.quantity)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>


                                            <div className="card-footer">
                                                <div className="flex flex-col gap-2 w-full lg:flex-row lg:items-center lg:justify-between">

                                                    {/* Actions */}
                                                    <div className="flex flex-col gap-2 sm:flex-row">

                                                        {/* Track order — mobile only */}
                                                        <Button
                                                            className="lg:hidden"
                                                            onClick={(e) => goToTrackOrder(e, order?.order_id)}
                                                        >
                                                            Track <LocateIcon className="h-3.5 w-3.5 text-white" />
                                                        </Button>


                                                        {/* Cancel order */}

                                                        {["pending", "processing"].includes(order.status) && (
                                                            <Button
                                                                variant="destructive"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const orderId = order.order_id

                                                                    setCancelOrderDialog(true)
                                                                    setOrderId(orderId as number)
                                                                }}
                                                            >
                                                                Cancel order
                                                            </Button>
                                                        )}
                                                    </div>

                                                    {/* Total */}
                                                    <div className="info">
                                                        <span className="footer-label">Order Total</span>
                                                        <span className="footer-val">{formatZAR(order.total_amount)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                        </>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                {!userOrdersListLoading && totalUserOrderPages > 1 && (
                    <div className="pagination">
                        <button className="page-btn"
                            disabled={currentUserOrderPage === 1}
                            onClick={() => onPageChange(currentUserOrderPage - 1, filter, from || null, to || null)}>
                            ‹
                        </button>
                        <span className="page-info">Page {currentUserOrderPage} of {totalUserOrderPages}</span>
                        <button className="page-btn"
                            disabled={currentUserOrderPage === totalUserOrderPages}
                            onClick={() => onPageChange(currentUserOrderPage + 1, filter, from || null, to || null)}>
                            ›
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}