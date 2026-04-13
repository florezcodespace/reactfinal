import { useEffect, useRef } from 'react'

function SpaceBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      return undefined
    }

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const reducedMotion = reducedMotionQuery.matches
    const context = canvas.getContext('2d')

    if (!context) {
      return undefined
    }

    let animationFrameId = 0
    let width = 0
    let height = 0
    let dpr = 1
    let particles = []
    let comets = []
    let isVisible = !document.hidden

    const particleCount = () => {
      if (reducedMotion) {
        return 42
      }

      if (width < 640) {
        return 56
      }

      if (width < 1280) {
        return 92
      }

      return 132
    }

    const cometCount = () => {
      if (reducedMotion) {
        return 0
      }

      if (width < 640) {
        return 1
      }

      if (width < 1280) {
        return 2
      }

      return 3
    }

    const randomBetween = (min, max) => min + Math.random() * (max - min)

    const createParticle = () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: randomBetween(0.5, 2.2),
      speedX: randomBetween(-0.08, 0.08),
      speedY: randomBetween(-0.06, 0.06),
      alpha: randomBetween(0.2, 1),
      twinkleOffset: Math.random() * Math.PI * 2,
      color:
        Math.random() > 0.7
          ? '96,165,250'
          : Math.random() > 0.45
            ? '255,255,255'
            : '124,58,237',
    })

    const createComet = () => ({
      x: randomBetween(-width * 0.1, width * 0.9),
      y: randomBetween(-height * 0.6, -80),
      length: randomBetween(140, 260),
      speedX: randomBetween(5.5, 8.5),
      speedY: randomBetween(6.5, 10.5),
      alpha: randomBetween(0.35, 0.8),
      delay: randomBetween(0, 1200),
      cooldown: randomBetween(280, 720),
      active: Math.random() > 0.45,
    })

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      particles = Array.from({ length: particleCount() }, createParticle)
      comets = Array.from({ length: cometCount() }, createComet)
    }

    const drawNebula = () => {
      const gradientOne = context.createRadialGradient(
        width * 0.18,
        height * 0.24,
        0,
        width * 0.18,
        height * 0.24,
        width * 0.48,
      )
      gradientOne.addColorStop(0, 'rgba(96,165,250,0.16)')
      gradientOne.addColorStop(0.45, 'rgba(96,165,250,0.06)')
      gradientOne.addColorStop(1, 'rgba(96,165,250,0)')

      const gradientTwo = context.createRadialGradient(
        width * 0.82,
        height * 0.12,
        0,
        width * 0.82,
        height * 0.12,
        width * 0.42,
      )
      gradientTwo.addColorStop(0, 'rgba(124,58,237,0.15)')
      gradientTwo.addColorStop(0.5, 'rgba(124,58,237,0.06)')
      gradientTwo.addColorStop(1, 'rgba(124,58,237,0)')

      const gradientThree = context.createRadialGradient(
        width * 0.5,
        height * 0.78,
        0,
        width * 0.5,
        height * 0.78,
        width * 0.38,
      )
      gradientThree.addColorStop(0, 'rgba(59,130,246,0.08)')
      gradientThree.addColorStop(0.55, 'rgba(59,130,246,0.04)')
      gradientThree.addColorStop(1, 'rgba(59,130,246,0)')

      context.fillStyle = gradientOne
      context.fillRect(0, 0, width, height)
      context.fillStyle = gradientTwo
      context.fillRect(0, 0, width, height)
      context.fillStyle = gradientThree
      context.fillRect(0, 0, width, height)
    }

    const drawParticle = (particle, time) => {
      const twinkle = 0.45 + Math.sin(time * 0.0013 + particle.twinkleOffset) * 0.35
      const alpha = Math.max(0.08, particle.alpha * twinkle)

      context.beginPath()
      context.fillStyle = `rgba(${particle.color},${alpha})`
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
      context.fill()

      if (particle.radius > 1.4) {
        context.beginPath()
        context.strokeStyle = `rgba(${particle.color},${alpha * 0.35})`
        context.moveTo(particle.x - particle.radius * 3.2, particle.y)
        context.lineTo(particle.x + particle.radius * 3.2, particle.y)
        context.moveTo(particle.x, particle.y - particle.radius * 3.2)
        context.lineTo(particle.x, particle.y + particle.radius * 3.2)
        context.stroke()
      }
    }

    const drawConnections = () => {
      if (reducedMotion) {
        return
      }

      for (let index = 0; index < particles.length; index += 1) {
        const particle = particles[index]

        for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 3) {
          const nextParticle = particles[nextIndex]
          const deltaX = particle.x - nextParticle.x
          const deltaY = particle.y - nextParticle.y
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

          if (distance < 120) {
            const opacity = (1 - distance / 120) * 0.08
            context.beginPath()
            context.strokeStyle = `rgba(148,163,184,${opacity})`
            context.moveTo(particle.x, particle.y)
            context.lineTo(nextParticle.x, nextParticle.y)
            context.stroke()
          }
        }
      }
    }

    const updateParticle = (particle) => {
      particle.x += particle.speedX
      particle.y += particle.speedY

      if (particle.x < -20) particle.x = width + 20
      if (particle.x > width + 20) particle.x = -20
      if (particle.y < -20) particle.y = height + 20
      if (particle.y > height + 20) particle.y = -20
    }

    const updateComet = (comet) => {
      if (!comet.active) {
        comet.delay -= 1

        if (comet.delay <= 0) {
          comet.active = true
          comet.x = randomBetween(-width * 0.12, width * 0.88)
          comet.y = randomBetween(-height * 0.65, -80)
          comet.length = randomBetween(140, 260)
          comet.speedX = randomBetween(5.5, 8.5)
          comet.speedY = randomBetween(6.5, 10.5)
          comet.alpha = randomBetween(0.35, 0.8)
        }

        return
      }

      comet.x += comet.speedX
      comet.y += comet.speedY

      if (comet.x > width + 280 || comet.y > height + 280) {
        comet.active = false
        comet.delay = comet.cooldown
      }
    }

    const drawComet = (comet) => {
      if (!comet.active) {
        return
      }

      const angle = Math.atan2(comet.speedY, comet.speedX)
      const tailX = Math.cos(angle) * comet.length
      const tailY = Math.sin(angle) * comet.length

      context.beginPath()
      context.strokeStyle = `rgba(255,255,255,${comet.alpha})`
      context.lineWidth = 2.2
      context.moveTo(comet.x, comet.y)
      context.lineTo(comet.x - tailX, comet.y - tailY)
      context.stroke()

      const tailGradient = context.createLinearGradient(
        comet.x,
        comet.y,
        comet.x - tailX,
        comet.y - tailY,
      )
      tailGradient.addColorStop(0, `rgba(255,255,255,${comet.alpha})`)
      tailGradient.addColorStop(0.22, `rgba(96,165,250,${comet.alpha * 0.9})`)
      tailGradient.addColorStop(0.6, `rgba(124,58,237,${comet.alpha * 0.36})`)
      tailGradient.addColorStop(1, 'rgba(124,58,237,0)')

      context.beginPath()
      context.strokeStyle = tailGradient
      context.lineWidth = 5.4
      context.moveTo(comet.x, comet.y)
      context.lineTo(comet.x - tailX, comet.y - tailY)
      context.stroke()

      context.beginPath()
      context.fillStyle = 'rgba(255,255,255,0.98)'
      context.arc(comet.x, comet.y, 2.8, 0, Math.PI * 2)
      context.fill()
    }

    const render = (time) => {
      if (!isVisible) {
        animationFrameId = 0
        return
      }

      context.clearRect(0, 0, width, height)
      context.fillStyle = '#050505'
      context.fillRect(0, 0, width, height)
      drawNebula()

      particles.forEach((particle) => {
        updateParticle(particle)
        drawParticle(particle, time)
      })

      drawConnections()

      comets.forEach((comet) => {
        updateComet(comet)
        drawComet(comet)
      })

      animationFrameId = window.requestAnimationFrame(render)
    }

    const handleVisibilityChange = () => {
      isVisible = !document.hidden

      if (isVisible && !animationFrameId) {
        animationFrameId = window.requestAnimationFrame(render)
      }
    }

    resize()
    animationFrameId = window.requestAnimationFrame(render)
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return (
    <div className="space-background">
      <canvas ref={canvasRef} className="space-canvas" aria-hidden="true" />
      <div className="space-vignette" />
    </div>
  )
}

export default SpaceBackground
