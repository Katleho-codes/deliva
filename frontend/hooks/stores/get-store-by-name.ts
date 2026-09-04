import useStoresStateStore from "@/state_stores/stores_state";
import api, { getApiErrorMessage } from "@/lib/api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const useGetStoreByName = (storename?: string, queryString?: string) => {
    const [storeListLoading, setStoreListLoading] = useState(true);

    const { store, setStore } = useStoresStateStore();

    const fetchStore = async () => {
        if (!storename) return;
        try {
            setStoreListLoading(true);
            const { data } = await api.get(
                `/api/stores/${storename}?${queryString}`,
            );
            if (data) {
                setStore(data);
            }
            return data;
        } catch (error: unknown) {
            console.error(error);
            toast.error(getApiErrorMessage(error, "Could not load store"));
        } finally {
            setStoreListLoading(false);
        }
    };

    const totalProductsByStore =
        store?.meta?.totalCount ?? store?.products?.length ?? 0;

    useEffect(() => {
        setStore(null); // clear stale store on mount
        fetchStore();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storename, queryString]);

    return { storeListLoading, totalProductsByStore };
};
export default useGetStoreByName;
