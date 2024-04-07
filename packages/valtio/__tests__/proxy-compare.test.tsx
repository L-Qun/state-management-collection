import { createProxy, isChanged } from '../src'

const noop = (_arg: unknown) => {
  // 什么都不做，用来规避ts检测
}

describe('proxy-compare单元测试', () => {
  it('没有访问对象', () => {
    const s1 = { a: 'a', b: 'b' }
    const a1 = new WeakMap()
    const p1 = createProxy(s1, a1)
    noop(p1)
    expect(isChanged(s1, { a: 'a', b: 'b' }, a1)).toBe(true)
    expect(isChanged(s1, { a: 'a2', b: 'b' }, a1)).toBe(true)
    expect(isChanged(s1, { a: 'a', b: 'b2' }, a1)).toBe(true)
  })

  it('访问对象属性', () => {
    const s1 = { a: 'a', b: 'b' }
    const a1 = new WeakMap()
    const p1 = createProxy(s1, a1)
    noop(p1.a)
    expect(isChanged(s1, { a: 'a', b: 'b' }, a1)).toBe(false)
    expect(isChanged(s1, { a: 'a2', b: 'b' }, a1)).toBe(true)
    expect(isChanged(s1, { a: 'a', b: 'b2' }, a1)).toBe(false)
  })

  it(`拦截 in 操作`, () => {
    const s1 = { a: 'a', b: 'b' }
    const a1 = new WeakMap()
    const p1 = createProxy(s1, a1)
    noop('a' in p1)
    expect(isChanged(s1, { a: 'a', b: 'b' }, a1)).toBe(false)
    expect(isChanged(s1, { a: 'a', b: 'b2' }, a1)).toBe(false)
    expect(isChanged(s1, { b: 'b' }, a1)).toBe(true)
  })

  it(`拦截 Object.keys() 操作`, () => {
    const s1 = { a: 'a', b: 'b' }
    const a1 = new WeakMap()
    const p1 = createProxy(s1, a1)
    noop(Object.keys(p1))
    expect(isChanged(s1, { a: 'a', b: 'b' }, a1)).toBe(false)
    expect(isChanged(s1, { a: 'a' }, a1)).toBe(true)
    expect(isChanged(s1, { a: 'a', b: 'b2' }, a1)).toBe(false)
  })

  it('访问深层对象属性', () => {
    const s1 = { a: { b: 'b', c: 'c' } }
    const a1 = new WeakMap()
    const p1 = createProxy(s1, a1)
    noop(p1.a.b)
    expect(isChanged(s1, { a: s1.a }, a1)).toBe(false)
    expect(isChanged(s1, { a: { b: 'b2', c: 'c' } }, a1)).toBe(true)
    expect(isChanged(s1, { a: { b: 'b', c: 'c2' } }, a1)).toBe(false)
  })
})
