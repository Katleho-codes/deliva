"use client";

export interface CartItem {
    product_id: number;
    name: string;
    sale_price: number;
    image: string;
    slug: string;
    quantity: number;
}
export interface IGetCart {
    cart_id: number;
    status: string;
    items: {
        product_id: number;
        name: string;
        slug: string;
        sale_price: number;
        quantity: number;
        image: string;
    }[];
}
import { useSession } from "@/lib/auth-client";
import api, { getApiErrorMessage } from "@/lib/api";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import socket from "../socket";

const useCart = () => {
    const [cart, setCart] = useState<IGetCart | null>(null);

    const [isCartLoading, setIsCartLoading] = useState(false);

    const { data: session } = useSession();

    // pull from backend (redis first) then db if nothing on redis
    const fetchUserCart = async () => {
        if (!session) return;
        try {
            setIsCartLoading(true);
            const { data } = await api.get("/api/carts");

            if (data) {
                setCart(data);
            }
        } catch (error: unknown) {
            const err = error as { response?: { status?: number } };
            if (err.response?.status !== 401) {
                console.error("useCart fetch user cart error", error);
                toast.error(getApiErrorMessage(error, "Could not load cart"));
            }
        } finally {
            setIsCartLoading(false);
        }
    };

    useEffect(() => {
        fetchUserCart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session?.user?.id]);

    // realtime cart updates via socket
    useEffect(() => {
        socket.on("cart:updated", (updatedCart: IGetCart) => {
            setCart(updatedCart);
        });

        return () => {
            socket.off("cart:updated");
        };
    }, []);

    // this will handle both add and update since we only update the quantity
    const addToCart = async (item: CartItem) => {
        try {
            const response = await api.post("/api/carts", item);
            if (response.status === 201) {
                toast.success(`${response?.data?.message}`);
            }
        } catch (error: unknown) {
            toast.error(getApiErrorMessage(error, "Could not add to cart"));
        }
    };

    const removeFromCart = async (productId: number) => {
        // optimistically update UI first
        setCart((prevCart) => {
            if (!prevCart) return prevCart;
            return {
                ...prevCart,
                items: prevCart.items.filter(
                    (item) => item.product_id !== productId,
                ),
            };
        });

        try {
            await api.delete(`/api/carts/item/${productId}`);
        } catch (error: unknown) {
            // revert on failure by refetching
            fetchUserCart();
            toast.error(getApiErrorMessage(error, "Could not remove item"));
        }
    };

    const updateCart = async (item: CartItem) => {
        try {
            await api.put("/api/carts", {
                product_id: item.product_id,
                quantity: item.quantity,
            });
            // no local state update — socket cart:updated handles it
        } catch (error: unknown) {
            toast.error(getApiErrorMessage(error, "Could not update cart"));
        }
    };

    const clearCart = async () => {
        setCart((prev) => (prev ? { ...prev, items: [] } : prev));
        try {
            await api.delete("/api/carts/clear");
        } catch (error: unknown) {
            // revert on failure by refetching
            fetchUserCart();
            toast.error(getApiErrorMessage(error, "Could not clear cart"));
        }
    };

    const cartCount =
        cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

    return {
        cart,
        addToCart,
        isCartLoading,
        updateCart,
        removeFromCart,
        clearCart,
        cartCount,
    };
};

export default useCart;
