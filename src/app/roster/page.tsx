import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

const Roster = dynamic(() => import('@/components/Roster'), {
  loading: () => <LoadingSpinner fullPage />,
})

export default function RosterPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullPage />}>
      <Roster />
    </Suspense>
  )
}