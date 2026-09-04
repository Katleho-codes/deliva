import useProductStateStore from "@/state_stores/products_state";
import api from "@/lib/api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import socket from "../socket";

const useDeleteProduct = () => {
    const [deleteProductLoading, setDeleteProductLoading] = useState(false);
    const { removeProduct } = useProductStateStore();

    const deleteProduct = async (id: number | string) => {
        setDeleteProductLoading(true);
        try {
            const response = await api.delete(`/api/products/${id}`);
            if (response?.status === 200) {
                toast.success(response.data?.message);
                return true;
            }
            return false;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string }; status?: number } };
            if (err.response?.status === 404) {
                toast.error(err.response.data?.message ?? "Product not found");
            } else {
                toast.error("Failed to delete product");
            }
            return false;
        } finally {
            setDeleteProductLoading(false);
        }
    };

    useEffect(() => {
        socket.on("product:deleted", ({ id }: { id: number }) => {
            removeProduct(id);
        });
        return () => {
            socket.off("product:deleted");
        };
    }, []);

    return { deleteProduct, deleteProductLoading };
};

export default useDeleteProduct;
