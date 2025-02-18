import 'tailwindcss/tailwind.css';

export const metadata = {
  title: 'Loan Calculator',
  description: 'A simple loan calculator',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="no-touch" data-lt-installed="true">
      <body>{children}</body>
    </html>
  )
}
