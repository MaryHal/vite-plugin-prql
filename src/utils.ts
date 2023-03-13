export function prql(s: TemplateStringsArray, ...rest: string[]): string {
  return s.map((str, i) => str + (rest[i] ?? '')).join('')
}
