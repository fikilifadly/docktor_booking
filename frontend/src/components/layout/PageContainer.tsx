import React from 'react'
import './PageContainer.css'

type PageContainerProps = {
  children: React.ReactNode
  className?: string
  maxWidth?: string
}

export default function PageContainer({ 
  children, 
  className = '',
  maxWidth = '960px'
}: PageContainerProps) {
  return (
    <div 
      className={`page-container ${className}`}
      style={{ maxWidth }}
    >
      {children}
    </div>
  )
}
