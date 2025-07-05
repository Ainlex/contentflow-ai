import { ContentGenerator } from '@/components/content/ContentGenerator'
import { CostTracker } from '@/components/dev/CostTracker'

export default function ContentPage() {
  return (
    <div>
      <CostTracker />
      <ContentGenerator />
    </div>
  )
} 