// @vitest-environment node
import { execFile } from 'node:child_process'
import path from 'node:path'
import { promisify } from 'node:util'
import { expect, it } from 'vitest'

const execFileAsync = promisify(execFile)

it('runs the smoke command and capability response against the real worker protocol', async () => {
  const { stdout } = await execFileAsync(
    process.execPath,
    [
      path.resolve('scripts/electron-package-runtime-helper.cjs'),
      'quickjs',
      path.resolve('dist-test/quick-js-worker.cjs'),
    ],
    { timeout: 20_000 }
  )
  expect(JSON.parse(stdout)).toEqual({
    capability: 'crypto.hash',
    digestBytes: 32,
    digestHex:
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
  })
}, 25_000)
