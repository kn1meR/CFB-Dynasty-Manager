import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

const TrophyCase = dynamic(() => import('@/components/TrophyCase'), {
  loading: () => <LoadingSpinner fullPage />,
})

export default function TrophyCasePage() {
  return (
    <Suspense fallback={<LoadingSpinner fullPage />}>
      <TrophyCase />
    </Suspense>
  )
}