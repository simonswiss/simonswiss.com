import PageHeader from '~/components/page-header'
import Footer from '~/components/footer'

export default function PageLayout({ gradientStart, gradientEnd, title, children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        <PageHeader title={title} gradientStart={gradientStart} gradientEnd={gradientEnd} />
        <main className="px-4 sm:px-8 lg:px-0 lg:py-12">{children}</main>
      </div>
      <Footer gradientStart={gradientStart} gradientEnd={gradientEnd} />
    </div>
  )
}
