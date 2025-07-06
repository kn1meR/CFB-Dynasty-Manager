// src/app/insights/page.tsx
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

const InsightsPage = dynamic(() => import('@/components/InsightsPage'), {
  loading: () => <LoadingSpinner fullPage />,
})

export default function Insights() {
  return (
    <Suspense fallback={<LoadingSpinner fullPage />}>
      <InsightsPage />
    </Suspense>
  )
}