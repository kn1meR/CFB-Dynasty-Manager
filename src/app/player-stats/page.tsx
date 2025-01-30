// src/app/player-stats/page.tsx
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

const PlayerStats = dynamic(() => import('@/components/PlayerStats'), {
  loading: () => <LoadingSpinner fullPage />,
})

export default function PlayerStatsPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullPage />}>
      <PlayerStats />
    </Suspense>
  )
}