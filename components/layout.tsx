import React from 'react'

interface Props {
  children?: React.ReactNode
  className?: string
}

export function Container({ children, className = '' }: Props) {
  return (
    <div className={`w-screen h-screen flex relative ${className}`}>
      {children}
    </div>
  )
}

export function LeftPanel({ children, className = '' }: Props) {
  return (
    <div className={`hidden md:flex w-80 xl:w-96 z-10 ${className}`}>
      {children}
    </div>
  )
}

export function RightPanel({ children, className = '' }: Props) {
  return <div className={`flex-1 flex ${className}`}>{children}</div>
}
