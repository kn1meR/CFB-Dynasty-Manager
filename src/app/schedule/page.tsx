import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

const Schedule = dynamic(() => import('@/components/SchedulePage'), {
  loading: () => <LoadingSpinner fullPage />,
})

export default function SchedulePage() {
  return (
    <Suspense fallback={<LoadingSpinner fullPage />}>
      <Schedule />
    </Suspense>
  )
}