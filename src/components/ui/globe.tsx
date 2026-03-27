"use client"

import { useEffect, useRef, useCallback } from "react"
import createGlobe, { type COBEOptions } from "cobe"
import { useMotionValue, useSpring } from "motion/react"

import { cn } from "@/lib/utils"

const MOVEMENT_DAMPING = 1400

const GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [1, 1, 1],
  markerColor: [251 / 255, 100 / 255, 21 / 255],
  glowColor: [1, 1, 1],
  markers: [
    { location: [6.5244, 3.3792], size: 0.15 },
    { location: [9.0579, 7.4951], size: 0.08 },
    { location: [7.3775, 3.947], size: 0.06 },
    { location: [5.1477, 7.3535], size: 0.05 },
    { location: [6.3382, 5.6254], size: 0.05 },
    { location: [7.7199, 4.5171], size: 0.04 },
  ],
}

export function Globe({
  className,
  config = GLOBE_CONFIG,
}: {
  className?: string
  config?: COBEOptions
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const phiRef = useRef(0)
  const widthRef = useRef(0)
  const pointerInteracting = useRef<number | null>(null)
  const pointerInteractionMovement = useRef(0)
  const globeRef = useRef<ReturnType<typeof createGlobe> | null>(null)

  const r = useMotionValue(0)
  const rs = useSpring(r, {
    mass: 1,
    damping: 30,
    stiffness: 100,
  })

  const updatePointerInteraction = (value: number | null) => {
    pointerInteracting.current = value
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value !== null ? "grabbing" : "grab"
    }
  }

  const updateMovement = useCallback((clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current
      pointerInteractionMovement.current = delta
      r.set(r.get() + delta / MOVEMENT_DAMPING)
    }
  }, [r])

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return

    const container = containerRef.current
    const canvas = canvasRef.current

    const initGlobe = () => {
      const w = container.offsetWidth
      if (w === 0) return

      widthRef.current = w
      canvas.width = w * 2
      canvas.height = w * 2

      if (globeRef.current) {
        globeRef.current.destroy()
      }

      globeRef.current = createGlobe(canvas, {
        ...config,
        width: w * 2,
        height: w * 2,
        onRender: (state) => {
          if (!pointerInteracting.current) phiRef.current += 0.005
          state.phi = phiRef.current + rs.get()
          state.width = widthRef.current * 2
          state.height = widthRef.current * 2
        },
      })

      canvas.style.opacity = "1"
    }

    // Use ResizeObserver to detect when container actually has dimensions
    const observer = new ResizeObserver(() => {
      const w = container.offsetWidth
      if (w > 0 && w !== widthRef.current) {
        widthRef.current = w
        canvas.width = w * 2
        canvas.height = w * 2
        if (!globeRef.current) {
          initGlobe()
        }
      }
    })

    observer.observe(container)

    // Also try immediately in case it already has dimensions
    requestAnimationFrame(initGlobe)

    return () => {
      observer.disconnect()
      if (globeRef.current) {
        globeRef.current.destroy()
        globeRef.current = null
      }
    }
  }, [rs, config])

  return (
    <div
      ref={containerRef}
      className={cn("mx-auto aspect-square w-full", className)}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          opacity: 0,
          transition: "opacity 500ms ease",
          cursor: "grab",
        }}
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX
          updatePointerInteraction(e.clientX)
        }}
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) =>
          e.touches[0] && updateMovement(e.touches[0].clientX)
        }
      />
    </div>
  )
}
