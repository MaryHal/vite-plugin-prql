import { describe, it, expect } from 'vitest'

import prqlPlugin, { prql } from './index'
import './types'

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

  it('should transform prql templates with string interpolation', () => {
    const table = 'a'
    const transformed = prql`from ${table}`
    expect(transformed).toMatch(/FROM\s+a/)
  })

  it('should transform prql templates with many of the same string interpolation segment', () => {
    const table = 'a'
    const transformed = prql`
      from ${table}
      select [${table}.b]
    `
    expect(transformed).toMatch(/SELECT\s+b/)
  })

  it('should transform prql templates with many different string interpolation segments', () => {
    const table = 'a'
    const column1 = 'first'
    const column2 = 'second'
    const column3 = 'third'

    const transformed = prql`
      from ${table}
      select [${table}.${column1}, ${table}.${column2}, ${table}.${column3}]
    `
    expect(transformed).toMatch(/SELECT/)
    expect(transformed).toMatch(/first/)
    expect(transformed).toMatch(/second/)
    expect(transformed).toMatch(/third/)
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

  it('should transform prql templates', () => {
    const plugin = prqlPlugin()
    const result = plugin.transform('prql`from table`', 'some-id')

    expect(result).not.toBeNull()
    expect(result.code).toContain('SELECT')
  })

  // it('should transform multipart prql templates', () => {
  //   const plugin = prqlPlugin()
  //   const result = plugin.transform(
  //     'const table = "a"; prql`from ${table}` select [b]',
  //     'some-id'
  //   )

  //   expect(result).not.toBeNull()
  //   expect(result.code).toContain('SELECT')
  // })
})
