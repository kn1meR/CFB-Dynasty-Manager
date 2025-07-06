import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

const SocialMediaPage = dynamic(() => import('@/components/SocialMediaPage'), {
  loading: () => <LoadingSpinner fullPage />,
})

export default function Social() {
  return (
    <Suspense fallback={<LoadingSpinner fullPage />}>
      <SocialMediaPage />
    </Suspense>
  )
}