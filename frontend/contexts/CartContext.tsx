"use client";

import { createContext, useContext } from "react";
import useCart, { CartItem } from "@/hooks/carts/useCart";
import { useSession } from "@/lib/auth-client";

type CartContextType = ReturnType<typeof useCart>;

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {

    const cart = useCart();
    return (
        <CartContext.Provider value={cart}>
            {children}
        </CartContext.Provider>
    );
};

export const useCartContext = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCartContext must be used inside CartProvider");
    }
    return context;
};
