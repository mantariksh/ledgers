import { customAlphabet } from 'nanoid'

/**
 * Default alphabet is case-sensitive, which might be annoying
 * for usage in URLs, and has -, which makes it hard to select the ID
 * by double-clicking.
 *
 * Even with these changes, it would take 30 million years of generating
 * 1000 IDs per second to have a 1% probability of at least one collision.
 * Hopefully future developers will have a migration plan by then.
 */
const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz'
const ID_SIZE = 24
export const nanoid = customAlphabet(ALPHABET, ID_SIZE)

export const isValidNanoId = (s: string): boolean => {
  return new RegExp(`^[${ALPHABET}]{${ID_SIZE}}$`).test(s.toLowerCase())
}
