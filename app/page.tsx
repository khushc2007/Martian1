"use client"

import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

export default function Page() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [needsPermission, setNeedsPermission] = useState(false)
  const [gyroActive, setGyroActive] = useState(false)
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(false)
  const frameRef = useRef<number>()
  const lastMouseRef = useRef<number>(0)
  const lastUpdateRef = useRef<number>(0)
  const router = useRouter()

  const requestOrientation = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
      try {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission()
        if (permissionState === "granted") {
          setNeedsPermission(false)
          setGyroActive(true)
          setShouldAnimate(true)
        }
      } catch (error) {
        console.error("Permission denied:", error)
      }
    } else {
      setNeedsPermission(false)
      setGyroActive(true)
      setShouldAnimate(true)
    }
  }

  useEffect(() => {
    // Throttled mouse handler — 32ms ≈ 30fps cap
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now()
      if (now - lastMouseRef.current < 32) return
      lastMouseRef.current = now
      const x = (e.clientX - window.innerWidth / 2) / window.innerWidth
      const y = (e.clientY - window.innerHeight / 2) / window.innerHeight
      setMousePosition({ x, y })
    }

    const handleOrientation = (e: DeviceOrientationEvent) => {
      const now = Date.now()
      if (now - lastUpdateRef.current < 32) return
      lastUpdateRef.current = now

      if (frameRef.current) cancelAnimationFrame(frameRef.current)

      frameRef.current = requestAnimationFrame(() => {
        const isLandscape = window.innerWidth > window.innerHeight
        let x = 0
        if (isLandscape) {
          const beta = e.beta || 0
          x = Math.max(-1, Math.min(1, beta / 45))
        } else {
          const gamma = e.gamma || 0
          x = Math.max(-1, Math.min(1, gamma / 45))
        }
        setMousePosition({ x, y: 0 })
      })
    }

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    const isTablet = /iPad|Android/i.test(navigator.userAgent) && window.innerWidth >= 768
    const isTouchDevice = isMobile || isTablet || "ontouchstart" in window || navigator.maxTouchPoints > 0

    if (isTouchDevice) {
      if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
        setNeedsPermission(true)
      } else {
        setGyroActive(true)
        setShouldAnimate(true)
      }
    } else {
      window.addEventListener("mousemove", handleMouseMove)
      setShouldAnimate(true)
    }

    if (gyroActive) {
      window.addEventListener("deviceorientation", handleOrientation)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("deviceorientation", handleOrientation)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [gyroActive])

  useEffect(() => {
    const timer = setTimeout(() => setAnimationComplete(true), 4000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-black">
      {needsPermission && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80">
          <button
            onClick={requestOrientation}
            className="px-8 py-4 bg-white/10 border border-white/30 text-white text-lg font-mono rounded-lg hover:bg-white/20 transition-colors backdrop-blur-sm"
          >
            Enable Parallax Effect
          </button>
        </div>
      )}

      {/* Layer 1 — background */}
      <div
        className={`absolute inset-0 ${shouldAnimate ? "zoom-layer-1" : ""}`}
        style={{
          transform: `translate3d(${mousePosition.x * 30}px, ${mousePosition.y * 30}px, 0)`,
          width: "130%",
          height: "130%",
          left: "-15%",
          top: "-15%",
        }}
      >
        <Image src="/images/mars-1.png" alt="Background layer" fill className="object-cover" priority />
      </div>

      {/* Layer 2 — starship */}
      <div
        className={`absolute z-5 ${shouldAnimate ? "zoom-layer-starship" : ""}`}
        style={{
          transform: `translate3d(${mousePosition.x * 50}px, ${mousePosition.y * 50}px, 0) scale(0.75)`,
          width: "800px",
          height: "800px",
          left: "20px",
          top: "20px",
        }}
      >
        <Image src="/images/starship.png" alt="Starship" fill className="object-contain" />
      </div>

      {/* Layer 3 — mid */}
      <div
        className={`absolute inset-0 z-10 ${shouldAnimate ? "zoom-layer-2" : ""}`}
        style={{
          transform: `translate3d(${mousePosition.x * 60}px, ${mousePosition.y * 60}px, 0)`,
          width: "130%",
          height: "130%",
          left: "-15%",
          top: "-15%",
        }}
      >
        <Image src="/images/mars-2.png" alt="Mid layer" fill className="object-cover" />
      </div>

      {/* Text + UI layer */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center z-10 px-6 ${shouldAnimate ? "zoom-layer-text" : ""}`}
        style={{
          transform: `translate3d(${mousePosition.x * 90}px, ${mousePosition.y * 90}px, 0)`,
          perspective: "1000px",
        }}
      >
        {/* WATER-IQ title */}
        <div className="flex text-[64px] sm:text-[100px] md:text-[140px] lg:text-[180px] leading-none">
          {"WATER-IQ".split("").map((letter, index) => (
            <span
              key={index}
              className={`font-bold text-white ${shouldAnimate ? "letter-rotate" : ""}`}
              style={{
                display: "inline-block",
                transformStyle: "preserve-3d",
                animationDelay: `${index * 0.04}s`,
              }}
            >
              {letter === "-" ? <span style={{ letterSpacing: "-0.02em" }}>·</span> : letter}
            </span>
          ))}
        </div>

        {/* Subtitle */}
        <p
          className={`mt-3 text-white/40 text-xs sm:text-sm font-mono tracking-[0.25em] uppercase ${shouldAnimate ? "fade-in-sub" : "opacity-0"}`}
        >
          Developed by Khush &amp; Co.
        </p>

        {/* Icons */}
        <div
          className={`mt-6 flex items-center gap-6 ${shouldAnimate ? "fade-in-icons" : "opacity-0"}`}
        >
          {/* GitHub */}
          <a
            href="https://github.com/khushc2007"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/50 hover:text-white/90 transition-colors duration-200"
            aria-label="GitHub"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>

          {/* Globe / link */}
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/50 hover:text-white/90 transition-colors duration-200"
            aria-label="Website"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
            </svg>
          </a>
        </div>

        {/* Proceed button */}
        <button
          onClick={() => router.push("/video")}
          className={`mt-8 px-8 py-2.5 border border-white/25 text-white/70 text-xs font-mono tracking-[0.2em] uppercase rounded-full hover:border-white/60 hover:text-white hover:bg-white/5 transition-all duration-300 ${shouldAnimate ? "fade-in-btn" : "opacity-0"}`}
        >
          Proceed
        </button>
      </div>

      {/* Layer 4 — foreground */}
      <div
        className={`absolute inset-0 z-20 ${shouldAnimate ? "zoom-layer-3" : ""}`}
        style={{
          transform: `translate3d(${mousePosition.x * 120}px, ${mousePosition.y * 120}px, 0)`,
          width: "110%",
          height: "110%",
          left: "-5%",
          top: "calc(-5% + 150px)",
        }}
      >
        <Image src="/images/mars-3.png" alt="Foreground layer" fill className="object-cover" />
      </div>

      <style jsx>{`
        .zoom-layer-1 {
          animation: zoomOut1 8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .zoom-layer-starship {
          animation: zoomOutStarship 8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .zoom-layer-2 {
          animation: zoomOut2 8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .zoom-layer-3 {
          animation: zoomOut3 8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .zoom-layer-text {
          animation: zoomOutText 8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes zoomOut1 {
          0% { scale: 1.3; }
          100% { scale: 1; }
        }
        @keyframes zoomOutStarship {
          0% { scale: 1.5; }
          100% { scale: 0.75; }
        }
        @keyframes zoomOut2 {
          0% { scale: 2.5; filter: blur(20px); }
          50% { filter: blur(10px); }
          100% { scale: 1; filter: blur(0px); }
        }
        @keyframes zoomOut3 {
          0% { scale: 8; filter: blur(40px); opacity: 0; }
          30% { filter: blur(25px); opacity: 0.3; }
          70% { filter: blur(10px); opacity: 0.7; }
          100% { scale: 1; filter: blur(0px); opacity: 1; }
        }
        @keyframes zoomOutText {
          0% { scale: 3.5; opacity: 0; }
          40% { opacity: 0.3; }
          70% { opacity: 0.7; }
          100% { scale: 1; opacity: 1; }
        }

        .letter-rotate {
          animation: rotateText 8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        @keyframes rotateText {
          0% { transform: rotateY(90deg); filter: blur(30px); opacity: 0; }
          40% { filter: blur(15px); opacity: 0.5; }
          70% { filter: blur(5px); opacity: 0.8; }
          100% { transform: rotateY(0deg); filter: blur(0px); opacity: 1; }
        }

        .fade-in-sub {
          animation: fadeInUp 0.8s ease forwards;
          animation-delay: 3s;
          opacity: 0;
        }
        .fade-in-icons {
          animation: fadeInUp 0.8s ease forwards;
          animation-delay: 3.3s;
          opacity: 0;
        }
        .fade-in-btn {
          animation: fadeInUp 0.8s ease forwards;
          animation-delay: 3.6s;
          opacity: 0;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
