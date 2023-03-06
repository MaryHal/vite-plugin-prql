import { describe, it, expect } from 'vitest'

import prqlPlugin, { prql } from './index'

import query from './testData/sample.prql'

describe('import', () => {
  it('should be able to get compiled SQL from imported prql files', () => {
    expect(query).toContain('Generated by PRQL compiler')
  })
})

describe('template literal', () => {
  it('should transform prql templates', () => {
    const transformed = prql`from table`
    expect(transformed).toContain('SELECT')
  })
})

describe('prqlPlugin', () => {
  it('should be named', () => {
    const plugin = prqlPlugin()
    expect(plugin.name).toEqual('vite-plugin-prql')
  })

  it('should not apply to non-prql files', () => {
    const plugin = prqlPlugin()
    const result = plugin.transform('some-source-code', 'some-file.xml')

    expect(result).toBeNull()
  })

  it('should apply to prql files', () => {
    const plugin = prqlPlugin()
    const result = plugin.transform('from table', 'some-file.prql')

    expect(result).not.toBeNull()
    expect(result.code).toContain('SELECT')
  })
})
