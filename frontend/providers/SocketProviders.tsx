"use client"

import useSocket from "@/hooks/useSocket"

function SocketProvider({ children }: { children: React.ReactNode }) {
    useSocket() // sets up connection and listeners
    return <>{children}</>
}

export default SocketProvider