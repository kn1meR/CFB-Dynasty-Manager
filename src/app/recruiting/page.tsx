import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

const RecruitingClassTracker = dynamic(() => import('@/components/RecruitingClassTracker'), {
  loading: () => <LoadingSpinner fullPage />,
})

export default function RecruitingPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullPage />}>
      <RecruitingClassTracker />
    </Suspense>
  )
}