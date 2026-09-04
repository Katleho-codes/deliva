"use client"

import { ShoppingCartIcon, StoreIcon, UserCircleIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import Logo from "./Logo";

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle
} from "@/components/ui/sheet";
import { useCartContext } from "@/contexts/CartContext";
import { CartItem } from "@/hooks/carts/useCart";
import { useSession } from "@/lib/auth-client";
import api, { getApiErrorMessage } from "@/lib/api";
import { useRouter } from "next/navigation";
import CartItemCard from "./CartItemCard";
import toast from "react-hot-toast";

function MainNav() {
    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = useSession()
    const [scrolled, setScrolled] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const { cart, addToCart, updateCart, removeFromCart, cartCount } = useCartContext();

    const handleQuantityChange = (item: CartItem, newQuantity: number) => {
        updateCart({
            ...item,
            quantity: newQuantity,
        });
    };
    const router = useRouter()
    const createOrder = async () => {
        try {
            await api.post("/api/orders/from-cart");
            router.push("/checkout")
        } catch (error) {
            console.error("create order from cart error", error)
            toast.error(getApiErrorMessage(error, "Could not start checkout"));
        }
    }
    return (
        <>
            {/* sticky wrapper for both */}
            <div className="fixed top-0 left-0 right-0 z-50">
                {/* nav */}
                <nav className="bg-white border-b">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <Link href={"/"} className="flex items-center gap-2">
                                <Logo />
                                <span className="text-xl font-semibold text-[#191919]">Deliva</span>
                            </Link>

                            {/* right side */}
                            <>
                                {isPending ? (
                                    <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />
                                ) : session ? (
                                    <div className="flex items-center gap-4">
                                        <Link className="font-medium text-[#191919]" href="/orders">Orders</Link>
                                        <Link href="/account">
                                            <button className="cursor-pointer rounded-full p-2 bg-slate-100 hover:bg-slate-100 transition">
                                                <UserCircleIcon className="w-6 h-6" />
                                            </button>
                                        </Link>
                                        <Link href="/stores/my-stores">
                                            <Button size="icon" className="bg-[#F15025] hover:bg-[#F86624] text-white rounded-full">
                                                <StoreIcon className="w-6 h-6" />
                                            </Button>
                                        </Link>
                                        <button
                                            onClick={() => setSheetOpen(true)}
                                            className="relative cursor-pointer p-2 rounded-full bg-slate-100 hover:bg-slate-100 transition"
                                        >
                                            <ShoppingCartIcon className="w-6 h-6" />
                                            {cartCount > 0 && (
                                                <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                                                    {cartCount}
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <Button
                                        className="bg-[#F15025] hover:bg-[#F86624] rounded-sm text-white p-6 cursor-pointer font-medium"
                                        onClick={() => router.push("/auth/login")}
                                    >
                                        Login/signup
                                    </Button>
                                )}
                            </>
                        </div>
                    </div>
                </nav>
            </div>

            {/* spacer — banner (~32px) + nav (64px) */}
            <div className="h-16" />
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="px-4 flex flex-col h-full">
                    <SheetHeader>
                        <SheetTitle>Your Cart</SheetTitle>
                        <SheetDescription>
                            Items you’ve added to your cart
                        </SheetDescription>
                    </SheetHeader>

                    {/* Scrollable cart items */}
                    <div className="flex-1 overflow-y-auto py-4">
                        {cart?.items.map((item) => (
                            <CartItemCard
                                key={item.product_id}
                                image={item.image}
                                name={item.name}
                                sale_price={item.sale_price}
                                quantity={item.quantity}
                                onQuantityChange={(qty) =>
                                    handleQuantityChange(item, qty)
                                }
                                onRemove={() => removeFromCart(item.product_id)}
                            />
                        ))}
                    </div>

                    {/* Sticky checkout button */}
                    {cart && cart.items.length > 0 && (
                        <div className="sticky bottom-0 bg-white border-t pt-4 pb-2">

                            <Button className="w-full" type="button" onClick={createOrder}>
                                Checkout
                            </Button>
                        </div>
                    )}
                </SheetContent>
            </Sheet>


        </>
    )
}

export default MainNav