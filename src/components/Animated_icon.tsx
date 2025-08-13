"use client"

import { useEffect, useState } from "react"

export default function Animated_icon() {
  const [drew, setDrew] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDrew(true)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="w-40 h-40 mt-12">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="#60a5fa"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`w-full h-full ${drew ? 'animate-pulse' : 'animate-moon'}`}
      >
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
    </div>
  )
}
