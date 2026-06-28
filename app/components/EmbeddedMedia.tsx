'use client'

import type Hls from 'hls.js'
import { useEffect, useRef } from 'react'

const VIDEO_EXTENSION = /\.(m3u8|mp4|m4v|mov|ogv|ogg|webm)$/i
const HLS_EXTENSION = /\.m3u8$/i

/** Removes query strings before checking a media file extension. */
function sourcePath(src: string) {
  return src.split(/[?#]/, 1)[0]
}

/** Converts a GitHub file page into its raw file URL. */
export function normalizeMediaSource(src: string) {
  try {
    const url = new URL(src)
    const [owner, repository, view, branch, ...path] = url.pathname
      .split('/')
      .filter(Boolean)

    if (
      url.hostname === 'github.com' &&
      owner &&
      repository &&
      view === 'blob' &&
      branch &&
      path.length > 0
    ) {
      return `https://raw.githubusercontent.com/${owner}/${repository}/${branch}/${path.join('/')}`
    }
  } catch {
    return src
  }

  return src
}

/** Checks whether a source should use the video player. */
export function isVideoSource(src: string, alt?: string) {
  return (
    VIDEO_EXTENSION.test(sourcePath(src)) ||
    ['video', 'hls'].includes(alt?.toLowerCase() ?? '')
  )
}

/** Checks whether a source is an HLS playlist. */
export function isHlsSource(src: string, alt?: string) {
  return HLS_EXTENSION.test(sourcePath(src)) || alt?.toLowerCase() === 'hls'
}

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src?: string
}

/** Renders images normally and videos with native or HLS playback. */
export default function EmbeddedMedia({
  src = '',
  alt = '',
  className = '',
  ...props
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaSrc = normalizeMediaSource(src)
  const video = isVideoSource(mediaSrc, alt)
  const hlsSource = isHlsSource(mediaSrc, alt)

  useEffect(() => {
    const element = videoRef.current
    if (!element || !hlsSource || !mediaSrc) return

    if (element.canPlayType('application/vnd.apple.mpegurl')) {
      element.src = mediaSrc
      return () => {
        element.removeAttribute('src')
        element.load()
      }
    }

    let disposed = false
    let player: Hls | null = null

    void import('hls.js').then(({ default: HlsPlayer }) => {
      if (disposed || !HlsPlayer.isSupported()) return

      player = new HlsPlayer({ enableWorker: true })
      player.loadSource(mediaSrc)
      player.attachMedia(element)
    })

    return () => {
      disposed = true
      player?.destroy()
    }
  }, [hlsSource, mediaSrc])

  if (!video) {
    return (
      <img
        {...props}
        src={mediaSrc}
        alt={alt}
        loading={props.loading ?? 'lazy'}
        decoding={props.decoding ?? 'async'}
        className={`embedded-media ${className}`.trim()}
      />
    )
  }

  return (
    <video
      ref={videoRef}
      src={hlsSource ? undefined : mediaSrc}
      controls
      playsInline
      preload="metadata"
      aria-label={alt && !['video', 'hls'].includes(alt.toLowerCase()) ? alt : 'Embedded video'}
      className={`embedded-media ${className}`.trim()}
    />
  )
}
