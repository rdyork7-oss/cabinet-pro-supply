export type BrandSample = {
	src: string;
	name: string;
	category?: string;
};

export type BrandGalleryImage = {
	src: string;
	alt: string;
};

export type Brand = {
	slug: string;
	name: string;
	logo: string;
	alt: string;
	blurb: string;
	description: string;
	url: string;
	logoClass: string;
	tier: string;
	image: string;
	imageAlt: string;
	highlights: string[];
	bestFor: string[];
	construction: string[];
	gallery: BrandGalleryImage[];
	finishes: BrandSample[];
	doors: BrandSample[];
	/** Note shown above door/finish samples when archive assets may be outdated */
	samplesNote?: string;
	/** Shown when door/finish galleries are empty — ask dealer for current options */
	optionsNote?: string;
	examplePrice?: string;
	exampleName?: string;
};

import { starmarkDoors, starmarkFinishes } from './starmark-samples';

const optionsAskNote =
	'Ask us for current door styles and finish options — manufacturer programs update regularly, and dealer-portal assets are the best source for the latest samples.';

export const brands: Brand[] = [
	{
		slug: 'merit-kitchens',
		name: 'Merit Kitchens',
		logo: '/images/brands/Merit.png',
		alt: 'Merit Kitchens logo',
		blurb:
			'Canadian made-to-order frameless cabinetry since 1971 — European full-access design built to last generations.',
		description:
			'Merit Kitchens designs and manufactures beautiful cabinetry for kitchens, baths, and throughout the home. Made-to-order in Canada since 1971, Merit balances European CNC precision with traditional craftsmanship — dowel-and-glue case construction, solid wood dovetail drawers, and German-engineered soft-close hardware — under a limited lifetime warranty. Frameless (full-access) construction gives a clean European look and easier use of roll-outs and organizers.',
		url: 'https://www.merit-kitchens.com/',
		logoClass: 'max-h-14',
		tier: 'Made-to-Order · Frameless',
		image: '/images/Home-Display-kitchens/merit-walnut.jpg',
		imageAlt: 'Merit Kitchens walnut European style kitchen',
		highlights: ['Frameless full-access design', 'Made in Canada since 1971', 'Limited lifetime warranty'],
		bestFor: [
			'Modern & transitional European kitchens',
			'Homeowners who want frameless made-to-order',
			'Projects that need tailored configurations and finishes',
		],
		construction: [
			'Frameless / European full-access cases',
			'Dowel-and-glue construction with case-clamp assembly',
			'Solid wood dovetail drawer boxes',
			'German-engineered soft-close hinges & undermount slides',
		],
		gallery: [{ src: '/images/Home-Display-kitchens/merit-walnut.jpg', alt: 'Merit Kitchens walnut kitchen' }],
		finishes: [],
		doors: [],
		optionsNote: optionsAskNote,
		examplePrice: '$10,166',
		exampleName: 'Merit Walnut 10×10 example',
	},
	{
		slug: 'lectus',
		name: 'Lectus',
		logo: '/images/brands/Lectus.png',
		alt: 'Lectus Cabinets logo',
		blurb:
			'Surprisingly affordable made-to-order cabinets from Canada — plywood cases, soft-close dovetail drawers, and wide finish choice.',
		description:
			'Lectus Cabinets is built around a simple idea: cabinets that look great, perform well, and cost less than you’d expect. Introduced in 2012 and manufactured in British Columbia, Lectus is a semi-custom line with plywood cases, full-extension soft-close birch dovetail drawers, and door programs spanning wood, painted MDF & maple, thermofoil, laminate, and acrylic. European-designed, proudly made in Canada for kitchens, baths, and other rooms throughout the home.',
		url: 'https://lectuscabinets.com/',
		logoClass: 'max-h-14',
		tier: 'Semi-Custom',
		image: '/images/Home-Display-kitchens/lectus-paint.jpg',
		imageAlt: 'Lectus shaker paint kitchen',
		highlights: ['Plywood cases', 'Soft-close dovetail drawers', 'Wood · paint · thermofoil · acrylic'],
		bestFor: [
			'Value-focused remodels that still want made-to-order',
			'Easy-care finishes (thermofoil, laminate, acrylic)',
			'Contemporary kitchens with Euro-style detailing',
		],
		construction: [
			'Plywood case construction',
			'Full-extension soft-close birch dovetail drawers',
			'Door styles in wood, painted MDF/maple, thermofoil, laminate & acrylic',
			'Made-to-order in British Columbia, Canada',
		],
		gallery: [{ src: '/images/Home-Display-kitchens/lectus-paint.jpg', alt: 'Lectus painted shaker kitchen' }],
		finishes: [],
		doors: [],
		optionsNote: optionsAskNote,
		examplePrice: '$4,937',
		exampleName: 'Lectus Shaker Paint 10×10 example',
	},
	{
		slug: 'starmark',
		name: 'StarMark',
		logo: '/images/brands/Starmark.png',
		alt: 'StarMark Cabinetry logo',
		blurb:
			'Custom cabinets from Sioux Falls — inset and overlay, wood species, door styles, and custom color programs that make a lasting statement.',
		description:
			'StarMark Cabinetry (MasterBrand) builds personalized custom cabinets in Sioux Falls, SD — combining wood types, expressive door styles, and enduring colors for kitchens, baths, and more. Overlay and precision inset programs, soft-close full-extension under-mount drawer glides, hardwood plywood construction, and custom color options (including Colour Couture, Color by Number, and Bespoke Custom Hues) support traditional, transitional, and contemporary designs.',
		url: 'https://starmarkcabinetry.com/',
		logoClass: 'max-h-12',
		tier: 'Custom',
		image: '/images/Home-Display-kitchens/starmark-inset-painted.jpg',
		imageAlt: 'StarMark inset paint shaker kitchen',
		highlights: ['Inset & full overlay', 'Custom color programs', 'Built-to-order sizing'],
		bestFor: [
			'Inset traditional and furniture-style kitchens',
			'Painted, stained, or custom-color looks',
			'Remodels that need exact sizing and configuration',
		],
		construction: [
			'Framed overlay and precision inset programs',
			'¾″ hardwood plywood side panels available',
			'Solid hardwood dovetail drawers with soft-close under-mount glides',
			'Built to order (fine incremental sizing)',
		],
		gallery: [
			{ src: '/images/Home-Display-kitchens/starmark-inset-painted.jpg', alt: 'StarMark inset painted shaker kitchen' },
			{ src: '/images/Home-Display-kitchens/starmark-stain.png', alt: 'StarMark full overlay stain slab kitchen' },
		],
		finishes: starmarkFinishes,
		doors: starmarkDoors,
		samplesNote:
			'Preview samples below — open the full inset, overlay, and finish catalogs for every style in our dealer library. Doors are shown natural/unfinished when available so profiles read clearly.',
		examplePrice: '$5,403',
		exampleName: 'StarMark FO Stain Slab 10×10 example',
	},
	{
		slug: 'kith-kitchens',
		name: 'Kith Kitchens',
		logo: '/images/brands/Kith.png',
		alt: 'Kith Kitchens logo',
		blurb:
			'USA-made built-to-order cabinetry from Haleyville, AL — framed or frameless, wide styles and finishes, lifetime warranty.',
		description:
			'Kith Kitchens began in 1998 with a focus on integrity, relationships, and built-to-order quality. From Haleyville, Alabama, Kith offers framed and full-access (frameless) construction across styles from traditional to contemporary, with catalyzed conversion finishes and UV-finished interiors. The Kith family includes Kith, Eudora (full access), and KithOne (streamlined value pricing) — competitive pricing, custom solutions, and a lifetime warranty.',
		url: 'https://kithkitchens.com/',
		logoClass: 'max-h-10',
		tier: 'Semi-Custom',
		image: '/images/Home-Display-kitchens/kith-painted.jpg',
		imageAlt: 'Kith shaker paint kitchen',
		highlights: ['Framed or frameless', 'UV-finished interiors', 'Lifetime warranty'],
		bestFor: [
			'Budget-conscious remodels that still want built-to-order',
			'Painted shaker and transitional kitchens',
			'Projects that need framed or frameless flexibility',
		],
		construction: [
			'Framed or full-access (frameless) construction',
			'Plywood construction with birch UV-finished interiors',
			'Maple full-extension soft-close drawers & soft-close hinges',
			'Catalyzed conversion varnish finishes; made in the USA',
		],
		gallery: [{ src: '/images/Home-Display-kitchens/kith-painted.jpg', alt: 'Kith painted shaker kitchen' }],
		finishes: [],
		doors: [],
		optionsNote: optionsAskNote,
		examplePrice: '$3,919',
		exampleName: 'Kith Shaker Paint 10×10 example',
	},
	{
		slug: 'nations-cabinetry',
		name: 'Nations Cabinetry',
		logo: '/images/brands/Nations.png',
		alt: 'Nations Cabinetry logo',
		blurb:
			'San Antonio–made Tidwell framed and DreamCraft frameless lines — broad door, finish, and wood-species selection.',
		description:
			'Nations Cabinetry manufactures semi-custom and custom cabinetry in San Antonio, Texas. Choose Tidwell for traditional framed styles or DreamCraft for European frameless construction — flat, solid, and raised-panel doors across maple, hickory, walnut, cherry, and paint-grade programs. Style simulators and extensive finish libraries help lock in the look; kitchens, baths, and other rooms are all in scope.',
		url: 'https://nationscabinetry.com/',
		logoClass: 'max-h-16',
		tier: 'Semi-Custom',
		image: '/images/Home-Display-kitchens/nations-raised-panel-paint.jpg',
		imageAlt: 'Nations Cabinetry raised panel painted kitchen',
		highlights: ['Tidwell framed & DreamCraft frameless', 'Broad finish & species selection', 'Made in San Antonio, TX'],
		bestFor: [
			'Classic raised-panel and transitional looks (Tidwell)',
			'Modern European frameless kitchens (DreamCraft)',
			'Semi-custom projects that need paint, stain, and sizing options',
		],
		construction: [
			'Tidwell: custom & semi-custom framed cabinetry',
			'DreamCraft: custom & semi-custom frameless (European) cabinetry',
			'Flat, solid, and raised-panel door programs',
			'Maple, hickory, walnut, cherry, and paint-grade options',
		],
		gallery: [
			{
				src: '/images/Home-Display-kitchens/nations-raised-panel-paint.jpg',
				alt: 'Nations raised panel painted kitchen',
			},
		],
		finishes: [],
		doors: [],
		optionsNote: optionsAskNote,
		examplePrice: '$4,557',
		exampleName: 'Nations Raised Panel Painted 10×10 example',
	},
	{
		slug: 'mouser-cabinetry',
		name: 'Mouser Cabinetry',
		logo: '/images/brands/Mouser.png',
		alt: 'Mouser Cabinetry logo',
		blurb:
			'Kentucky custom cabinetry since 1955 — inset to contemporary, rich woods, glazes, vintage, distressing, and more.',
		description:
			'Mouser Cabinetry has built custom cabinetry since 1955, now from Elizabethtown, Kentucky. Expect the widest selection of styles, finishes, storage solutions, and decorative enhancements — inset, traditional, country, shaker, and contemporary doors in knotty and select alder, cherry, hickory, maple, red oak, quarter-sawn oak, and walnut. Finish programs include stains, glazes, Glacier Elect, solid colors, vintage, laminate, leather options, and distressing enhancements, protected with oven-cured catalyzed sealers and topcoat. KCMA Environmental Stewardship certified.',
		url: 'https://www.mousercabinetry.com/',
		logoClass: 'max-h-14',
		tier: 'Custom',
		image: '/images/Home-Display-kitchens/mouser-frameless-two-tone.jpg',
		imageAlt: 'Mouser Euro slab paint kitchen',
		highlights: ['70+ years of custom craft', 'Extensive wood & finish programs', 'Inset through contemporary'],
		bestFor: [
			'High-end custom kitchens where details matter',
			'Unique woods, glazes, vintage, and distressing',
			'Inset or statement contemporary designs',
		],
		construction: [
			'Custom-crafted from select woods',
			'Inset, traditional, shaker & contemporary door programs',
			'Oven-cured catalyzed sealers and topcoat',
			'Broad finish, glaze, vintage & distressing options',
		],
		gallery: [
			{
				src: '/images/Home-Display-kitchens/mouser-frameless-two-tone.jpg',
				alt: 'Mouser frameless two-tone kitchen',
			},
		],
		finishes: [],
		doors: [],
		optionsNote: optionsAskNote,
		examplePrice: '$5,986',
		exampleName: 'Mouser Euro Slab Paint 10×10 example',
	},
];

export function getBrandBySlug(slug: string): Brand | undefined {
	return brands.find((b) => b.slug === slug);
}
