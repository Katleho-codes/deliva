import MyStoresScreen from '@/components/screens/stores/my-stores/page'
import RequireAuth from '@/components/auth/RequireAuth'
import React from 'react'

export default function MyStores() {
  return (
    <RequireAuth>
      <MyStoresScreen />
    </RequireAuth>
  )
}
