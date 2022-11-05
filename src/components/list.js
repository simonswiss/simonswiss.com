import tinytime from 'tinytime'
import Link from 'next/link'

const postDateTemplate = tinytime('{MMMM} {DD}, {YYYY}')

export default function List({ items }) {
  return (
    <ul className="divide-y divide-gray-200">
      {items.map(({ link, module: { default: Component, meta } }) => {
        return (
          <li key={link} className="py-12">
            <article className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
              <dl>
                <dt className="sr-only">Published on</dt>
                <dd className="font-party text-base font-medium leading-6 text-gray-500">
                  <time dateTime={meta.date}>{postDateTemplate.render(new Date(meta.date))}</time>
                </dd>
              </dl>
              <div className="space-y-5 xl:col-span-3">
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold leading-8 tracking-tight md:text-3xl">
                    <Link href={link}>
                      <a className="font-party text-gray-900">{meta.title}</a>
                    </Link>
                  </h2>
                  <div className="prose max-w-none text-gray-500 lg:prose-lg xl:prose-xl">
                    <Component />
                  </div>
                </div>
                <div className="text-base font-medium leading-6">
                  <Link href={link}>
                    <a
                      className="font-party text-teal-500 hover:text-teal-600"
                      aria-label={`Read "${meta.title}"`}
                    >
                      Read more &rarr;
                    </a>
                  </Link>
                </div>
              </div>
            </article>
          </li>
        )
      })}
    </ul>
  )
}
