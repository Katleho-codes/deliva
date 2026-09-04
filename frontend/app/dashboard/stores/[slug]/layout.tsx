"use client"
import { useSession } from '@/lib/auth-client';
import { useParams, usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import {
  LayoutDashboard, Package, ShoppingBag,
  Users, UserCog, Settings, Trash2,
  ChevronLeft, Menu, X, Store
} from "lucide-react"
import Link from 'next/link';
import Logo from '@/components/Logo';

const navItems = [
  { label: "Overview", href: "", icon: LayoutDashboard },
  { label: "Products", href: "/products", icon: Package },
  { label: "Orders", href: "/orders", icon: ShoppingBag },
  { label: "Customers", href: "#", icon: Users },
  { label: "Staff", href: "#", icon: UserCog },
  { label: "Settings", href: "#", icon: Settings },
]

function StoreDashboardLayout({ children }: { children: React.ReactNode }) {
  const params = useParams(); // Fetch URL parameters
  const pathname = usePathname()
  const { slug } = params;
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const {
    data: session,
    isPending, //loading state
  } = useSession()
  const router = useRouter()

  // gate: unauthenticated visitors never see the dashboard shell
  useEffect(() => {
    if (!isPending && !session) {
      router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`)
    }
  }, [isPending, session, router, pathname])

  if (isPending) {
    return (
      <div className="min-h-screen grid place-content-center bg-[#FAFAF8]">
        <p className="text-sm text-[#999] animate-pulse">Loading dashboard...</p>
      </div>
    )
  }

  if (!session) {
    return null // redirect in flight
  }

  const base = `/dashboard/stores/${slug}`
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex">

      {/* mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* sidebar */}
      <aside className={`fixed top-0 left-0 h-screen w-60 bg-white border-r border-[#E5E4DF] z-30 flex flex-col transition-transform duration-200
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:z-auto`}>

        {/* store name */}
        <div className="p-5 border-b border-[#E5E4DF]">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <Logo size="sm" />
            <span className="font-semibold text-sm">Deliva</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F5F4F0] flex items-center justify-center shrink-0">
              <Store className="h-4 w-4 text-[#999]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#191919] truncate capitalize">{slug}</p>
              <p className="text-xs text-[#999]">Dashboard</p>
            </div>
          </div>
        </div>

        {/* nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const href = `${base}${item.href}`
            const active = pathname === href
            const Icon = item.icon
            return (
              <Link
                key={item.label}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active
                  ? "bg-[#F86624]/10 text-[#F86624] font-medium"
                  : "text-[#666] hover:bg-[#F5F4F0] hover:text-[#191919]"
                  }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* bottom */}
        <div className="p-3 border-t border-[#E5E4DF] space-y-0.5">
          <Link
            href={`/stores/${slug}`}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#666] hover:bg-[#F5F4F0] hover:text-[#191919] transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            View store
          </Link>
        </div>
      </aside>

      {/* main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* mobile topbar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-[#E5E4DF]">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5 text-[#666]" />
          </button>
          <p className="text-sm font-medium capitalize">{slug}</p>
        </div>

        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default StoreDashboardLayout