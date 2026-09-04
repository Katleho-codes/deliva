
import LoginScreen from '@/components/auth/login/page';
import type { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
    title: 'Login',
    description: '...',
}


export default function page() {


    return (
        <Suspense fallback={null}>
            <LoginScreen />
        </Suspense>
    )
}
