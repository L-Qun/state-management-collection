import { hashKey } from '../src/queryCache'

describe('测试 `hashKey 是否生成稳定的结果', () => {
  it('测试用例1', () => {
    const obj1 = ['key1', 'key2', 'key3']
    const obj2 = ['key1', 'key2', 'key3']
    expect(hashKey(obj1) === hashKey(obj2)).toBe(true)
  })

  it('测试用例2', () => {
    const obj1 = ['key2', 'key1']
    const obj2 = ['key1', 'key2']
    expect(hashKey(obj1) === hashKey(obj2)).toBe(false)
  })

  it('测试用例3', () => {
    const obj1 = ['key1', 'key2']
    const obj2 = ['key1', 'key2', 'key3']
    expect(hashKey(obj1) === hashKey(obj2)).toBe(false)
  })

  it('测试用例4', () => {
    const obj1 = ['key1', 'key2', { key1: 'val1', key2: 'val2' }]
    const obj2 = ['key1', 'key2', { key2: 'val2', key1: 'val1' }]
    expect(hashKey(obj1) === hashKey(obj2)).toBe(true)
  })

  it('测试用例5', () => {
    const obj1 = ['key1', 'key2', { key1: 'val1', key2: 'val2' }]
    const obj2 = ['key1', 'key2', { key1: 'val2', key2: 'val1', key3: 'val3' }]
    expect(hashKey(obj1) === hashKey(obj2)).toBe(false)
  })
})
