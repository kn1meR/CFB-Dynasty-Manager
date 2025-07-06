import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

const TeamHome = dynamic(() => import('@/components/TeamHome'), {
  loading: () => <LoadingSpinner fullPage />,
})

export default function Home() {
  return (
    <Suspense fallback={<LoadingSpinner fullPage />}>
      <TeamHome />
    </Suspense>
  )
}