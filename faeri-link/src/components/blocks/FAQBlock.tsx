import React, { useState } from 'react'
import { BlockConfig, FAQItem } from '@/types/database'
import BaseBlock from './BaseBlock'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface FAQBlockProps {
  id: string
  config: BlockConfig
  isEditing?: boolean
  onConfigChange?: (config: BlockConfig) => void
}

export const FAQBlock: React.FC<FAQBlockProps> = ({
  id,
  config,
  isEditing,
  onConfigChange,
}) => {
  const {
    questions = [],
    padding,
    margin,
  } = config

  return (
    <BaseBlock
      id={id}
      type="faq"
      config={config}
      isEditing={isEditing}
      onConfigChange={onConfigChange}
    >
      <div className="max-w-2xl mx-auto space-y-4">
        {questions.map((faq, index) => (
          <FAQItemComponent
            key={faq.id}
            faq={faq}
            index={index}
            isEditing={isEditing}
          />
        ))}
      </div>
    </BaseBlock>
  )
}

interface FAQItemComponentProps {
  faq: FAQItem
  index: number
  isEditing?: boolean
}

const FAQItemComponent: React.FC<FAQItemComponentProps> = ({
  faq,
  index,
  isEditing,
}) => {
  const [isExpanded, setIsExpanded] = useState(faq.is_expanded || false)

  return (
    <div className="border rounded-lg bg-card">
      <button
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls={`faq-content-${faq.id}`}
      >
        <h3 className="text-sm font-medium pr-4">
          {faq.question}
        </h3>
        <div className="flex-shrink-0">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div
          id={`faq-content-${faq.id}`}
          className="px-6 pb-4"
          role="region"
          aria-labelledby={`faq-heading-${faq.id}`}
        >
          <div className="text-sm text-muted-foreground leading-relaxed">
            {faq.answer}
          </div>
        </div>
      )}
    </div>
  )
}

export default FAQBlock
