import useProductStateStore from "@/state_stores/products_state";
import api, { getApiErrorMessage } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const useGetProducts = () => {
    const [productListLoading, setProductListLoading] = useState(false);
    const [currentProductPage, setCurrentPage] = useState(1);
    const [totalProductPages, setTotalPages] = useState(1);
    const { setProducts } = useProductStateStore();
    const { data: session } = useSession();

    const fetchProducts = async (page = 1, limit = 10) => {
        try {
            setProductListLoading(true);

            const { data } = await api.get(
                `/api/products?page=${page}&limit=${limit}`,
            );

            if (data) {
                setProducts(data.data);
                setCurrentPage(data.meta.currentPage);
                setTotalPages(data.meta.totalPages);
            }
        } catch (error: unknown) {
            console.log("fetch products ui error", error);
            // // don't surface load errors to guests
            // if (session?.user) {
            //     toast.error(getApiErrorMessage(error, "Could not load products"));
            // }
        } finally {
            setProductListLoading(false);
        }
    };

    const resetProducts = async () => {
        setProducts([]); // clear list immediately
        setCurrentPage(1); // reset page
        await fetchProducts(1); // refetch first page
    };

    useEffect(() => {
        fetchProducts(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        fetchProducts,
        resetProducts,
        currentProductPage,
        totalProductPages,
        productListLoading,
    };
};

export default useGetProducts;
