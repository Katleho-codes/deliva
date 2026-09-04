"use client"

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/lib/utils';

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-violet-50" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl" />

            {/* Grid Pattern */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}
            />

            <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
                <div className="text-center max-w-4xl mx-auto">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-indigo-100 rounded-full px-4 py-2 mb-8 shadow-sm"
                    >
                        <Sparkles className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm font-medium text-slate-600">Trusted by 2,000+ restaurants</span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 tracking-tight leading-[1.1]"
                    >
                        Food delivery{' '}
                        <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                            made simple
                        </span>
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mt-8 text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
                    >
                        Give your restaurant a branded delivery platform with real-time tracking,
                        customer portals, and powerful management tools. Start delivering in minutes.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link href={createPageUrl('Product')}>
                            <Button
                                size="lg"
                                className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-8 h-14 text-base shadow-lg shadow-slate-900/20"
                            >
                                Start for free
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                        <Button
                            size="lg"
                            variant="outline"
                            className="rounded-full px-8 h-14 text-base border-slate-200 hover:bg-slate-50"
                        >
                            <Play className="mr-2 w-5 h-5" />
                            Watch demo
                        </Button>
                    </motion.div>

                    {/* Trust Badges */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="mt-16 pt-16 border-t border-slate-200/60"
                    >
                        <p className="text-sm text-slate-500 mb-8">Trusted by 2,000+ restaurants worldwide</p>
                        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-40 grayscale">
                            {['Pizza Palace', 'Sushi Express', 'Burger Hub', 'Pasta House', 'Taco Street'].map((brand) => (
                                <span key={brand} className="text-2xl font-bold text-slate-900">{brand}</span>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Hero Image/Dashboard Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.5 }}
                    className="mt-20 relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none" />
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-slate-900/10 border border-slate-200/60">
                        <div className="bg-slate-900 px-4 py-3 flex items-center gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-400" />
                                <div className="w-3 h-3 rounded-full bg-amber-400" />
                                <div className="w-3 h-3 rounded-full bg-green-400" />
                            </div>
                            <div className="flex-1 flex justify-center">
                                <div className="bg-slate-800 rounded-md px-4 py-1 text-xs text-slate-400">
                                    dashboard.deliva.io
                                </div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-slate-50 to-indigo-50 p-8 lg:p-12">
                            <div className="grid grid-cols-3 gap-6">
                                <div className="col-span-2 bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                                    <div className="h-4 w-32 bg-slate-200 rounded mb-4" />
                                    <div className="h-48 bg-gradient-to-r from-indigo-100 to-violet-100 rounded-lg" />
                                </div>
                                <div className="space-y-6">
                                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                                        <div className="h-4 w-20 bg-slate-200 rounded mb-3" />
                                        <div className="h-8 w-24 bg-indigo-500 rounded" />
                                    </div>
                                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                                        <div className="h-4 w-20 bg-slate-200 rounded mb-3" />
                                        <div className="h-8 w-24 bg-emerald-500 rounded" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}