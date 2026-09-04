import api, { getApiErrorMessage } from "@/lib/api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export type TLatestPendingOrder = {
    order_id: number;
    order_number: string;
    status: string;
    delivery_fee: number;
    sub_total: number;
    total_amount: number;
    items: {
        product_id: number;
        name: string;
        quantity: number;
        sale_price: number;
    }[];
};

const useGetLatestPendingOrder = () => {
    const [latestPendingOrderList, setData] =
        useState<TLatestPendingOrder | null>(null);
    const [latestPendingOrderListLoading, setLatestOrderPendingListLoading] =
        useState(false);

    const [order_number, setOrderNumber] = useState("");
    const [order_id, setOrderId] = useState(0);
    const [total_amount, setTotalAmount] = useState(0);
    const [sub_total, setSubTotal] = useState(0);
    const [delivery_fee, setDeliveryFee] = useState(0);

    const fetchLatestPendingOrder = async () => {
        try {
            setLatestOrderPendingListLoading(true);

            const { data } = await api.get("/api/orders/latest-pending");

            if (data) {
                setData(data);
                setOrderId(data?.order_id);
                setOrderNumber(data?.order_number);
                setTotalAmount(data?.total_amount);
                setSubTotal(data?.sub_total);
                setDeliveryFee(data?.delivery_fee);
            }
        } catch (error: unknown) {
            // 404 simply means there is no pending order yet
            const err = error as { response?: { status?: number } };
            if (err.response?.status !== 404) {
                toast.error(
                    getApiErrorMessage(error, "Could not load pending order"),
                );
            }
        } finally {
            setLatestOrderPendingListLoading(false);
        }
    };

    useEffect(() => {
        fetchLatestPendingOrder();
    }, []);

    const itemsCount = latestPendingOrderList?.items?.length ?? 0;
    return {
        latestPendingOrderList,
        latestPendingOrderListLoading,
        order_number,
        order_id,
        sub_total,
        total_amount,
        delivery_fee,
        itemsCount,
    };
};

export default useGetLatestPendingOrder;
