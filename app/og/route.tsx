import { ImageResponse } from 'next/og'

export function GET(request: Request) {
  let url = new URL(request.url)
  let title = url.searchParams.get('title') || 'Phuoc Thinh — Software Developer'

  return new ImageResponse(
    (
      <div tw="flex flex-col w-full h-full justify-between bg-white p-16">
        <div tw="flex items-center gap-3">
          <div tw="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-sm font-bold text-neutral-900">
            PT
          </div>
          <span tw="text-base font-semibold text-neutral-500">phuocthinh.is-a.dev</span>
        </div>
        <h2 tw="text-6xl font-bold tracking-tight text-neutral-900 leading-tight max-w-3xl">
          {title}
        </h2>
        <p tw="text-xl text-neutral-500">Phuoc Thinh — SysAdmin - Cyber Security - DevSecOps</p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
