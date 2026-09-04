import useProductStateStore from "@/state_stores/products_state";
import { TProduct, TUpdateProduct } from "@/utils/types";
import api from "@/lib/api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import socket from "../socket";

interface ErrorMessages {
    name?: string;
    description?: string;
    cost_price?: string;
    sale_price?: string;
    stock_quantity?: string;
    slug?: string;
    low_stock_threshold?: string;
}

const useUpdateProduct = () => {
    const [updateProductLoading, setUpdateProductLoading] = useState(false);
    const [updateProductErrors, setErrors] = useState<ErrorMessages>({});
    const { updateOneProduct } = useProductStateStore();
    const updateProduct = async (
        id: number | string,
        values: TUpdateProduct,
    ) => {
        setUpdateProductLoading(true);
        setErrors({});
        try {
            const response = await api.put(`/api/products/${id}`, values);
            if (response.status === 204) {
                toast(response.data?.message || "No changes detected");
                return false;
            }
            if (response.status === 200) {
                toast.success(response.data?.message);
                return true;
            }
            return false;
        } catch (error: unknown) {
            const err = error as {
                response?: { data?: { errors?: ErrorMessages; message?: string; error?: string }; status?: number };
            };
            if (err.response) {
                if (err.response.status === 400) {
                    setErrors(err.response.data?.errors ?? {});
                }
                const message =
                    err.response.data?.message ??
                    err.response.data?.error;
                if (message) toast.error(message);
            }
            return false;
        } finally {
            setUpdateProductLoading(false);
        }
    };
    useEffect(() => {
        socket.on("product:updated", (updated: TProduct) => {
            updateOneProduct(updated);
        });

        return () => {
            socket.off("product:updated");
        };
    }, []);
    return { updateProduct, updateProductLoading, updateProductErrors };
};

export default useUpdateProduct;
