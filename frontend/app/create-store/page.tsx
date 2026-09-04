import CreateStoreScreen from '@/components/screens/stores/create-store/page'
import RequireAuth from '@/components/auth/RequireAuth'
import React from 'react'

export default function CreateStore() {
    return (
        <RequireAuth>
            <CreateStoreScreen />
        </RequireAuth>
    )
}
