// src/app/tools/page.tsx
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const Tools = dynamic(() => import('@/components/Tools'), {
  loading: () => <p>Loading...</p>,
})

export default function ToolsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Tools />
    </Suspense>
  )
}