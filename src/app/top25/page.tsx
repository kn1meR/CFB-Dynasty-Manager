import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

const Top25Rankings = dynamic(() => import('@/components/Top25Rankings'), {
  loading: () => <LoadingSpinner fullPage />,
})

export default function RankingsPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullPage />}>
      <Top25Rankings />
    </Suspense>
  )
}