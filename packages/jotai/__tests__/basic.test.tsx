import { render, fireEvent } from '@testing-library/react'
import { atom, useSetAtom, useAtomValue } from '../src'

it('basic', async () => {
  const firstNameAtom = atom('')
  const lastNameAtom = atom('')
  const fullNameAtom = atom((get) => {
    return `${get(firstNameAtom)} ${get(lastNameAtom)}`
  })

  const Controller = () => {
    const setFirstName = useSetAtom(firstNameAtom)
    const setLastName = useSetAtom(lastNameAtom)
    return (
      <>
        <button
          onClick={() => {
            setFirstName('Michael')
          }}
        >
          set first name
        </button>
        <button
          onClick={() => {
            setLastName('Jordan')
          }}
        >
          set last name
        </button>
      </>
    )
  }

  const App = () => {
    const fullName = useAtomValue(fullNameAtom)
    return (
      <>
        <div data-testid="fullname">fullName: {fullName}</div>
        <Controller />
      </>
    )
  }
  const { findByText, getByText } = render(<App />)
  fireEvent.click(getByText('set first name'))
  await findByText('fullName: Michael')
  fireEvent.click(getByText('set last name'))
  await findByText('fullName: Michael Jordan')
})
