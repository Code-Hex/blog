declare module 'astro:content' {
	export { z } from 'astro/zod';
	export type CollectionEntry<C extends keyof typeof entryMap> =
		(typeof entryMap)[C][keyof (typeof entryMap)[C]] & Render;

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

	type Render = {
		render(): Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	};

	const entryMap: {
		"blog": {
"cloudflare_workers_global.md": {
  id: "cloudflare_workers_global.md",
  slug: "cloudflare_workers_global",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"git_alias.md": {
  id: "git_alias.md",
  slug: "git_alias",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"google_spf_dkim_dmarc.md": {
  id: "google_spf_dkim_dmarc.md",
  slug: "google_spf_dkim_dmarc",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"oneline_sqlite.md": {
  id: "oneline_sqlite.md",
  slug: "oneline_sqlite",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"raci_matrix.md": {
  id: "raci_matrix.md",
  slug: "raci_matrix",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"slack2discord.md": {
  id: "slack2discord.md",
  slug: "slack2discord",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
"y_combinator_in_go_generics.md": {
  id: "y_combinator_in_go_generics.md",
  slug: "y_combinator_in_go_generics",
  body: string,
  collection: "blog",
  data: InferEntrySchema<"blog">
},
},

	};

	type ContentConfig = typeof import("../src/content/config");
}
