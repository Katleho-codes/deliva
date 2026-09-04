"use client"
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Logo from '@/components/Logo';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function SignupScreen() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const router = useRouter()

    async function SignMeUp(e?: React.FormEvent) {
        e?.preventDefault()
        if (isSubmitting) return
        if (password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }
        setIsSubmitting(true)
        const { error } = await authClient.signUp.email({
            name: name,
            email: email,
            password: password,
            callbackURL: "/onboarding",
        }, {
            onSuccess() {
                router.push("/onboarding")
            },
        });
        if (error) {
            toast.error(error?.message as string);
            setIsSubmitting(false);
        }
    }
    const signInWithGoogle = async () => {
        await authClient.signIn.social({
            provider: "google",
            callbackURL: "/",
        });
    };

    const goToLogin = () => {
        router.push("/auth/login")
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
            <Card className="w-full max-w-sm">
                <div className="flex items-center gap-2 mx-auto">
                    <Logo />
                    <span className="text-xl font-semibold text-[#191919]">Deliva</span>
                </div>
                <div className='space-y-1'>
                    <h2 className="text-xl font-bold text-slate-900 text-center">Create your account</h2>
                    <p className="text-sm text-slate-500 text-center">Sign up to start shopping</p>
                </div>
                <CardContent>
                    <form onSubmit={SignMeUp} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="name">Full name</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder='John Doe'
                                autoComplete="name"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                autoComplete="new-password"
                                minLength={8}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <Button className="w-full bg-[#F15025] hover:bg-[#F86624] cursor-pointer" type='submit' disabled={isSubmitting}>
                            {isSubmitting ? "Creating account..." : "Signup"}
                        </Button>
                    </form>

                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or
                            </span>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full" onClick={signInWithGoogle}>
                        Continue with Google
                    </Button>
                    <p className="text-center text-sm text-slate-500 mt-4">
                        Already have an account?{" "}
                        <button onClick={goToLogin} className="text-[#F86624] font-semibold hover:text-[#F15025] hover:underline cursor-pointer">
                            Sign in
                        </button>
                    </p>
                </CardContent>
            </Card>
        </div>

    )
}
