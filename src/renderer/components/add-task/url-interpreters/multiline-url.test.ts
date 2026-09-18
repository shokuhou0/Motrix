import { describe, expect, it } from 'vitest'
import { multilineUrlInterpreter, parseUrlLines } from './multiline-url'

describe('parseUrlLines', () => {
  it('parses a single http URL', () => {
    const r = parseUrlLines('https://a.com/f')
    expect(r).toEqual([{ line: 0, url: 'https://a.com/f', valid: true }])
  })

  it('splits multiple URLs by newline', () => {
    const r = parseUrlLines('https://a\nhttps://b')
    expect(r).toHaveLength(2)
    expect(r.every((x) => x.valid)).toBe(true)
  })

  it('ignores empty lines', () => {
    const r = parseUrlLines('https://a\n\nhttps://b')
    expect(r).toHaveLength(2)
  })

  it('marks invalid URLs', () => {
    const r = parseUrlLines('not-a-url')
    expect(r[0].valid).toBe(false)
  })

  it('accepts magnet', () => {
    const r = parseUrlLines('magnet:?xt=urn:btih:abc')
    expect(r[0].valid).toBe(true)
  })

  it('accepts ftp', () => {
    const r = parseUrlLines('ftp://x.com/f')
    expect(r[0].valid).toBe(true)
  })

  it('trims whitespace', () => {
    const r = parseUrlLines('  https://a.com/f  ')
    expect(r[0].url).toBe('https://a.com/f')
    expect(r[0].valid).toBe(true)
  })
})

describe('multilineUrlInterpreter.tryInterpret', () => {
  it('returns null for empty text', () => {
    expect(multilineUrlInterpreter.tryInterpret('')).toBeNull()
  })

  it('returns urls for valid multi-line input', () => {
    const r = multilineUrlInterpreter.tryInterpret('https://a\nhttps://b')
    expect(r).toEqual({ urls: ['https://a', 'https://b'] })
  })

  it('returns null when no valid URL is present', () => {
    expect(multilineUrlInterpreter.tryInterpret('garbage')).toBeNull()
  })
})

describe('named URL lines', () => {
  it('pairs each name with its URL and infers the path extension', () => {
    expect(
      parseUrlLines(
        'xxx01,https://example.com/a.mp4\r\n第02集,https://example.com/b.mp4?token=a,b'
      )
    ).toEqual([
      {
        line: 0,
        url: 'https://example.com/a.mp4',
        filename: 'xxx01.mp4',
        valid: true,
      },
      {
        line: 1,
        url: 'https://example.com/b.mp4?token=a,b',
        filename: '第02集.mp4',
        valid: true,
      },
    ])
  })
  it('preserves explicit extensions, plain URL commas and extensionless names', () => {
    const result = parseUrlLines(
      'custom.mkv,https://example.com/a.mp4\nhttps://example.com/a,b.mp4\nclip,https://example.com/download?id=1'
    )
    expect(result.map((line) => line.filename)).toEqual([
      'custom.mkv',
      undefined,
      'clip',
    ])
    expect(result[1].url).toBe('https://example.com/a,b.mp4')
    expect(result.every((line) => line.valid)).toBe(true)
  })
  it.each([
    '',
    '../escape',
    'bad/name',
    'CON',
    'LPT1.mp4',
    'bad:name',
    'bad*name',
    'bad.',
    'bad\u0000name',
  ])('rejects unsafe or empty filename %j', (name) => {
    expect(parseUrlLines(`${name},https://example.com/a.mp4`)[0].valid).toBe(
      false
    )
  })
  it('rejects malformed and named magnet sources', () => {
    expect(
      parseUrlLines('name,not-a-url\nname,magnet:?xt=urn:btih:abc').every(
        (line) => !line.valid
      )
    ).toBe(true)
  })
  it('does not decode or modify signed URLs while inferring extensions', () => {
    expect(
      parseUrlLines('clip,https://example.com/a%2Emp4?signature=x%2By#part')[0]
    ).toMatchObject({
      filename: 'clip.mp4',
      url: 'https://example.com/a%2Emp4?signature=x%2By#part',
      valid: true,
    })
  })
})
