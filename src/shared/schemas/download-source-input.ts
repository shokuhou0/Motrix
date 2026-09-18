import { z } from 'zod'

// Named entries must be plain filenames on every supported desktop platform.
export const downloadFilenameSchema = z
  .string()
  .min(1)
  .max(255)
  .refine((name) => !/[<>:"/\\|?*]/.test(name))
  .refine(
    (name) =>
      !Array.from(name).some(
        (ch) => ch.charCodeAt(0) < 32 || ch.charCodeAt(0) === 127
      )
  )
  .refine((name) => !/[. ]$/.test(name))
  .refine(
    (name) => !/^(con|prn|aux|nul|com[1-9¹²³]|lpt[1-9¹²³])(?:\.|$)/i.test(name)
  )

export interface ParsedLine {
  line: number
  url: string
  filename?: string
  valid: boolean
}

const VALID_SCHEMES = ['http:', 'https:', 'ftp:']

export function parseUrlLines(text: string): ParsedLine[] {
  const out: ParsedLine[] = []
  for (const [line, raw] of text.split('\n').entries()) {
    const input = raw.trim()
    if (!input) continue
    // A URL may itself contain commas, including in signed query parameters.
    const comma = /^(?:https?:\/\/|ftp:\/\/|magnet:)/i.test(input)
      ? -1
      : input.indexOf(',')
    const url = comma < 0 ? input : input.slice(comma + 1).trim()
    let filename = comma < 0 ? undefined : input.slice(0, comma).trim()
    let valid = false
    if (url.startsWith('magnet:')) {
      valid = filename === undefined && url.startsWith('magnet:?')
    } else {
      try {
        const source = new URL(url)
        valid =
          VALID_SCHEMES.includes(source.protocol) && Boolean(source.hostname)
        if (filename !== undefined) {
          const nameValid = downloadFilenameSchema.safeParse(filename).success
          if (nameValid && !/\.[^.]+$/.test(filename)) {
            let basename = source.pathname.split('/').at(-1) ?? ''
            try {
              basename = decodeURIComponent(basename)
            } catch {
              // An undecodable path can still be downloaded verbatim.
            }
            const extension = /\.[a-zA-Z0-9]{1,16}$/.exec(basename)?.[0]
            if (extension) filename += extension
          }
          valid =
            valid &&
            nameValid &&
            downloadFilenameSchema.safeParse(filename).success
        }
      } catch {
        valid = false
      }
    }
    out.push({
      line,
      url,
      ...(filename === undefined ? {} : { filename }),
      valid,
    })
  }
  return out
}
