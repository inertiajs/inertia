import { cp, mkdir, rename, rm } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const source = resolve(root, 'dist-ssr/server')
const target = resolve(root, 'dist')

await mkdir(target, { recursive: true })
await cp(source, target, { recursive: true })
await rm(resolve(target, 'ssr.js'), { force: true })
await rename(resolve(target, 'server.mjs'), resolve(target, 'ssr.js'))
