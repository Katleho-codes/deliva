import useStoresStateStore from "@/state_stores/stores_state";
import api from "@/lib/api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import socket from "../socket";

const useDeleteStore = () => {
    const [deleteStoreLoading, setDeleteStoreLoading] = useState(false);
    const { removeStore } = useStoresStateStore();

    const deleteStore = async (id: string | number | null) => {
        setDeleteStoreLoading(true);
        try {
            const response = await api.delete(`/api/stores/${id}`);
            if (response?.status === 200) {
                toast.success(response.data?.message);
                return true;
            }
            return false;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string }; status?: number } };
            console.error(err);
            if (err.response?.status === 404) {
                toast.error(err.response.data?.message ?? "Store not found");
            } else {
                toast.error("Failed to delete store");
            }
            return false;
        } finally {
            setDeleteStoreLoading(false);
        }
    };

    useEffect(() => {
        socket.on("store:deleted", ({ id }: { id: number }) => {
            removeStore(id);
        });
        return () => {
            socket.off("store:deleted");
        };
    }, []);

    return { deleteStore, deleteStoreLoading };
};

export default useDeleteStore;
