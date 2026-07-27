import catalog from './starmark-catalog.json';

export type CatalogItem = {
	src: string;
	name: string;
	slug: string;
	construction?: string;
	species?: string;
	group?: string;
	sourceFile?: string;
};

export type FinishGroup = {
	slug: string;
	name: string;
	description: string;
	count: number;
	items: CatalogItem[];
};

export const starmarkCatalog = catalog;

export function getStarmarkDoors(construction: 'inset' | 'overlay'): CatalogItem[] {
	return catalog.doors[construction] as CatalogItem[];
}

export function getStarmarkFinishGroups(): FinishGroup[] {
	return catalog.finishes.groups as FinishGroup[];
}

export function getStarmarkFinishGroup(slug: string): FinishGroup | undefined {
	return getStarmarkFinishGroups().find((g) => g.slug === slug);
}

export function getStarmarkPreviewDoors(limit = 8): CatalogItem[] {
	const overlay = getStarmarkDoors('overlay');
	const inset = getStarmarkDoors('inset');
	return [...overlay.slice(0, Math.max(4, limit - 2)), ...inset.slice(0, 2)].slice(0, limit);
}

export function getStarmarkPreviewFinishes(limit = 8): CatalogItem[] {
	const groups = getStarmarkFinishGroups();
	const paint = groups.find((g) => g.slug === 'paint')?.items ?? [];
	const maple = groups.find((g) => g.slug === 'maple')?.items ?? [];
	return [...paint.slice(0, 4), ...maple.slice(0, 4)].slice(0, limit);
}
