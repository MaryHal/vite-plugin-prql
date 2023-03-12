import { Plugin } from 'vite'

import prqljs from 'prql-js'

import * as pl from 'parse-literals'
import MagicString from 'magic-string'
import { dataToEsm } from '@rollup/pluginutils'

export function prql(s: TemplateStringsArray, ...rest: string[]): string {
  return s.map((str, i) => str + (rest[i] ?? '')).join('')
}

function toModuleCode(
  s: string,
  compileOptions?: prqljs.CompileOptions
): string {
  const sql = prqljs.compile(s, compileOptions)
  return dataToEsm(sql, { preferConst: true })
}

function toString(
  prql: string,
  compileOptions?: prqljs.CompileOptions
): string {
  return prqljs.compile(prql, compileOptions) || ''
}

const fileRegex = /\.(prql)$/

export type PrqlPluginConfig = {
  compileOptions?: prqljs.CompileOptions
}

export default function prqlPlugin(config: PrqlPluginConfig = {}): Plugin {
  return {
    name: 'vite-plugin-prql',
    enforce: 'pre',
    transform(src: string, id: string) {
      if (fileRegex.test(id)) {
        return {
          code: toModuleCode(src, config.compileOptions),
          map: null,
        }
      }

      const templates = pl.parseLiterals(src)
      const prqlTemplates = templates.filter((t) => t.tag === 'prql')

      if (prqlTemplates.length > 0) {
        const ms = new MagicString(src)

        for (const template of prqlTemplates) {
          const start = template.parts[0]?.start
          const end = template.parts[template.parts.length - 1]?.end
          if (start != null && end != null && start < end) {
            const prqlString = ms.slice(start, end)

            const templateSubstitution = (s: string): string => `__v${s}`
            const substitutions: string[] = []
            const stubbedPrqlString = prqlString.replace(
              /\$\{.*?\}/g,
              (match) => {
                let substitutionIndex = substitutions.indexOf(match)
                if (substitutionIndex == -1) {
                  substitutions.push(match)
                  substitutionIndex = substitutions.length - 1
                }

                return templateSubstitution(substitutionIndex.toString())
              }
            )

            let sqlString = toString(stubbedPrqlString, config.compileOptions)

            for (const [index, sub] of substitutions.entries()) {
              sqlString = sqlString.replace(
                templateSubstitution(index.toString()),
                sub
              )
            }

            ms.overwrite(start, end, sqlString)
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
