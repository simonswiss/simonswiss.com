import Header from './logo'
import Navigation from './navigation'

export default function PageHeader({ gradientStart, gradientEnd, title }) {
  return (
    <div
      className={`bg-gradient-to-br px-4 pb-4 ${gradientStart} ${gradientEnd} sm:px-8 sm:pb-6 md:pb-10 lg:px-0`}
    >
      <div className="mx-auto max-w-4xl space-y-2">
        <div className="flex items-center space-x-10">
          <Header />
          <Navigation />
        </div>
        <h1 className="md:leading-14 font-party text-3xl font-extrabold leading-9 tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl">
          {title}
        </h1>
      </div>
    </div>
  )
}
