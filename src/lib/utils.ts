import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function openPrivateLink(url: string): void {
  const link = document.createElement('a')
  link.href = url
  link.target = '_blank'
  link.rel = 'noopener noreferrer nofollow'
  link.referrerPolicy = 'no-referrer'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}