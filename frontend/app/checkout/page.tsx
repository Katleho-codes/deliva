import CheckoutScreen from '@/components/screens/checkout/page'
import RequireAuth from '@/components/auth/RequireAuth'

export default function Checkoout() {
    return (
        <RequireAuth>
            <CheckoutScreen />
        </RequireAuth>
    )
}
