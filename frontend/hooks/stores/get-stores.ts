import useStoresStateStore from "@/state_stores/stores_state";
import api, { getApiErrorMessage } from "@/lib/api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const useGetStores = () => {
    const [storeListLoading, setStoreListLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const { setStores } = useStoresStateStore();

    const fetchStores = async (page = 1, limit = 10) => {
        try {
            setStoreListLoading(true);

            const { data } = await api.get("/api/stores", {
                params: { page, limit },
            });

            if (data) {
                setStores(data.data);
                setCurrentPage(data.meta.currentPage);
                setTotalPages(data.meta.totalPages);
            }
        } catch (error: unknown) {
            toast.error(getApiErrorMessage(error, "Could not load stores"));
        } finally {
            setStoreListLoading(false);
        }
    };

    const resetStores = async () => {
        setStores([]); // clear list immediately
        setCurrentPage(1); // reset page
        await fetchStores(1); // refetch first page
    };

    useEffect(() => {
        fetchStores(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        fetchStores,
        resetStores,
        currentPage,
        totalPages,
        storeListLoading,
    };
};

export default useGetStores;
