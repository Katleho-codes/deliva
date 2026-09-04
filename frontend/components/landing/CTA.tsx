"use client"

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';
import { createPageUrl } from '@/lib/utils';

export default function CTA() {
    return (
        <section className="py-32 bg-white">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-900 p-12 lg:p-20"
                >
                    {/* Background Elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />

                    <div className="relative grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
                                Ready to launch your{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-violet-300">
                                    delivery service?
                                </span>
                            </h2>
                            <p className="mt-6 text-lg text-indigo-100/80 leading-relaxed">
                                Get your own branded delivery portal up and running in minutes.
                                No credit card required for your free trial.
                            </p>

                            <ul className="mt-8 space-y-4">
                                {[
                                    '14-day free trial',
                                    'No credit card required',
                                    'Your own branded portal',
                                    'Cancel anytime'
                                ].map((item) => (
                                    <li key={item} className="flex items-center gap-3 text-indigo-100">
                                        <div className="w-5 h-5 rounded-full bg-indigo-500/30 flex items-center justify-center">
                                            <Check className="w-3 h-3 text-indigo-300" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="lg:pl-12">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                                <div className="space-y-4">
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        className="w-full px-5 py-4 bg-white/10 border border-white/10 rounded-xl text-white placeholder:text-indigo-200/50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    />
                                    <Link href={createPageUrl('Product')}>
                                        <Button
                                            size="lg"
                                            className="w-full bg-white text-slate-900 hover:bg-indigo-50 rounded-xl h-14 text-base font-semibold"
                                        >
                                            Start free trial
                                            <ArrowRight className="ml-2 w-5 h-5" />
                                        </Button>
                                    </Link>
                                </div>
                                <p className="mt-4 text-center text-sm text-indigo-200/60">
                                    Join 2,000+ restaurants already using Deliva
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}