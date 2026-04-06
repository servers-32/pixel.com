import type { SVGProps } from 'react'

const BAG_BODY =
  'M11.75 18.5h16.5a.9.9 0 01.9.9V30.9A2.1 2.1 0 0127.35 33H12.65A2.1 2.1 0 0110.55 30.9V19.4a.9.9 0 01.9-.9z'

const BAG_HANDLE = 'M14.85 18.45v-3.55a5.15 5.15 0 0110.3 0v3.55'

/** Белая сумка поверх градиента (внутри общего <svg> логотипа). */
export function ShopBagMarkOnGradient({ opacity = 0.96 }: { opacity?: number }) {
  return (
    <g>
      <path fill="#fff" fillOpacity={opacity} d={BAG_BODY} />
      <path
        fill="none"
        stroke="#fff"
        strokeOpacity={opacity}
        strokeWidth="2.05"
        strokeLinecap="round"
        strokeLinejoin="round"
        d={BAG_HANDLE}
      />
    </g>
  )
}

/** Минималистичная сумка — для баннеров и UI (viewBox 40×40). */
export function ShopBagGlyph({
  className,
  width = 40,
  height = 40,
  ...rest
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden
      {...rest}
    >
      <path fill="currentColor" stroke="none" d={BAG_BODY} />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2.05"
        strokeLinecap="round"
        strokeLinejoin="round"
        d={BAG_HANDLE}
      />
    </svg>
  )
}
