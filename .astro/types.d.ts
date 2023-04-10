declare module 'astro:content' {
	interface Render {
		'.mdx': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	interface Render {
		'.md': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	export { z } from 'astro/zod';
	export type CollectionEntry<C extends keyof typeof entryMap> =
		(typeof entryMap)[C][keyof (typeof entryMap)[C]];

	// This needs to be in sync with ImageMetadata
	export const image: () => import('astro/zod').ZodObject<{
		src: import('astro/zod').ZodString;
		width: import('astro/zod').ZodNumber;
		height: import('astro/zod').ZodNumber;
		format: import('astro/zod').ZodUnion<
			[
				import('astro/zod').ZodLiteral<'png'>,
				import('astro/zod').ZodLiteral<'jpg'>,
				import('astro/zod').ZodLiteral<'jpeg'>,
				import('astro/zod').ZodLiteral<'tiff'>,
				import('astro/zod').ZodLiteral<'webp'>,
				import('astro/zod').ZodLiteral<'gif'>,
				import('astro/zod').ZodLiteral<'svg'>
			]
		>;
	}>;

	type BaseSchemaWithoutEffects =
		| import('astro/zod').AnyZodObject
		| import('astro/zod').ZodUnion<import('astro/zod').AnyZodObject[]>
		| import('astro/zod').ZodDiscriminatedUnion<string, import('astro/zod').AnyZodObject[]>
		| import('astro/zod').ZodIntersection<
				import('astro/zod').AnyZodObject,
				import('astro/zod').AnyZodObject
		  >;

	type BaseSchema =
		| BaseSchemaWithoutEffects
		| import('astro/zod').ZodEffects<BaseSchemaWithoutEffects>;

	type BaseCollectionConfig<S extends BaseSchema> = {
		schema?: S;
		slug?: (entry: {
			id: CollectionEntry<keyof typeof entryMap>['id'];
			defaultSlug: string;
			collection: string;
			body: string;
			data: import('astro/zod').infer<S>;
		}) => string | Promise<string>;
	};
	export function defineCollection<S extends BaseSchema>(
		input: BaseCollectionConfig<S>
	): BaseCollectionConfig<S>;

	type EntryMapKeys = keyof typeof entryMap;
	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidEntrySlug<C extends EntryMapKeys> = AllValuesOf<(typeof entryMap)[C]>['slug'];

	export function getEntryBySlug<
		C extends keyof typeof entryMap,
		E extends ValidEntrySlug<C> | (string & {})
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E
	): E extends ValidEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getCollection<C extends keyof typeof entryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E
	): Promise<E[]>;
	export function getCollection<C extends keyof typeof entryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown
	): Promise<CollectionEntry<C>[]>;

	type InferEntrySchema<C extends keyof typeof entryMap> = import('astro/zod').infer<
		Required<ContentConfig['collections'][C]>['schema']
	>;

	const entryMap: {
		"articles": {
"2018-my-year-in-review/index.mdx": {
  id: "2018-my-year-in-review/index.mdx",
  slug: "2018-my-year-in-review",
  body: string,
  collection: "articles",
  data: any
} & { render(): Render[".mdx"] },
"diy-audio-recording-booth/index.mdx": {
  id: "diy-audio-recording-booth/index.mdx",
  slug: "diy-audio-recording-booth",
  body: string,
  collection: "articles",
  data: any
} & { render(): Render[".mdx"] },
"full-rewrite-in-10-days-with-tachyons/index.mdx": {
  id: "full-rewrite-in-10-days-with-tachyons/index.mdx",
  slug: "full-rewrite-in-10-days-with-tachyons",
  body: string,
  collection: "articles",
  data: any
} & { render(): Render[".mdx"] },
"my-very-first-screencast/index.mdx": {
  id: "my-very-first-screencast/index.mdx",
  slug: "my-very-first-screencast",
  body: string,
  collection: "articles",
  data: any
} & { render(): Render[".mdx"] },
"react-app-zero-config/index.mdx": {
  id: "react-app-zero-config/index.mdx",
  slug: "react-app-zero-config",
  body: string,
  collection: "articles",
  data: any
} & { render(): Render[".mdx"] },
},
"screencasts": {
"container-queries-in-tailwind/index.mdx": {
  id: "container-queries-in-tailwind/index.mdx",
  slug: "container-queries-in-tailwind",
  body: string,
  collection: "screencasts",
  data: any
} & { render(): Render[".mdx"] },
"headless-ecommerce-tailwind-shopify-next/index.mdx": {
  id: "headless-ecommerce-tailwind-shopify-next/index.mdx",
  slug: "headless-ecommerce-tailwind-shopify-next",
  body: string,
  collection: "screencasts",
  data: any
} & { render(): Render[".mdx"] },
"jade-pug-course/index.mdx": {
  id: "jade-pug-course/index.mdx",
  slug: "jade-pug-course",
  body: string,
  collection: "screencasts",
  data: any
} & { render(): Render[".mdx"] },
"live-stream-with-kent-c-dodds/index.mdx": {
  id: "live-stream-with-kent-c-dodds/index.mdx",
  slug: "live-stream-with-kent-c-dodds",
  body: string,
  collection: "screencasts",
  data: any
} & { render(): Render[".mdx"] },
"rebuilding-instagram-stories-with-tailwind/index.mdx": {
  id: "rebuilding-instagram-stories-with-tailwind/index.mdx",
  slug: "rebuilding-instagram-stories-with-tailwind",
  body: string,
  collection: "screencasts",
  data: any
} & { render(): Render[".mdx"] },
"rebuilding-ios-15-with-tailwind/index.mdx": {
  id: "rebuilding-ios-15-with-tailwind/index.mdx",
  slug: "rebuilding-ios-15-with-tailwind",
  body: string,
  collection: "screencasts",
  data: any
} & { render(): Render[".mdx"] },
"translating-design-system-tailwind/index.mdx": {
  id: "translating-design-system-tailwind/index.mdx",
  slug: "translating-design-system-tailwind",
  body: string,
  collection: "screencasts",
  data: any
} & { render(): Render[".mdx"] },
"wes-bos-sick-fits-with-tailwind/index.mdx": {
  id: "wes-bos-sick-fits-with-tailwind/index.mdx",
  slug: "wes-bos-sick-fits-with-tailwind",
  body: string,
  collection: "screencasts",
  data: any
} & { render(): Render[".mdx"] },
},
"talks": {
"dot-all-2018/index.mdx": {
  id: "dot-all-2018/index.mdx",
  slug: "dot-all-2018",
  body: string,
  collection: "talks",
  data: any
} & { render(): Render[".mdx"] },
"react-music-at-react-sydney/index.mdx": {
  id: "react-music-at-react-sydney/index.mdx",
  slug: "react-music-at-react-sydney",
  body: string,
  collection: "talks",
  data: any
} & { render(): Render[".mdx"] },
"sydcss-utility-first/index.mdx": {
  id: "sydcss-utility-first/index.mdx",
  slug: "sydcss-utility-first",
  body: string,
  collection: "talks",
  data: any
} & { render(): Render[".mdx"] },
},

	};

	type ContentConfig = never;
}
