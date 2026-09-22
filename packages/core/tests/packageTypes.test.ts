import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { escapeRegExp } from 'es-toolkit'
import ts from 'typescript'
import { beforeAll, describe, expect, it } from 'vitest'
import packageJson from '../package.json'

const packageDirectory = resolve(import.meta.dirname, '..')
const typesDirectory = join(packageDirectory, 'types')

const optionalPeerDependencies = Object.entries(packageJson.peerDependenciesMeta)
  .filter(([, meta]) => meta.optional)
  .map(([name]) => name)

function referencesOptionalPeerDependency(contents: string): boolean {
  return optionalPeerDependencies.some((dependency) => new RegExp(`['"]${escapeRegExp(dependency)}['"]`).test(contents))
}

describe('published types', () => {
  beforeAll(() => {
    expect(existsSync(typesDirectory), 'Declarations are missing, run `pnpm build` first').toBe(true)
  })

  it('leaves optional peer dependencies out of the declarations', () => {
    const declarations = readdirSync(typesDirectory, { recursive: true })
      .map(String)
      .filter((file) => file.endsWith('.d.ts'))

    const offenders = declarations.filter((file) =>
      referencesOptionalPeerDependency(readFileSync(join(typesDirectory, file), 'utf8')),
    )

    expect(offenders).toEqual([])
  })

  it('accepts an Axios instance for the adapter', () => {
    const directory = mkdtempSync(join(tmpdir(), 'inertia-types-'))
    const installedPackage = join(directory, 'node_modules/@inertiajs/core')

    try {
      mkdirSync(installedPackage, { recursive: true })
      cpSync(typesDirectory, join(installedPackage, 'types'), { recursive: true })
      cpSync(join(packageDirectory, 'package.json'), join(installedPackage, 'package.json'))

      for (const dependency of [...Object.keys(packageJson.dependencies), '@types/node', 'axios']) {
        const destination = join(directory, 'node_modules', dependency)

        mkdirSync(resolve(destination, '..'), { recursive: true })
        symlinkSync(join(packageDirectory, 'node_modules', dependency), destination, 'junction')
      }

      const entry = join(directory, 'index.ts')

      writeFileSync(
        entry,
        `import axios from 'axios'
         import { axiosAdapter, http } from '@inertiajs/core'

         http.setClient(axiosAdapter(axios.create()))`,
      )

      // Without skipLibCheck the consumer also type-checks our declarations, which is
      // where the adapter's hand-written Axios types would drift from the real ones.
      const program = ts.createProgram([entry], {
        noEmit: true,
        strict: true,
        skipLibCheck: false,
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        types: ['node'],
        typeRoots: [join(directory, 'node_modules/@types')],
      })

      const diagnostics = ts
        .getPreEmitDiagnostics(program)
        .map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))

      expect(diagnostics).toEqual([])
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })
})
