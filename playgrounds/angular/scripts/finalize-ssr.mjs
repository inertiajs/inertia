import { cp, mkdir, rename, rm } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const source = resolve(root, 'bootstrap/angular-ssr/server')
const target = resolve(root, 'bootstrap/ssr')

await rm(target, { recursive: true, force: true })
await mkdir(target, { recursive: true })
await cp(source, target, { recursive: true })
await rename(resolve(target, 'server.mjs'), resolve(target, 'ssr.js'))
