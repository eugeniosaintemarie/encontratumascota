import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatHeartEmojiSpacing(value: string): string {
  return value.replace(/(\S)(❤️‍🩹|❤️|♥️|♥)/g, '$1 $2')
}
