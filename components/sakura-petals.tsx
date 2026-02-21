"use client"

import { useEffect, useRef, useCallback } from "react"

interface Petal {
  x: number
  y: number
  size: number
  speed: number
  swayAmplitude: number
  swaySpeed: number
  rotation: number
  rotationSpeed: number
  opacity: number
  phase: number
  variant: number // 0-2 for different petal shapes
}

const PETAL_COUNT = 18
const PETAL_COLORS = [
  [232, 114, 154], // #e8729a
  [249, 168, 212], // #f9a8d4
  [251, 207, 232], // #fbcfe8
  [244, 143, 177], // #f48fb1
  [255, 183, 197], // #ffb7c5
]

function drawPixelPetal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number,
  color: number[],
  opacity: number,
  variant: number
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.globalAlpha = opacity

  const px = Math.max(1, Math.floor(size / 5))

  // Pixel-art petal shapes -- 3 variants
  const shapes: number[][][] = [
    // variant 0: classic 5-petal
    [
      [0, 0, 1, 1, 0],
      [0, 1, 1, 1, 1],
      [1, 1, 1, 1, 0],
      [0, 1, 1, 0, 0],
      [0, 0, 1, 0, 0],
    ],
    // variant 1: rounded petal
    [
      [0, 1, 1, 0, 0],
      [1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
    ],
    // variant 2: small petal
    [
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [1, 1, 1, 1, 0],
      [0, 1, 1, 0, 0],
      [0, 0, 0, 0, 0],
    ],
  ]

  const shape = shapes[variant % 3]
  const halfW = (shape[0].length * px) / 2
  const halfH = (shape.length * px) / 2

  // Draw highlight (lighter) pixels at the top
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col] === 1) {
        const isHighlight = row <= 1
        const r = isHighlight ? Math.min(255, color[0] + 30) : color[0]
        const g = isHighlight ? Math.min(255, color[1] + 30) : color[1]
        const b = isHighlight ? Math.min(255, color[2] + 30) : color[2]
        ctx.fillStyle = `rgb(${r},${g},${b})`
        ctx.fillRect(col * px - halfW, row * px - halfH, px, px)
      }
    }
  }

  ctx.restore()
}

export function SakuraPetals() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const petalsRef = useRef<Petal[]>([])
  const animRef = useRef<number>(0)
  const timeRef = useRef(0)

  const initPetals = useCallback((width: number, height: number) => {
    const petals: Petal[] = []
    for (let i = 0; i < PETAL_COUNT; i++) {
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height - height, // start above screen for natural entry
        size: 8 + Math.random() * 10,
        speed: 0.3 + Math.random() * 0.6,
        swayAmplitude: 20 + Math.random() * 40,
        swaySpeed: 0.005 + Math.random() * 0.01,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        opacity: 0.35 + Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2,
        variant: Math.floor(Math.random() * 3),
      })
    }
    petalsRef.current = petals
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      if (petalsRef.current.length === 0) {
        initPetals(canvas.width, canvas.height)
      }
    }

    resize()
    window.addEventListener("resize", resize)

    const animate = () => {
      if (!canvas || !ctx) return
      const { width, height } = canvas

      ctx.clearRect(0, 0, width, height)
      timeRef.current++

      for (const petal of petalsRef.current) {
        // Update position
        petal.y += petal.speed
        petal.x += Math.sin(timeRef.current * petal.swaySpeed + petal.phase) * 0.5
        petal.rotation += petal.rotationSpeed

        // Reset petal when it falls off screen
        if (petal.y > height + 20) {
          petal.y = -20
          petal.x = Math.random() * width
          petal.phase = Math.random() * Math.PI * 2
        }

        // Wrap horizontally
        if (petal.x > width + 20) petal.x = -20
        if (petal.x < -20) petal.x = width + 20

        // Pick color based on variant + phase
        const colorIndex = (petal.variant + Math.floor(petal.phase)) % PETAL_COLORS.length
        const color = PETAL_COLORS[colorIndex]

        drawPixelPetal(ctx, petal.x, petal.y, petal.size, petal.rotation, color, petal.opacity, petal.variant)
      }

      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animRef.current)
    }
  }, [initPetals])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9998 }}
      aria-hidden="true"
    />
  )
}
