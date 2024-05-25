import Link from 'next/link'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <h2>
          <Link href="/client">Client</Link>
        </h2>
        <h2>
          <Link href="/server">Server</Link>
        </h2>
        {children}
      </body>
    </html>
  )
}
