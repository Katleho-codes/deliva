import { useSession } from "@/lib/auth-client";
import api from "@/lib/api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import socket from "../socket";

export type TGetUserOrder = {
    order_id: number;
    order_number: string;
    created_at: string;
    status: string;
    total_amount: number;
    items: {
        product_id: number;
        product_name: string;
        product_image: string;
        quantity: number;
        product_price: number;
    }[];
};

// Single source of truth for cancelling an order.
const useGetUserOrder = () => {
    const [userOrdersList, setData] = useState<TGetUserOrder[]>([]);
    const [userOrdersListLoading, setUserOrdersListLoading] = useState(false);
    const [cancelOrderLoading, setCancelOrderLoading] = useState(false);
    const [cancelOrderDialog, setCancelOrderDialog] = useState(false);

    const [currentUserOrderPage, setCurrentPage] = useState(1);
    const [totalUserOrderPages, setTotalPages] = useState(1);
    const { data: session } = useSession();

    const fetchUserOrders = async (
        page = 1,
        filter = "all",
        from: string | null = null,
        to: string | null = null,
        limit = 10,
    ) => {
        if (!session?.user?.id) return;
        try {
            setUserOrdersListLoading(true);

            const { data } = await api.get(
                `/api/orders/user/${session.user.id}`,
                {
                    params: {
                        page,
                        limit,
                        filter,
                        ...(from && { from }),
                        ...(to && { to }),
                    },
                },
            );

            if (data) {
                setData(data?.data);
                setCurrentPage(data.meta.currentPage);
                setTotalPages(data.meta.totalPages);
            }
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(
                err?.response?.data?.message ?? "Could not load orders",
            );
        } finally {
            setUserOrdersListLoading(false);
        }
    };

    // Backend sets status itself; body is intentionally empty.
    const cancelOrder = async (order_id: number | string) => {
        setCancelOrderLoading(true);
        try {
            const response = await api.put(`/api/orders/cancel/${order_id}`);

            if (response?.data) {
                toast.success(response?.data?.message);
                setData((prev) =>
                    prev.map((order) =>
                        order.order_id === Number(order_id)
                            ? { ...order, status: "cancelled" }
                            : order,
                    ),
                );
            }
            return true;
        } catch (error: unknown) {
            console.error("error canceling order", error);
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(
                err?.response?.data?.message ?? "Could not cancel order",
            );
            return false;
        } finally {
            setCancelOrderLoading(false);
            setCancelOrderDialog(false);
        }
    };

    useEffect(() => {
        if (session?.user?.id) {
            fetchUserOrders(1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session?.user?.id]);

    // realtime order updates via socket
    useEffect(() => {
        // update the specific order in the list when status changes
        socket.on("order:updated", (updatedOrder: TGetUserOrder) => {
            setData((prev) =>
                prev.map((order) =>
                    order.order_id === updatedOrder.order_id
                        ? { ...order, status: updatedOrder.status }
                        : order,
                ),
            );
        });

        socket.on("order:canceled", (updatedOrder: TGetUserOrder) => {
            setData((prev) =>
                prev.map((order) =>
                    order.order_id === updatedOrder.order_id
                        ? { ...order, status: "cancelled" }
                        : order,
                ),
            );
        });

        return () => {
            socket.off("order:updated");
            socket.off("order:canceled");
        };
    }, []);

    return {
        userOrdersList,
        userOrdersListLoading,
        currentUserOrderPage,
        totalUserOrderPages,
        cancelOrder,
        cancelOrderLoading,
        cancelOrderDialog,
        setCancelOrderDialog,
        fetchUserOrders,
    };
};

export default useGetUserOrder;
