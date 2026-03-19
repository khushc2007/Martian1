"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

export default function VideoPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const router = useRouter()

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleEnded = () => {
      window.location.href = "https://overall-dlgjjdfkq-ddeh5x.vercel.app"
    }

    video.addEventListener("ended", handleEnded)

    // Attempt autoplay with sound — browsers may block unmuted autoplay
    video.muted = false
    video.play().catch(() => {
      // If blocked, try muted then unmute on first interaction
      video.muted = true
      video.play().then(() => {
        const unmute = () => {
          video.muted = false
          document.removeEventListener("click", unmute)
          document.removeEventListener("touchstart", unmute)
        }
        document.addEventListener("click", unmute, { once: true })
        document.addEventListener("touchstart", unmute, { once: true })
      })
    })

    return () => {
      video.removeEventListener("ended", handleEnded)
    }
  }, [])

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <video
        ref={videoRef}
        src="/video/transition.mp4"
        playsInline
        loop={false}
        autoPlay
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />
    </div>
  )
}
