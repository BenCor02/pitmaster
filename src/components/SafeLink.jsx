'use client'
import Link from 'next/link'

export default function SafeLink({ href, children, ...props }) {
  if (!href) {
    console.warn('[SafeLink] href is undefined, rendering span instead', props)
    return <span {...props}>{children}</span>
  }
  return <Link href={href} {...props}>{children}</Link>
}
