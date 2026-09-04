import useStoresStateStore from "@/state_stores/stores_state";
import api, { getApiErrorMessage } from "@/lib/api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const useGetMyStores = () => {
    const { setMyStores } = useStoresStateStore();
    const [myStoresListLoading, setMyStoresListLoading] = useState(false);

    const fetchMyStores = async () => {
        try {
            setMyStoresListLoading(true);

            const { data } = await api.get("/api/stores/my-stores");
            if (data) {
                setMyStores(data);
            }
        } catch (error: unknown) {
            toast.error(
                getApiErrorMessage(error, "Could not load your stores"),
            );
        } finally {
            setMyStoresListLoading(false);
        }
    };

    useEffect(() => {
        fetchMyStores();
    }, []);

    return {
        myStoresListLoading,
    };
};

export default useGetMyStores;
