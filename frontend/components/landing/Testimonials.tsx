"use client"

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
    {
        quote: "Deliva gave us our own branded delivery platform in minutes. Customers love getting real-time tracking links, and we've seen a 40% reduction in 'where's my order' calls.",
        author: "Marco Rossi",
        role: "Owner, Bella Pizza",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        rating: 5
    },
    {
        quote: "The customer portal is a game changer. Our customers can track their food in real-time and see exactly when it'll arrive. Sales have increased by 25% since we switched.",
        author: "Sarah Lee",
        role: "Manager, Dragon Wok",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
        rating: 5
    },
    {
        quote: "We run 5 locations and each one has their own branded portal. The multi-tenant setup is perfect for our franchise model. Setup took less than an hour!",
        author: "James Peterson",
        role: "CEO, Burger Collective",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        rating: 5
    },
];

export default function Testimonials() {
    return (
        <section className="py-32 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-indigo-100/40 to-violet-100/40 rounded-full blur-3xl" />

            <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="inline-block text-sm font-semibold text-indigo-600 mb-4"
                    >
                        TESTIMONIALS
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight"
                    >
                        Loved by teams{' '}
                        <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                            everywhere
                        </span>
                    </motion.h2>
                </div>

                {/* Testimonials Grid */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={testimonial.author}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="relative"
                        >
                            <div className="bg-white rounded-3xl p-8 h-full border border-slate-100 shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300">
                                {/* Quote Icon */}
                                <div className="absolute -top-4 left-8">
                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center">
                                        <Quote className="w-5 h-5 text-white fill-current" />
                                    </div>
                                </div>

                                {/* Rating */}
                                <div className="flex gap-1 mb-6 pt-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                                    ))}
                                </div>

                                {/* Quote */}
                                <p className="text-lg text-slate-700 leading-relaxed mb-8">
                                    "{testimonial.quote}"
                                </p>

                                {/* Author */}
                                <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
                                    <img
                                        src={testimonial.avatar}
                                        alt={testimonial.author}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <div className="font-semibold text-slate-900">{testimonial.author}</div>
                                        <div className="text-sm text-slate-500">{testimonial.role}</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-20 text-center"
                >
                    <p className="text-slate-600 mb-4">Join 2,000+ restaurants already using Deliva</p>
                    <div className="flex items-center justify-center gap-2">
                        <div className="flex -space-x-3">
                            {[
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face',
                                'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=40&h=40&fit=crop&crop=face',
                                'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=40&h=40&fit=crop&crop=face',
                                'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=40&h=40&fit=crop&crop=face',
                            ].map((src, i) => (
                                <img
                                    key={i}
                                    src={src}
                                    alt=""
                                    className="w-10 h-10 rounded-full border-2 border-white object-cover"
                                />
                            ))}
                        </div>
                        <div className="flex items-center gap-1 ml-3">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
                            ))}
                            <span className="ml-1 text-sm font-medium text-slate-700">4.9/5</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}