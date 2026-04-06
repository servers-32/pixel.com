import type { ReactElement, SVGProps } from 'react'
import { getCategoryId } from '../i18n/catalog'

const stroke = 'currentColor'

function IconRoot(props: SVGProps<SVGSVGElement> & { title?: string }) {
  const { title, children, ...rest } = props
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={title ? undefined : true}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  )
}

function Smartphone() {
  return (
    <IconRoot>
      <rect x="7" y="3" width="10" height="18" rx="2.5" stroke={stroke} strokeWidth="1.5" />
      <path d="M10 18.5h4" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
    </IconRoot>
  )
}

function Laptop() {
  return (
    <IconRoot>
      <rect x="4" y="5" width="16" height="10" rx="1.5" stroke={stroke} strokeWidth="1.5" />
      <path d="M2 17h20v1.5H2V17z" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
    </IconRoot>
  )
}

function Headphones() {
  return (
    <IconRoot>
      <path
        d="M4 14v3a2 2 0 0 0 2 2h1M20 14v3a2 2 0 0 1-2 2h-1"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M4 14a8 8 0 0 1 16 0"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </IconRoot>
  )
}

function Tv() {
  return (
    <IconRoot>
      <rect x="3" y="5" width="18" height="12" rx="1.5" stroke={stroke} strokeWidth="1.5" />
      <path d="M8 21h8" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 17v4" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
    </IconRoot>
  )
}

function Tablet() {
  return (
    <IconRoot>
      <rect x="5" y="2" width="14" height="20" rx="2" stroke={stroke} strokeWidth="1.5" />
      <circle cx="12" cy="18" r="0.75" fill={stroke} />
    </IconRoot>
  )
}

function HomeSmart() {
  return (
    <IconRoot>
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="17" cy="8" r="1.5" stroke={stroke} strokeWidth="1.5" />
    </IconRoot>
  )
}

function Accessories() {
  return (
    <IconRoot>
      <path
        d="M13 2 3 14h8l-1 8 11-12h-8l1-8z"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </IconRoot>
  )
}

function Cart() {
  return (
    <IconRoot>
      <circle cx="9" cy="20" r="1.25" stroke={stroke} strokeWidth="1.5" />
      <circle cx="18" cy="20" r="1.25" stroke={stroke} strokeWidth="1.5" />
      <path
        d="M3 4h2l1 12h12l2-9H7"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconRoot>
  )
}

const BY_NAME: Record<string, () => ReactElement> = {
  smartphones: Smartphone,
  laptops: Laptop,
  audio: Headphones,
  tvs: Tv,
  tablets: Tablet,
  'home-tech': HomeSmart,
  accessories: Accessories,
}

type Props = {
  category: string
  className?: string
}

export function CategoryIcon({ category, className }: Props) {
  const Cmp = BY_NAME[getCategoryId(category)] ?? Cart
  return <span className={className}><Cmp /></span>
}
