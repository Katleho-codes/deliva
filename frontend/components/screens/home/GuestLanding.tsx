"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Store,
    MapPin,
    ShoppingBasket,
    PackageCheck,
    MapPinned,
    Sparkles,
} from "lucide-react";
import Link from "next/link";

const steps = [
    {
        icon: MapPinned,
        title: "Find local shops",
        text: "Deliva helps you discover spaza shops and stores in your area.",
    },
    {
        icon: ShoppingBasket,
        title: "Browse products",
        text: "Compare prices and add what you need to your cart.",
    },
    {
        icon: PackageCheck,
        title: "Checkout fast",
        text: "Pay and track your delivery to the door in a few taps.",
    },
];

export default function GuestLanding() {
    return (
        <main className="bg-[#FAFAF8]">
            {/* Hero */}
            <section className="relative overflow-hidden">
                <div className="lg:mx-auto lg:container max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28 text-center">
                    <Badge className="mb-6 gap-1.5 bg-[#FFF0E8] text-[#F86624] hover:bg-[#FFF0E8]">
                        <MapPin className="h-3.5 w-3.5" />
                        Local shops near you
                    </Badge>

                    <h1 className="mx-auto max-w-3xl text-4xl lg:text-6xl font-bold tracking-tight text-[#191919]">
                        Shop from <span className="text-[#F86624]">spaza shops</span>{" "}
                        and stores around you
                    </h1>

                    <p className="mx-auto mt-6 max-w-2xl text-base lg:text-lg text-[#666]">
                        Deliva connects you with local stores in your neighbourhood.
                        Discover, order and get it delivered — without leaving home.
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button
                            size="lg"
                            asChild
                            className="w-full sm:w-auto bg-[#F15025] hover:bg-[#F86624]"
                        >
                            <Link href="/discover">
                                <MapPin className="h-5 w-5" />
                                Find stores near me
                            </Link>
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            asChild
                            className="w-full sm:w-auto"
                        >
                            <Link href="/auth/signup">Create an account</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="lg:mx-auto lg:container max-w-7xl mx-auto px-6 lg:px-8 pb-20">
                <h2 className="text-center text-2xl lg:text-3xl font-bold text-[#191919]">
                    How Deliva works
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-center text-[#666]">
                    Three simple steps from local store to your door.
                </p>

                <div className="mt-10 grid gap-6 md:grid-cols-3">
                    {steps.map((step) => (
                        <Card
                            key={step.title}
                            className="rounded-2xl border-[#E5E4DF] bg-white shadow-sm"
                        >
                            <CardContent className="p-6">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF0E8] text-[#F86624]">
                                    <step.icon className="h-6 w-6" />
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-[#191919]">
                                    {step.title}
                                </h3>
                                <p className="mt-2 text-sm text-[#666]">{step.text}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Are you a store owner */}
            <section className="bg-[#191919]">
                <div className="lg:mx-auto lg:container max-w-7xl mx-auto px-6 lg:px-8 py-16 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF0E8] text-[#F86624]">
                        <Store className="h-7 w-7" />
                    </div>
                    <h2 className="mt-5 text-2xl lg:text-3xl font-bold text-white">
                        Are you a store owner?
                    </h2>
                    <p className="mx-auto mt-3 max-w-xl text-[#BBB]">
                        Open a store on Deliva and reach customers in your
                        neighbourhood. Manage products and orders from one dashboard.
                    </p>
                    <Button
                        size="lg"
                        asChild
                        className="mt-8 bg-[#F15025] hover:bg-[#F86624]"
                    >
                        <Link href="/create-store">
                            <Sparkles className="h-5 w-5" />
                            Open a store
                        </Link>
                    </Button>
                </div>
            </section>
        </main>
    );
}
