import Head from 'next/head'

import { useRouter } from 'next/router'
import tinytime from 'tinytime'
import { MDXProvider } from '@mdx-js/react'

import { siteInfo } from '~/lib/data'

import PageLayout from '~/components/page-layout'

const mdxComponents = {
  pre: ({ className, ...props }) => (
    <pre className={`${className} overflow-x-auto rounded-md bg-gray-800 py-3 px-4`} {...props} />
  ),
  'pre.code': ({ className, ...props }) => (
    <code className={`${className} text-gray-200`} {...props} />
  ),
}

const postDateTemplate = tinytime('{dddd}, {MMMM} {DD}, {YYYY}')

export default function Post({ meta, children }) {
  const router = useRouter()

  const category = router.pathname.split('/')[1]

  return (
    <PageLayout title={meta.title} gradientStart="from-cyan-500" gradientEnd="to-blue-600">
      <article className="">
        <Head>
          <title>{meta.title} | simonswiss</title>
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@simonswiss" />
          <meta name="twitter:creator" content="@simonswiss" />
          <meta name="twitter:title" content={`${meta.title} | simonswiss`} />
          <meta name="twitter:description" content={meta.description || siteInfo.description} />
          <meta
            name="twitter:image"
            content={`https://simonswiss.com${meta.image ? meta.image?.src : siteInfo.image.src}`}
          />
          <meta property="og:url" content={`https://simonswiss.com${router.pathname}`} />
          <meta property="og:type" content="article" />
          <meta property="og:title" content={`${meta.title} | simonswiss`} />
          <meta property="og:description" content={meta.description || siteInfo.description} />
          <meta
            property="og:image"
            content={`https://simonswiss.com${meta.image ? meta.image?.src : siteInfo.image.src}`}
          />
          <meta name="description" content={meta.description}></meta>
        </Head>

        <div className="mx-auto max-w-3xl">
          <div className="xl:col-span-3 xl:row-span-2 xl:pb-0">
            <div className="prose prose-purple max-w-none pt-10 pb-8 lg:prose-lg xl:prose-xl">
              <dl className="space-y-10">
                <div>
                  <dt className="sr-only">Published on</dt>
                  <dd className="font-party text-base font-medium leading-6 text-gray-500">
                    <time dateTime={meta.date}>{postDateTemplate.render(new Date(meta.date))}</time>
                  </dd>
                </div>
              </dl>
              <MDXProvider components={mdxComponents}>{children}</MDXProvider>
            </div>
            <footer className="my-8">
              <hr className="ml-0 mb-4 w-16 border-2 border-t border-gray-300" />
              <p className="text-gray-700 md:text-lg lg:text-xl">
                <a
                  className="underline"
                  href={`https://mobile.twitter.com/search?q=simonswiss%20${meta.title}`}
                >
                  Discuss this {category.slice(0, -1)} on Twitter &rarr;
                </a>
              </p>
            </footer>
          </div>
        </div>
        <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>
      </article>
    </PageLayout>
  )
}
