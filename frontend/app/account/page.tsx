import AccountScreen from '@/components/screens/account/page'
import RequireAuth from '@/components/auth/RequireAuth'
import React from 'react'

function Account() {
    return (
        <RequireAuth>
            <AccountScreen />
        </RequireAuth>
    )
}

export default Account