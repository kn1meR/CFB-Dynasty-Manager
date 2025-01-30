import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

const AwardTracker = dynamic(() => import('@/components/AwardTracker'), {
  loading: () => <LoadingSpinner fullPage />,
})

export default function AwardsPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullPage />}>
      <AwardTracker />
    </Suspense>
  )
}