import React from 'react'
import './Card.css'

type CardProps = {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'empty' | 'login'
}

export default function Card({ 
  children, 
  className = '', 
  variant = 'default' 
}: CardProps) {
  return (
    <div className={`card card-${variant} ${className}`}>
      {children}
    </div>
  )
}
