import TrackOrderScreen from '@/components/screens/orders/track'
import RequireAuth from '@/components/auth/RequireAuth'
import React from 'react'

function TrackOrder() {
    return (
        <RequireAuth>
            <TrackOrderScreen />
        </RequireAuth>
    )
}

export default TrackOrder