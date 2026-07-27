import {
	getStarmarkDoors,
	getStarmarkPreviewDoors,
	getStarmarkPreviewFinishes,
} from './starmark-catalog';

/** Preview samples for the StarMark brand overview page */
export const starmarkFinishes = getStarmarkPreviewFinishes(12).map((f) => ({
	src: f.src,
	name: f.name,
}));

export const starmarkDoors = getStarmarkPreviewDoors(10).map((d) => ({
	src: d.src,
	name: d.name,
	category: d.construction === 'inset' ? 'Inset' : 'Overlay',
}));

export const starmarkDoorCounts = {
	inset: getStarmarkDoors('inset').length,
	overlay: getStarmarkDoors('overlay').length,
};
