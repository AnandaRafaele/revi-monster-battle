import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'

const DotLottieReact = lazy(() =>
  import('@lottiefiles/dotlottie-react').then((m) => ({ default: m.DotLottieReact })),
)

interface MonsterMediaProps {
  src: string
  alt: string
  className?: string
  /** Load immediately (battle / form preview). Default: wait until near viewport. */
  eager?: boolean
}

function isLottieUrl(url: string): boolean {
  const lower = url.toLowerCase().split('?')[0] ?? ''
  return lower.endsWith('.json') || lower.endsWith('.lottie')
}

function Placeholder({
  alt,
  className,
  labeled = true,
}: {
  alt: string
  className: string
  /** Set false when parent already exposes role="img" + aria-label. */
  labeled?: boolean
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-2xl bg-sky-100 text-4xl ${className}`}
      {...(labeled ? { role: 'img' as const, 'aria-label': alt } : { 'aria-hidden': true })}
    >
      👾
    </div>
  )
}

export function MonsterMedia({ src, alt, className = '', eager = false }: MonsterMediaProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(eager)
  const [failed, setFailed] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  useEffect(() => {
    if (eager) {
      setInView(true)
      return
    }
    const el = rootRef.current
    if (!el || inView) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { rootMargin: '200px 0px', threshold: 0.01 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [eager, inView])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mq.matches)
    const onChange = () => setReduceMotion(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const lottie = useMemo(() => isLottieUrl(src), [src])

  if (failed || !src) {
    return <Placeholder alt={alt} className={className} />
  }

  if (lottie && reduceMotion) {
    return <Placeholder alt={alt} className={className} />
  }

  if (lottie) {
    return (
      <div
        ref={rootRef}
        className={`monster-media relative isolate overflow-hidden rounded-2xl bg-sky-50 ${className}`}
        role="img"
        aria-label={alt}
      >
        {inView ? (
          <Suspense fallback={<Placeholder alt={alt} className="h-full w-full" labeled={false} />}>
            <DotLottieReact
              src={src}
              loop
              autoplay
              className="absolute inset-0 h-full w-full"
              style={{ width: '100%', height: '100%' }}
            />
          </Suspense>
        ) : (
          <Placeholder alt={alt} className="h-full w-full" labeled={false} />
        )}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={`rounded-2xl object-cover ${className}`}
      onError={() => setFailed(true)}
    />
  )
}
