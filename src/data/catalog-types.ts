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

export type BrandCatalog = {
	generatedAt: string;
	brand: string;
	displayName: string;
	doorsMode: 'flat' | 'inset-overlay';
	doors: {
		all?: CatalogItem[];
		inset?: CatalogItem[];
		overlay?: CatalogItem[];
	};
	finishes: {
		groups: FinishGroup[];
	};
	notes?: Record<string, unknown>;
};
