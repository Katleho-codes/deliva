"use client"

import Link from 'next/link';
import { Github, Twitter, Linkedin } from 'lucide-react';
import { createPageUrl } from '@/lib/utils';

export default function Footer() {
    const footerLinks = {
        Product: [
            { name: 'Features', href: createPageUrl('Home') + '#features' },
            { name: 'Pricing', href: createPageUrl('Pricing') },
            { name: 'Integrations', href: '#' },
            { name: 'Changelog', href: '#' },
        ],
        Developers: [
            { name: 'Documentation', href: createPageUrl('Developers') },
            { name: 'API Reference', href: createPageUrl('Developers') },
            { name: 'SDKs', href: createPageUrl('Developers') },
            { name: 'Status', href: '#' },
        ],
        Company: [
            { name: 'About', href: '#' },
            { name: 'Blog', href: '#' },
            { name: 'Careers', href: '#' },
            { name: 'Contact', href: '#' },
        ],
        Legal: [
            { name: 'Privacy', href: '#' },
            { name: 'Terms', href: '#' },
            { name: 'Security', href: '#' },
        ],
    };

    return (
        <footer className="bg-slate-50 border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12">
                    {/* Brand */}
                    <div className="col-span-2">
                        <Link href={createPageUrl('Home')} className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">D</span>
                            </div>
                            <span className="text-xl font-semibold text-slate-900">Deliva</span>
                        </Link>
                        <p className="mt-4 text-slate-600 text-sm leading-relaxed max-w-xs">
                            The complete delivery platform for restaurants. Branded portals, customer tracking, and powerful analytics.
                        </p>
                        <div className="flex gap-4 mt-6">
                            {[
                                { id: 1, icon: Twitter, href: '#' },
                                { id: 2, icon: Github, href: '#' },
                                { id: 3, icon: Linkedin, href: '#' },
                            ].map(({ icon: Icon, href, id }) => (
                                <Link
                                    key={id}
                                    href={href}
                                    className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                                >
                                    <Icon className="w-5 h-5 text-slate-600" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    {Object.entries(footerLinks).map(([title, links]) => (
                        <div key={title}>
                            <h3 className="text-sm font-semibold text-slate-900 mb-4">{title}</h3>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom */}
                <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-slate-500">
                        © {new Date().getFullYear()} Deliva. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2 text-sm text-slate-500">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            All systems operational
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}