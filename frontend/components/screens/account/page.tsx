"use client"

import MainNav from "@/components/MainNav"
import {
    Accordion
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient, useSession } from "@/lib/auth-client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { SyntheticEvent, useEffect, useState } from "react"
import toast from "react-hot-toast"

function AccountScreen() {
    const [name, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [open, setOpen] = useState<string[]>(["step-1"]);
    const router = useRouter();
    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = useSession()
    useEffect(() => {
        if (session?.user) {
            setFullName(session.user.name ?? "")
            setEmail(session.user.email ?? "")
        }
    }, [session])
    const logout = async () => {
        await authClient.signOut();
    }

    const [isEditingName, setIsEditingName] = useState(false)
    const [isEditingEmail, setIsEditingEmail] = useState(false)

    const updateName = async (e: SyntheticEvent) => {
        e.preventDefault();

        try {
            const response = await authClient.updateUser({
                name,
            })
            if (response.data?.status) toast.success("Name has been updated")
            setIsEditingName(!isEditingName)
        } catch (error) {
            console.error("update name error", error)
        }
    }
    const updateEmail = async (e: SyntheticEvent) => {
        e.preventDefault();

        try {
            const response = await authClient.changeEmail({
                newEmail: email,
                callbackURL: "/", // to redirect after verification
            });
            if (response.data?.status) toast.success("Email has been updated")
            setIsEditingEmail(!isEditingEmail)
        } catch (error) {
            console.error("update email error", error)
        }
    }

    return (
        <>
            {
                isPending ? (
                    <div className="grid min-h-screen place-content-center">
                        <p className="text-sm text-[#999] animate-pulse">Loading...</p>
                    </div>
                ) : session ? (
                    <>

                        <MainNav />

                        <div className="h-[calc(100vh-64px)] mx-auto container px-4">
                            <div className="pt-3">
                                <h1 className="my-3">Hi, {session?.user?.name}</h1>

                                <Accordion openIds={open} onChange={setOpen} multiple>
                                    <Accordion.Item id="step-1">
                                        <Accordion.Trigger id="step-1">Personal details</Accordion.Trigger>
                                        <Accordion.Content id="step-1">
                                            <div>
                                                <div className="grid gap-3">
                                                    <div>
                                                        <Label>Name</Label>
                                                        <div className="flex gap-2">
                                                            <Input
                                                                id="name"
                                                                defaultValue={name}
                                                                onChange={(e) => setFullName(e.target.value)}
                                                                disabled={!isEditingName}
                                                            />
                                                            <Button variant="outline" size="sm" onClick={() => setIsEditingName(!isEditingName)}>
                                                                {isEditingName ? "Cancel" : "Edit"}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    {isEditingName ? <Button type="button" className="w-full cursor-pointer" onClick={updateName}>Update Name</Button> : null}

                                                    <div>
                                                        <Label>Email</Label>
                                                        <div className="flex gap-2">
                                                            <Input
                                                                id="email"
                                                                defaultValue={email}
                                                                onChange={(e) => setEmail(e.target.value)}
                                                                disabled={!isEditingEmail}
                                                            />
                                                            <Button variant="outline" size="sm" onClick={() => setIsEditingEmail(!isEditingEmail)}>
                                                                {isEditingEmail ? "Cancel" : "Edit"}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    {isEditingEmail ? <>
                                                        <Button type="button" className="w-full cursor-pointer" onClick={updateEmail}>Update Email</Button>
                                                        <small>An email will be sent to verify</small>

                                                    </> : null}
                                                </div>
                                            </div>
                                        </Accordion.Content>
                                    </Accordion.Item>



                                </Accordion>

                                <Button type="button" className="w-full cursor-pointer my-3 rounded-sm" onClick={logout}>Logout</Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="grid min-h-screen place-content-center">
                        <Link href={"/auth/login"}>
                            <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6 cursor-pointer">
                                Login/signup
                            </Button>
                        </Link>
                    </div>
                )
            }

        </>
    )
}

export default AccountScreen