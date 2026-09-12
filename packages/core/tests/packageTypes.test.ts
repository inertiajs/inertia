import { cpSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import ts from 'typescript'
import { expect, it } from 'vitest'
import packageJson from '../package.json'

it.each([false, true])('checks the published API with Axios installed: %s', (withAxios) => {
  const directory = mkdtempSync(join(tmpdir(), 'inertia-types-'))
  const packageDirectory = resolve(import.meta.dirname, '..')
  const installedPackage = join(directory, 'node_modules/@inertiajs/core')

  try {
    mkdirSync(installedPackage, { recursive: true })
    cpSync(join(packageDirectory, 'types'), join(installedPackage, 'types'), { recursive: true })
    cpSync(join(packageDirectory, 'package.json'), join(installedPackage, 'package.json'))

    for (const dependency of [
      ...Object.keys(packageJson.dependencies),
      '@types/node',
      ...(withAxios ? ['axios'] : []),
    ]) {
      const destination = join(directory, 'node_modules', dependency)
      mkdirSync(resolve(destination, '..'), { recursive: true })
      symlinkSync(join(packageDirectory, 'node_modules', dependency), destination, 'junction')
    }

    const entry = join(directory, 'index.ts')
    writeFileSync(
      entry,
      withAxios
        ? `import axios from 'axios';
           import { axiosAdapter, http } from '@inertiajs/core';
           http.setClient(axiosAdapter(axios.create()));`
        : `import { http, xhrHttpClient } from '@inertiajs/core';
           http.setClient(xhrHttpClient);`,
    )

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

    expect(
      ts
        .getPreEmitDiagnostics(program)
        .map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')),
    ).toEqual([])
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
