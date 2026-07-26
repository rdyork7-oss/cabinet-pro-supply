export type KitchenCard = {
	name: string;
	eyebrow: string;
	eyebrowTone?: 'promo' | 'muted';
	price: string;
	priceNote?: string;
	image: string;
	alt: string;
	features: string[];
	span?: boolean;
};

export const kitchens: KitchenCard[] = [
	{
		name: 'CabFabs Shaker Paint',
		eyebrow: 'In Stock • RTA or Assembled*',
		price: '$2,539',
		image: '/images/Home-Display-kitchens/stock-white-shaker.webp',
		alt: 'CabFabs shaker paint kitchen',
		features: ['Framed or Frameless', 'Soft Close • Full Extension', 'All Plywood Construction'],
	},
	{
		name: 'Kith Shaker Paint',
		eyebrow: 'Semi-Custom',
		price: '$3,919',
		image: '/images/Home-Display-kitchens/kith-painted.jpg',
		alt: 'Kith shaker paint kitchen',
		features: ['Luxury Features on a Budget', 'UV-cured interiors', 'Framed or Frameless'],
	},
	{
		name: 'Nations Raised Panel Painted',
		eyebrow: 'Semi-Custom',
		price: '$4,557',
		image: '/images/Home-Display-kitchens/nations-raised-panel-paint.jpg',
		alt: 'Nations Cabinetry raised panel painted kitchen',
		features: ['Custom Paint Colors', 'Custom Sizing'],
	},
	{
		name: 'Lectus Shaker Paint',
		eyebrow: 'Semi-Custom',
		price: '$4,937',
		image: '/images/Home-Display-kitchens/lectus-paint.jpg',
		alt: 'Lectus shaker paint kitchen',
		features: ['Euro Style Construction', 'Thermofoil • Melamine • Acrylic', 'Paints'],
	},
	{
		name: 'Starmark FO Stain Slab',
		eyebrow: '15% off promo',
		eyebrowTone: 'promo',
		price: '$5,403',
		image: '/images/Home-Display-kitchens/starmark-stain.png',
		alt: 'Starmark full overlay stain slab kitchen',
		features: ['Modern Overlay', 'Blum Hardware', 'Custom Sizes', 'Custom Configurations'],
	},
	{
		name: 'Mouser Euro Slab Paint',
		eyebrow: 'Custom Cabinetry',
		price: '$5,986',
		image: '/images/Home-Display-kitchens/mouser-frameless-two-tone.jpg',
		alt: 'Mouser Euro slab paint kitchen',
		features: [
			'100’s of finishes',
			'Inset, Frameless or Full Overlay',
			'Distressing available',
			'Dovetail Maple Drawer Boxes',
		],
	},
	{
		name: 'Starmark Inset Paint Shaker',
		eyebrow: '20% off promo',
		eyebrowTone: 'promo',
		price: '$7,027',
		image: '/images/Home-Display-kitchens/starmark-inset-painted.jpg',
		alt: 'Starmark inset paint shaker kitchen',
		features: ['Custom Cabinetry', '100’s of finishes', '¾″ Framed Boxes'],
	},
	{
		name: 'Merit Kitchens Walnut',
		eyebrow: 'Fully Custom • Frameless',
		price: '$10,166',
		image: '/images/Home-Display-kitchens/merit-walnut.jpg',
		alt: 'Merit Kitchens walnut European style kitchen',
		features: ['Custom European Style', 'Frameless Design', 'Walnut, Quartersawn Oak'],
	},
	{
		name: 'Custom Range Hoods',
		eyebrow: 'Match to your kitchen order',
		price: 'Call',
		priceNote: 'for quote',
		image: '/images/Home-Display-kitchens/custom-range-hoods.jpg',
		alt: 'Custom range hoods',
		features: ['Hundreds of options', 'Can be matched to kitchen order'],
		span: true,
	},
];

export const brands = [
	{
		name: 'Merit Kitchens',
		logo: '/images/brands/Merit.png',
		alt: 'Merit Kitchens logo',
		blurb: 'Exceptional value with extensive finish and door options.',
		url: 'https://www.merit-kitchens.com/',
		logoClass: 'max-h-14',
	},
	{
		name: 'Lectus',
		logo: '/images/brands/Lectus.png',
		alt: 'Lectus Cabinets logo',
		blurb: 'Premium cabinetry with refined details and durable construction.',
		url: 'https://lectuscabinets.com/',
		logoClass: 'max-h-14',
	},
	{
		name: 'Starmark',
		logo: '/images/brands/Starmark.png',
		alt: 'StarMark Cabinetry logo',
		blurb: 'Inset, overlay, and specialty finishes for custom kitchens.',
		url: 'https://starmarkcabinetry.com/',
		logoClass: 'max-h-12',
	},
	{
		name: 'Kith Kitchens',
		logo: '/images/brands/Kith.png',
		alt: 'Kith Kitchens logo',
		blurb: 'Versatile styles from traditional to contemporary frameless designs.',
		url: 'https://kithkitchens.com/',
		logoClass: 'max-h-10',
	},
	{
		name: 'Nations Cabinetry',
		logo: '/images/brands/Nations.png',
		alt: 'Nations Cabinetry logo',
		blurb: 'Quality American craftsmanship with broad style selections.',
		url: 'https://nationscabinetry.com/',
		logoClass: 'max-h-16',
	},
	{
		name: 'Mouser Cabinetry',
		logo: '/images/brands/Mouser.png',
		alt: 'Mouser Cabinetry logo',
		blurb: 'Distinctive wood species, stains, and custom options.',
		url: 'https://www.mousercabinetry.com/',
		logoClass: 'max-h-14',
	},
];
