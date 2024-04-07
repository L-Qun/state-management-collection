import { act, fireEvent, render } from '@testing-library/react'
import { useEffect, useRef } from 'react'
import { proxy, snapshot, useSnapshot } from '../src'

describe('Valtio 核心功能测试', () => {
  it('点击按钮正确触发组件更新', async () => {
    const obj = proxy({
      count: 0,
    })
    const App = () => {
      const { count } = useSnapshot(obj)
      return (
        <>
          <div>count: {count}</div>
          <button onClick={() => obj.count++}>button</button>
        </>
      )
    }
    const { findByText, getByText } = render(<App />)
    await findByText('count: 0')
    fireEvent.click(getByText('button'))
    await findByText('count: 1')
  })

  it('没有额外的re-render', async () => {
    const obj = proxy({
      count: 0,
      text: 'mumu',
    })
    const Display = () => {
      const { text } = useSnapshot(obj)
      const commitsRef = useRef(1)
      useEffect(() => {
        commitsRef.current += 1
      })
      return (
        <>
          <div>text: {text}</div>
          <div>render count: {commitsRef.current}</div>
        </>
      )
    }
    const Control = () => {
      const { count } = useSnapshot(obj)
      return (
        <>
          <button onClick={() => (obj.count += 1)}>button</button>
          <div>count: {count}</div>
        </>
      )
    }
    const { findByText, getByText } = render(
      <>
        <Display />
        <Control />
      </>,
    )
    await findByText('text: mumu')
    fireEvent.click(getByText('button'))
    await findByText('count: 1')
    await findByText('render count: 1')
  })
})
