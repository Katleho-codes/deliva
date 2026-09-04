import OnboardingScreen from '@/components/screens/onboarding/page'
import RequireAuth from '@/components/auth/RequireAuth'
import React from 'react'

export default function Onboarding() {
    return (
        <RequireAuth>
            <OnboardingScreen />
        </RequireAuth>
    )
}
