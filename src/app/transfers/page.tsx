import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

const TransferPortalTracker = dynamic(() => import('@/components/TransferPortalTracker'), {
  loading: () => <LoadingSpinner fullPage />,
})

export default function TransfersPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullPage />}>
      <TransferPortalTracker />
    </Suspense>
  )
}