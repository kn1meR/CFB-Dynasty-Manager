import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

const Tools = dynamic(() => import('@/components/Tools'), {
  loading: () => <LoadingSpinner fullPage />,
})

export default function ToolsPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullPage />}>
      <Tools />
    </Suspense>
  )
}