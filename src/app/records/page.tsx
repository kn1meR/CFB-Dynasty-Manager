import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

const Records = dynamic(() => import('@/components/Records'), {
  loading: () => <LoadingSpinner fullPage />,
})

export default function RecordsPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullPage />}>
      <Records />
    </Suspense>
  )
}