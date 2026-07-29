import type { BrandCatalog, CatalogItem, FinishGroup } from './catalog-types';
import merit from './catalogs/merit-kitchens.json';
import lectus from './catalogs/lectus.json';
import kith from './catalogs/kith-kitchens.json';
import nations from './catalogs/nations-cabinetry.json';
import mouser from './catalogs/mouser-cabinetry.json';

const catalogs: Record<string, BrandCatalog> = {
	'merit-kitchens': merit as BrandCatalog,
	lectus: lectus as BrandCatalog,
	'kith-kitchens': kith as BrandCatalog,
	'nations-cabinetry': nations as BrandCatalog,
	'mouser-cabinetry': mouser as BrandCatalog,
};

/** Brands with generated door/finish catalogs (excludes StarMark — separate module). */
export const catalogBrandSlugs = Object.keys(catalogs);

export function hasBrandCatalog(slug: string): boolean {
	return slug in catalogs || slug === 'starmark';
}

export function getBrandCatalog(slug: string): BrandCatalog | undefined {
	return catalogs[slug];
}

export function getCatalogDoors(slug: string): CatalogItem[] {
	const catalog = catalogs[slug];
	if (!catalog) return [];
	if (catalog.doors.all?.length) return catalog.doors.all;
	return [...(catalog.doors.overlay ?? []), ...(catalog.doors.inset ?? [])];
}

export function getCatalogFinishGroups(slug: string): FinishGroup[] {
	return catalogs[slug]?.finishes.groups ?? [];
}

export function getCatalogFinishGroup(slug: string, groupSlug: string): FinishGroup | undefined {
	return getCatalogFinishGroups(slug).find((g) => g.slug === groupSlug);
}

export function getCatalogPreviewDoors(slug: string, limit = 8): CatalogItem[] {
	return getCatalogDoors(slug).slice(0, limit);
}

export function getCatalogPreviewFinishes(slug: string, limit = 8): CatalogItem[] {
	const groups = getCatalogFinishGroups(slug);
	const paint = groups.find((g) => g.slug === 'paint')?.items ?? [];
	const firstWood =
		groups.find((g) => g.slug !== 'paint' && g.slug !== 'framed')?.items ??
		groups[0]?.items ??
		[];
	return [...paint.slice(0, Math.ceil(limit / 2)), ...firstWood.slice(0, Math.floor(limit / 2))].slice(
		0,
		limit,
	);
}

export function getCatalogDoorHref(slug: string): string {
	if (slug === 'starmark') return '/brands/starmark/doors/overlay';
	return `/brands/${slug}/doors`;
}

export function getCatalogFinishesHref(slug: string): string {
	return `/brands/${slug}/finishes`;
}
