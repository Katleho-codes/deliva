import OrdersScreen from '@/components/screens/orders/page'
import RequireAuth from '@/components/auth/RequireAuth'
import React from 'react'

export default function Orders() {
    return (
        <RequireAuth>
            <OrdersScreen />
        </RequireAuth>
    )
}
