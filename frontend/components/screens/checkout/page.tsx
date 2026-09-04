"use client"
import crypto from "crypto";

import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/Logo";
import useGetLatestPendingOrder from "@/hooks/orders/get-latest-pending-order";
import { useSession } from "@/lib/auth-client";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";

function CheckoutScreen() {
    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = useSession()
    // const { cart, addToCart, removeFromCart, cartCount } = useCartContext();
    const { latestPendingOrderList,
        latestPendingOrderListLoading,
        order_number,
        order_id,
        sub_total,
        total_amount,
        delivery_fee,
        itemsCount } = useGetLatestPendingOrder()


    // warn on browser close / tab close / refresh
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault()
            e.returnValue = "" // triggers browser's native dialog
        }

        window.addEventListener("beforeunload", handleBeforeUnload)
        return () => window.removeEventListener("beforeunload", handleBeforeUnload)
    }, [])

    const handleLeave = async () => {
        setShowLeaveDialog(false)
        const target = pendingNavigation
        setPendingNavigation(null)
        // flip order back so cart is usable again
        if (target) {
            // best-effort: abandon the pending order + restore the cart
            try {
                if (order_id) {
                    await api.post(`/api/orders/${order_id}/abandon`)
                }
            } catch (error) {
                console.error("abandon checkout error", error)
            }
            router.push(target)
        }
    }

    const handleStay = () => {
        setShowLeaveDialog(false)
        setPendingNavigation(null)
    }

    // intercept "Back to cart" click
    const handleBack = (e: React.MouseEvent) => {
        e.preventDefault()
        setPendingNavigation("/")
        setShowLeaveDialog(true)
    }

    const [email, setEmail] = useState("")
    const [openAccordion, setOpenAccordion] = useState<string[]>(["step-1"])
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [first_name, setFirstName] = useState("")
    const [last_name, setLastName] = useState("")
    const [address, setAddress] = useState("")
    const [province, setProvince] = useState("")
    const [postal_code, setPostalCode] = useState("")
    const [phone, setPhone] = useState("")

    const router = useRouter()
    const [showLeaveDialog, setShowLeaveDialog] = useState(false)
    const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)



    // this is for the ui, data will be validated on the backend
    // const shipping_fee = cartSubTotal >= 500 ? 0 : 60;


    useEffect(() => {
        if (session?.user) {
            setEmail(session.user.email ?? "")
        }
    }, [session])


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        const values = { first_name, last_name, address, province, email, postal_code, phone, status: "paid" }
        try {
            // save shipping first
            const response = await axios.put(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/orders/${order_id}/shipping`, values, {
                withCredentials: true
            })

            if (response.data?.status) toast.success(response.data.message)


            // then submit to PayFast programmatically
            const form = document.createElement("form")
            form.method = "POST"
            form.action = "https://sandbox.payfast.co.za/eng/process"

            const fields = {
                merchant_id: process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID!,
                merchant_key: process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_KEY!,
                amount: String(Math.round(Number(total_amount))),
                item_name: order_number,
                custom_int1: String(order_id), // so notify_url knows which order to update
                // notify_url: `https://deliva.lsquared.org.za/api/payments/notify`,
                // return_url: `https://deliva.lsquared.org.za/orders/${order_id}/orders`,
                // cancel_url: `https://deliva.lsquared.org.za/checkout`,
            }

            for (const [key, value] of Object.entries(fields)) {
                const input = document.createElement("input")
                input.type = "hidden"
                input.name = key
                input.value = value
                form.appendChild(input)
            }

            document.body.appendChild(form)
            form.submit()

        } catch (err: any) {
            console.error(err.message)
            setIsSubmitting(false)
        }
    }

    if (itemsCount === 0) return <div className="h-screen grid place-content-center"><>

        No items to checkout
        <Link href={"/"}>
            <Button type="button">Go back to home</Button>
        </Link>
    </></div>
    return (
        <>
            {/* Leave warning dialog */}
            {showLeaveDialog && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full space-y-4 shadow-xl">
                        <div className="space-y-1">
                            <h2 className="text-lg font-semibold">Leave checkout?</h2>
                            <p className="text-sm text-muted-foreground">
                                Your order is saved but your cart will remain on hold.
                                You can return to complete your purchase anytime.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={handleStay}
                            >
                                Stay
                            </Button>
                            <Button
                                variant="destructive"
                                className="flex-1"
                                onClick={handleLeave}
                            >
                                Leave anyway
                            </Button>
                        </div>
                    </div>
                </div>

            )}
            {
                isPending ? (<p>Loading user...</p>) : session ? (
                    <div className="min-h-screen bg-slate-50">
                        <div className="mx-auto max-w-6xl px-4 py-6">

                            <div className="flex flex-col-reverse md:grid md:grid-cols-2 md:gap-8">
                                <Card className="bg-white rounded-xl border-cardline p-6 gap-0 shadow-none">
                                    <form onSubmit={handleSubmit}
                                        className="space-y-6"
                                    >
                                        {/* Logo */}
                                        <Link
                                            href="/"
                                            className="flex items-center justify-center gap-2 mb-6"
                                        >
                                            <div className="flex items-center justify-center gap-2 mb-6">
                                            <Logo />
                                            <span className="text-xl font-semibold">Deliva</span>
                                        </div>
                                        </Link>

                                        {/* Contact */}
                                        <div className="space-y-2">
                                            <h2 className="text-lg font-semibold">Contact</h2>
                                            <div className="space-y-1">
                                                <Label htmlFor="email">Email address</Label>
                                                <Input id="email" type="email" defaultValue={email} onChange={(e) => setEmail(e.target.value)} />
                                            </div>
                                        </div>

                                        {/* Shipping */}
                                        <div className="space-y-4">
                                            <h2 className="text-lg font-semibold">Shipping information</h2>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <Label>First name</Label>
                                                    <Input onChange={(e) => setFirstName(e.target.value)} required />
                                                </div>
                                                <div>
                                                    <Label>Last name</Label>
                                                    <Input onChange={(e) => setLastName(e.target.value)} required />
                                                </div>
                                            </div>
                                            <div>
                                                <Label>Address</Label>
                                                <Input onChange={(e) => setAddress(e.target.value)} required />
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Province</Label>
                                                    <select
                                                        className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                                                        onChange={(e) => setProvince(e.target.value)}
                                                        required
                                                    >
                                                        <option value="">Select province</option>
                                                        <option>Gauteng</option>
                                                        <option>Western Cape</option>
                                                        <option>KwaZulu-Natal</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <Label>Postal code</Label>
                                                    <Input maxLength={4} onChange={(e) => setPostalCode(e.target.value)} required />
                                                </div>
                                            </div>

                                            <div>
                                                <Label>Phone</Label>
                                                <Input type="tel" onChange={(e) => setPhone(e.target.value)} required />
                                            </div>


                                            <div className="flex items-center justify-between pt-4">
                                                <Button variant="ghost" type="button" onClick={handleBack}>Back to cart</Button>
                                                <Button type="submit" disabled={isSubmitting}>
                                                    {isSubmitting ? "Processing..." : "Continue to payment"}
                                                </Button>
                                            </div>
                                        </div>

                                    </form>
                                </Card>
                                <div className="mb-6 md:hidden">
                                    <Accordion openIds={openAccordion} onChange={setOpenAccordion} multiple>
                                        <Accordion.Item id="step-1">
                                            <Accordion.Trigger id="step-1">Order summary ({itemsCount} items)</Accordion.Trigger>
                                            <Accordion.Content id="step-1">
                                                <p className="text-gray-500"><span className="font-semibold text-gray-800">{itemsCount}</span> items</p>
                                                <p className="text-gray-500">Subtotal <span className="font-semibold text-gray-800">{formatCurrency.format(Number(sub_total))}</span></p>
                                                <p className="text-gray-500">Delivery <span className="font-semibold text-gray-800">{formatCurrency.format(Number(delivery_fee))}</span></p>
                                                <p className="text-gray-500">To pay <span className="font-semibold text-gray-800">{formatCurrency.format(Number(total_amount))}</span></p>
                                            </Accordion.Content>
                                        </Accordion.Item>
                                    </Accordion>

                                </div>
                                <div className="hidden md:block">
                                    <Card className="sticky top-6 gap-0 bg-white rounded-xl border-cardline p-6 shadow-none">
                                        <h2 className="text-lg font-semibold mb-4">Order summary</h2>
                                        <p><span>{itemsCount}</span> items</p>
                                        <p>Subtotal <span>{formatCurrency.format(Number(sub_total))}</span></p>
                                        <p>Delivery <span>{formatCurrency.format(Number(delivery_fee))}</span></p>
                                        <p>To pay <span>{formatCurrency.format(Number(total_amount))}</span></p>
                                    </Card>
                                </div>
                            </div>
                        </div>

                    </div>


                ) : (<Link href={"/auth/login"}>
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6 cursor-pointer">
                        Login/signup
                    </Button>
                </Link>)
            }
        </>
    )
}

export default CheckoutScreen