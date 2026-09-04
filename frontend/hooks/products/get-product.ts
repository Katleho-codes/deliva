import useProductStateStore from "@/state_stores/products_state";
import api, { getApiErrorMessage } from "@/lib/api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const useGetProduct = (slug?: string) => {
    const [productLoading, setProductLoading] = useState(false);
    const { setProduct } = useProductStateStore();
    const fetchProduct = async () => {
        if (!slug) return;
        try {
            setProductLoading(true);

            const { data } = await api.get(`/api/products/${slug}`);

            if (data) {
                setProduct(data);
            }
        } catch (error: unknown) {
            toast.error(getApiErrorMessage(error, "Could not load product"));
        } finally {
            setProductLoading(false);
        }
    };

    useEffect(() => {
        fetchProduct();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug]);

    return {
        productLoading,
    };
};

export default useGetProduct;
