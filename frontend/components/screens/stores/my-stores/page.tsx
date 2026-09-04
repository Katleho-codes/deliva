"use client"

import MainNav from "@/components/MainNav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import useDeleteStore from "@/hooks/stores/delete-store"
import useGetMyStores from "@/hooks/stores/my-stores"
import useStoresStateStore from "@/state_stores/stores_state"
import { ChevronRight, Plus, Settings } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

function MyStoresScreen() {
    const { myStores } = useStoresStateStore()
    const { myStoresListLoading } = useGetMyStores()
    const [activeIndex, setActiveIndex] = useState<string | number | null>(null);
    const [storeToDelete, setStoreToDelete] = useState<string | number | null>(null);
    const [openDeleteDialogBox, setOpenDeleteDialogBox] = useState(false);

    const { deleteStore, deleteStoreLoading } = useDeleteStore()
    const toggleAccordion = (index: string | number | null) => {
        setActiveIndex(activeIndex === index ? null : index);
    };
    const toggleODeleteDialogBox = () => {
        setOpenDeleteDialogBox(true);
    }
    const router = useRouter()

    const handleDeleteStore = async () => {
        await deleteStore(Number(storeToDelete))
    }

    if (myStores.length === 0) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-3">
                <p className="text-2xl">📦</p>
                <p className="font-medium">Stores not found</p>
                <div className="space-x-4 space-y-4">
                    <Link href="/create-store">
                        <Button>Create a store</Button>
                    </Link>
                    <Link href="/">
                        <Button variant="outline">Back to home</Button>
                    </Link>
                </div>
            </div>
        </div>
    )
    return (
        <>
            <MainNav />
            <div className="h-[calc(100vh-64px)]">
                <div className="orders-header">
                    <div className="text-gray-100">My Stores</div>
                    <div className="header-sub">Track and manage your stores</div>
                </div>

                <Dialog open={openDeleteDialogBox} onOpenChange={setOpenDeleteDialogBox}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Are you absolutely sure?</DialogTitle>
                            <DialogDescription>
                                This will permanently delete this store and the details along with any linked data
                            </DialogDescription>

                            <Button variant={"destructive"} className="mb-2" onClick={handleDeleteStore}>Delete</Button>
                            <Button>Cancel</Button>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>



                <div className="px-4 py-6 max-w-4xl mx-auto">
                    <Button className="my-3 flex ms-auto" onClick={() => router.push("/create-store")}>Add a store</Button>
                    {myStoresListLoading ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3].map(i => (
                                <Card key={i} className="bg-white rounded-xl border border-cardline gap-0 shadow-none p-0 overflow-hidden animate-pulse">
                                    <div className="h-28 bg-slate-100" />
                                    <div className="p-4 space-y-2">
                                        <div className="h-4 bg-slate-100 rounded w-2/3" />
                                        <div className="h-3 bg-slate-100 rounded w-1/2" />
                                        <div className="h-3 bg-slate-100 rounded w-full" />
                                    </div>
                                    <div className="px-4 pb-4">
                                        <div className="h-9 bg-slate-100 rounded-lg" />
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : myStores.length === 0 ? (
                        <div className="py-20 text-center">
                            <div className="text-5xl mb-3">📦</div>
                            <p className="text-base text-gray-400">No stores found</p>
                            <Link href="/stores/create" className="mt-4 inline-block">
                                <Button className="gap-2 bg-[#F15025] hover:bg-[#F86624]">
                                    <Plus className="h-4 w-4" />
                                    Create store
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {myStores.map((store) => (
                                <DropdownMenu key={store.id}>
                                    <Card className="bg-white rounded-xl border border-cardline gap-0 shadow-none p-0 overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="block">
                                            <div className="p-4">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <h3 className="font-semibold text-[#191919] truncate">{store.name}</h3>
                                                        <p className="text-xs text-[#999] mt-0.5 truncate">/stores/{store.slug}</p>
                                                    </div>
                                                    <DropdownMenuTrigger asChild className="border-none outline-none cursor-pointer" onClick={() => toggleAccordion(store?.id)}>
                                                        <ChevronRight className="h-4 w-4 text-[#999] shrink-0 mt-0.5" />
                                                    </DropdownMenuTrigger>

                                                </div>
                                                {store.description && (
                                                    <p className="text-sm text-[#666] mt-2 line-clamp-2">{store.description}</p>
                                                )}
                                            </div>


                                            <DropdownMenuContent>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setStoreToDelete(store?.id);   // set ID first
                                                        setOpenDeleteDialogBox(true); // then open dialog
                                                    }}
                                                >
                                                    Delete store
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>

                                        </div>
                                        <div className="px-4 pb-4">
                                            <Link href={`/dashboard/stores/${store.slug}`}>
                                                <Button variant="outline" size="sm" className="w-full gap-2">
                                                    <Settings className="h-3.5 w-3.5" />
                                                    Manage store
                                                </Button>
                                            </Link>
                                        </div>
                                    </Card>
                                </DropdownMenu>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default MyStoresScreen