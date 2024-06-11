import { prefetchDNS, preconnect, preload, preinit } from 'react-dom'

export default function Home() {
  // preload(
  //   'http://localhost:3000/_next/static/media/vtu73by4O2gEBcvBuLgeu.3b7789cf.woff',
  //   {
  //     as: 'font',
  //   },
  // )

  return (
    <>
      {new Array(1000).fill(0).map(() => (
        <p className="font-operator">1111</p>
      ))}
    </>
  )
}
