import type { Plugin } from 'vite'

import { compile } from 'prql-js'

import * as pl from 'parse-literals'
import MagicString from 'magic-string'

declare module '*.prql' {
  const value: any
  export default value
}

export function prql(s: TemplateStringsArray): string {
  return s.toString()
}

function toModuleCode(s: string): string {
  const compiled = compile(s)
  return `const query = \`${compiled}\`; export default query;`
}

function toString(prql: string): string {
  return compile(prql) || ''
}

const fileRegex = /\.(prql)$/

export default function prqlPlugin(): Plugin {
  return {
    name: 'vite-plugin-prql',
    enforce: 'pre',
    transform(src: string, id: string) {
      if (fileRegex.test(id)) {
        return {
          code: toModuleCode(src),
          map: null,
        }
      }

      const templates = pl.parseLiterals(src)
      const prqlTemplates = templates.filter((t) => t.tag === 'prql')

      if (prqlTemplates.length > 0) {
        const ms = new MagicString(src)
        for (const template of prqlTemplates) {
          for (const part of template.parts) {
            if (part.start < part.end) {
              ms.overwrite(part.start, part.end, toString(part.text))
            }
          }
        }

        return {
          code: ms.toString(),
          map: null,
        }
      }

      return null
    },
  }
}
