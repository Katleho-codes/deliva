import { TProduct, TProducts, TSingleStoreProducts } from "@/utils/types";
import { create } from "zustand";

export type ProductStateStore = {
    products: TProducts[];
    singleStoreProducts: TSingleStoreProducts[];
    product: TProduct | null;

    setProducts: (products: TProducts[]) => void;
    setSingleStoreProducts: (singleStoreProducts: TSingleStoreProducts[]) => void;
    setProduct: (product: TProduct | null) => void;
    updateOneProduct: (updated: TProduct) => void;
    removeProduct: (id: number) => void;
};

const useProductStateStore = create<ProductStateStore>((set) => ({
    products: [],
    singleStoreProducts: [],
    product: null,

    setProducts: (products) =>
        set({
            products,
        }),
    setSingleStoreProducts: (singleStoreProducts) =>
        set({
            singleStoreProducts,
        }),

    setProduct: (product) =>
        set({
            product,
        }),

    updateOneProduct: (updated) =>
        set((state) => ({
            products: state.products.map((group) => ({
                ...group,
                products: group.products.map((p) =>
                    p.product_id === updated.id
                        ? {
                              ...p,
                              name: updated.name,
                              sale_price: Number(updated.sale_price),
                              main_image: updated.main_image,
                              slug: updated.slug,
                              store_name: updated.store_name,
                          }
                        : p,
                ),
            })),

            product: state.product?.id === updated.id ? updated : state.product,
        })),

    removeProduct: (id) =>
        set((state) => ({
            products: state.products.map((group) => ({
                ...group,
                products: group.products?.filter((p) => p.product_id !== id),
            })),

            product: state.product?.id === id ? null : state.product,
        })),
}));

export default useProductStateStore;
