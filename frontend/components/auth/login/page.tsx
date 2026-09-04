"use client"
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Logo from '@/components/Logo';
import { authClient } from '@/lib/auth-client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

function GoogleIcon() {
    return (
        <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
    );
}

export default function LoginScreen() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [rememberMe, setRememberMe] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const router = useRouter()
    const searchParams = useSearchParams()
    const next = searchParams.get("next") ?? "/"

    async function logMeIn(e?: React.FormEvent) {
        e?.preventDefault()
        if (isSubmitting) return
        setIsSubmitting(true)
        const { data, error } = await authClient.signIn.email({
            email: email,
            password: password,
            rememberMe: rememberMe,
            callbackURL: next,
        });
        if (error) {
            toast.error(error?.message as string);
            setIsSubmitting(false);
            return;
        }
        router.push(next)
    }

    const signInWithGoogle = async () => {
        await authClient.signIn.social({
            provider: "google",
            callbackURL: process.env.NEXT_PUBLIC_CLIENT_URL ?? next,
        });
    };

    const goToSignup = () => {
        router.push("/auth/signup")
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
            <Card className="w-full max-w-sm">
                <div className="flex items-center gap-2 mx-auto">
                    <Logo />
                    <span className="text-xl font-semibold text-[#191919]">Deliva</span>
                </div>

                <div className='space-y-1'>
                    <h2 className="text-xl font-bold text-slate-900 text-center">Welcome back</h2>
                    <p className="text-sm text-slate-500 text-center">Sign in to continue shopping</p>
                </div>

                <CardContent>
                    <form onSubmit={logMeIn} className="space-y-4">
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
                                className='focus:ring-none'
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="rememberMe" className="text-sm text-slate-600 select-none">Remember me </label>
                            <input
                                type="checkbox"
                                id="rememberMe"
                                name="rememberMe"
                                className='cursor-pointer accent-[#F86624]'
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                        </div>

                        <Button
                            className="w-full bg-[#F15025] hover:bg-[#F86624] cursor-pointer"
                            type='submit'
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Signing in..." : "Login"}
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
                        <GoogleIcon />
                        Sign in with Google
                    </Button>
                    <p className="text-center text-sm text-slate-500 mt-4">
                        Don&apos;t have an account?{" "}
                        <button onClick={goToSignup} className="text-[#F86624] font-semibold hover:text-[#F15025] hover:underline cursor-pointer">
                            Create one
                        </button>
                    </p>
                </CardContent>
            </Card>
        </div>

    )
}
