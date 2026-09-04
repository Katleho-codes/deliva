import useProductStateStore from "@/state_stores/products_state";
import { TCreateProduct, TProduct, TProducts } from "@/utils/types";
import api from "@/lib/api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import socket from "../socket";

interface ErrorMessages {
    name?: string;
    description?: string;
    brand?: string;
    cost_price?: string;
    sale_price?: string;
    stock_quantity?: string;
    low_stock_threshold?: string;
}

const useCreateProduct = () => {
    const [createProductLoading, setCreateProductLoading] = useState(false);
    const [createProductErrors, setErrors] = useState<ErrorMessages>({});
    const { products, setProducts } = useProductStateStore();
    const createProduct = async (values: TCreateProduct) => {
        setCreateProductLoading(true);
        setErrors({});
        try {
            const response = await api.post("/api/products", values);
            if (response.status === 201) {
                toast.success(response.data?.message);
                return true;
            }
            return false;
        } catch (error: unknown) {
            const err = error as {
                response?: { data?: { errors?: ErrorMessages; message?: string; error?: string }; status?: number };
            };
            if (err.response) {
                // field validation errors
                if (err.response.status === 400) {
                    setErrors(err.response.data?.errors ?? {});
                }
                const message =
                    err.response.data?.message ??
                    err.response.data?.error; // includes 409 duplicate name
                if (message) toast.error(message);
            }
            return false;
        } finally {
            setCreateProductLoading(false);
        }
    };
    useEffect(() => {
        socket.on("product:added", (addedProduct: TProduct) => {
            const current = useProductStateStore.getState().products;

            const newProductEntry = {
                product_id: addedProduct.id,
                name: addedProduct.name,
                description: addedProduct.description,
                sale_price: addedProduct.sale_price,
                main_image: addedProduct.main_image,
                slug: addedProduct.slug,
                effective_price: addedProduct.effective_price,
                store_name: addedProduct.store_name,
                is_on_sale: addedProduct.is_on_sale,
                stock_quantity: addedProduct.stock_quantity,
                is_new: addedProduct.is_new,
                discount: addedProduct.discount,
                discount_start: addedProduct.discount_start,
                discount_end: addedProduct.discount_end,
            };

            // find matching category group
            const categoryIndex = current.findIndex(
                (group) => group.category === addedProduct.category,
            );

            let updated: TProducts[];

            if (categoryIndex !== -1) {
                // category exists — prepend to its products
                updated = current.map((group, i) =>
                    i === categoryIndex
                        ? {
                              ...group,
                              products: [newProductEntry, ...group.products],
                          }
                        : group,
                );
            } else {
                // new category — add a new group at the start
                updated = [
                    {
                        category: addedProduct.category,
                        products: [newProductEntry],
                    },
                    ...current,
                ];
            }

            setProducts(updated);
        });

        return () => {
            socket.off("product:added");
        };
    }, []);
    return {
        createProduct,
        createProductLoading,
        createProductErrors,
    };
};

export default useCreateProduct;
