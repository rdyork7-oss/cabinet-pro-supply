/**
 * Process StarMark dealer vault images into web catalog assets + JSON.
 * Source: images/brands/Starmark/{Doors/{full-overlay,inset},Finishes}
 * Output: public/images/brands/starmark/{doors,finishes}/ + src/data/starmark-catalog.json
 *
 * Doors vault (new): one curated JPEG per style under Doors/full-overlay and Doors/inset
 * with kebab-case filenames (abilene.jpg). Falls back to legacy flat STM-FDS naming if present.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const VAULT = path.join(ROOT, 'images', 'brands', 'Starmark');
const OUT_DOORS = path.join(ROOT, 'public', 'images', 'brands', 'starmark', 'doors');
const OUT_FINISHES = path.join(ROOT, 'public', 'images', 'brands', 'starmark', 'finishes');
const OUT_JSON = path.join(ROOT, 'src', 'data', 'starmark-catalog.json');
/** Finishes: skip tiny/broken swatches (dealer PNGs are usually 100KB+). */
const MIN_FINISH_BYTES = 20 * 1024;
/** Doors: curated web JPEGs are often 10–30KB at ~425px — only skip empties/broken. */
const MIN_DOOR_BYTES = 8 * 1024;
const MIN_BYTES = MIN_FINISH_BYTES; // legacy alias used by finish parser
const MAX_EDGE = 1100;
const JPEG_QUALITY = 85;

/** Map source vault folder → public construction slug */
const DOOR_FOLDER_MAP = {
	'full-overlay': 'overlay',
	overlay: 'overlay',
	inset: 'inset',
};

const DOOR_NAMES = {
	175: 'Style 175',
	177: 'Style 177',
	179: 'Style 179',
	182: 'Style 182',
	189: 'Style 189',
	190: 'Style 190',
	191: 'Style 191',
	268: 'Style 268',
	735: 'Style 735',
	736: 'Style 736',
	737: 'Style 737',
	Abil: 'Abilene',
	Acco: 'Accord',
	Anit: 'Anita',
	Bedf: 'Bedford',
	Belf: 'Belfonte',
	Boni: 'Bonita',
	Bonita: 'Bonita',
	Brec: 'Breckenridge',
	Brpo: 'Bridgeport',
	Chpe: 'Chappell',
	Clif: 'Clifton',
	Clifto: 'Clifton',
	Coralv: 'Coralville',
	Cosm: 'Cosmopolitan',
	Covi: 'Covington',
	Cust: 'Custom',
	Edgm: 'Edgemore',
	Edin: 'Edinburgh',
	Emmr: 'Emmerich',
	Farm: 'Farmington',
	Fran: 'Franklin',
	Full: 'Fullerton',
	Fuller: 'Fullerton',
	Hamp: 'Hampton',
	Hano: 'Hanover',
	Harb: 'Harbor',
	Haso: 'Hasbrouck',
	Hunt: 'Huntingford',
	Katm: 'Katmai',
	Kobu: 'Kobuk',
	Lehi: 'Lehigh',
	Manh: 'Manhattan',
	Medi: 'Medina',
	Melb: 'Melbourne',
	Mila: 'Milan',
	Oakl: 'Oakland',
	Oria: 'Orian',
	Ospr: 'Osprey',
	Ovla: 'Overlook',
	Ozar: 'Ozark',
	Pres: 'Prescott',
	Prin: 'Princeton',
	Remi: 'Remington',
	Renw: 'Renwick',
	Renwic: 'Renwick',
	Rila: 'Ridgeville',
	Roan: 'Roanoke',
	Roanok: 'Roanoke',
	Rocw: 'Rockwell',
	Rose: 'Roseville',
	Sale: 'Salem',
	Sawy: 'Sawyer',
	Stoc: 'Stockton',
	Stra: 'Stratford',
	Syra: 'Syracuse',
	Tabo: 'Tabor',
	Taft: 'Taft',
	Tepo: 'Tempo',
	Tipt: 'Tipton',
	Tipton: 'Tipton',
	Trin: 'Trinity',
	Tucs: 'Tucson',
	Tudo: 'Tudor',
	Vail: 'Vail',
	Veni: 'Venice',
	Viol: 'Viola',
	Wafa: 'Waterfall',
	Wayn: 'Waynesville',
	Xavi: 'Xavier',
};

/** Canonicalize abbreviated / alternate keys to one slug key */
const DOOR_ALIASES = {
	Bonita: 'Boni',
	Clifto: 'Clif',
	Fuller: 'Full',
	Renwic: 'Renw',
	Roanok: 'Roan',
	Tipton: 'Tipt',
	Coralv: 'Coralv',
};

const FINISH_CODES = {
	Ntl: 'Natural',
	Cpc: 'Cappuccino',
	Hvt: 'Harvest',
	HVT: 'Harvest',
	Hzu: 'Hazelnut',
	Hzn: 'Hazelnut',
	Ogo: 'Oregano',
	Rye: 'Rye',
	Slt: 'Slate',
	Trg: 'Tarragon',
	Blk: 'Black',
	Bmk: 'Benchmark',
	CrF: 'Crystal Fog',
	Ety: 'Entity',
	Euc: 'Eucalyptus',
	MBy: 'Moon Bay',
	MGr: 'Moss Green',
	MnG: 'Mineral Gray',
	Mrc: 'Marshmallow Cream',
	Mrm: 'Mushroom',
	Par: 'Pearl',
	PbG: 'Pebble Gray',
	RpG: 'Repose Grey',
	Snb: 'Snowbound',
	Sne: 'Stone',
	SpW: 'Simply White',
	Wgs: 'Wings',
	Biscotti: 'Biscotti',
	CoF: 'Chocolate Glaze',
	EbF: 'Ebony Glaze',
	NiF: 'Nickel Glaze',
	LaF: 'Latte Glaze',
	Laf: 'Latte Glaze',
	Mat: 'Matte',
	WhS: 'White Spatter',
	Wpr: 'Whisper',
	Nov: 'Nova',
	Tst: 'Toast',
};

const SPECIES = {
	MPL: { group: 'maple', label: 'Maple' },
	CHP: { group: 'cherry', label: 'Cherry' },
	ALD: { group: 'alder', label: 'Alder' },
	RAL: { group: 'alder', label: 'Rustic Alder' },
	HKY: { group: 'hickory', label: 'Hickory' },
	RHK: { group: 'hickory', label: 'Rustic Hickory' },
	OAK: { group: 'oak', label: 'Oak' },
	RWO: { group: 'oak', label: 'Rustic Oak' },
	QWO: { group: 'specialty-woods', label: 'Quartersawn Oak' },
	QSO: { group: 'specialty-woods', label: 'Quartersawn Oak' },
	QW: { group: 'specialty-woods', label: 'Quartersawn Oak' },
	WAL: { group: 'specialty-woods', label: 'Walnut' },
	WNT: { group: 'specialty-woods', label: 'Walnut' },
	PNT: { group: 'paint', label: 'Paint' },
};

const FINISH_GROUPS = [
	{ slug: 'paint', name: 'Paint', description: 'Solid paint colors, tinted varnish, and glazed paint looks.' },
	{ slug: 'maple', name: 'Maple', description: 'Stains and specialty colors on maple.' },
	{ slug: 'cherry', name: 'Cherry', description: 'Stains and specialty colors on cherry.' },
	{ slug: 'alder', name: 'Alder', description: 'Stains on alder and rustic alder.' },
	{ slug: 'hickory', name: 'Hickory', description: 'Stains on hickory and rustic hickory.' },
	{ slug: 'oak', name: 'Oak', description: 'Stains and specialty colors on oak.' },
	{ slug: 'specialty-woods', name: 'Specialty woods', description: 'Walnut and quartersawn oak finishes.' },
	{ slug: 'specialty', name: 'Specialty colors', description: 'Named specialty colorways and leftover swatches.' },
];

function ensureDir(dir) {
	fs.mkdirSync(dir, { recursive: true });
}

function kebab(s) {
	return String(s)
		.normalize('NFKD')
		.replace(/[^\w\s-]/g, '')
		.trim()
		.replace(/[\s_]+/g, '-')
		.replace(/-+/g, '-')
		.toLowerCase();
}

function titleFromCamel(s) {
	return String(s)
		.replace(/([a-z])([A-Z])/g, '$1 $2')
		.replace(/[_-]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

function convertManyToJpeg(jobs, maxEdge = MAX_EDGE) {
	if (!jobs.length) return;
	for (const j of jobs) ensureDir(path.dirname(j.dest));

	const listPath = path.join(ROOT, 'scripts', '.starmark-convert-jobs.json');
	fs.writeFileSync(listPath, JSON.stringify(jobs));
	const ps = `
Add-Type -AssemblyName System.Drawing
$jobs = Get-Content -Raw '${listPath.replace(/'/g, "''")}' | ConvertFrom-Json
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$enc = [System.Drawing.Imaging.Encoder]::Quality
$max = ${maxEdge}
$qi = ${JPEG_QUALITY}
$i = 0
foreach ($job in $jobs) {
  $i++
  if ($i % 25 -eq 0) { Write-Host "Converted $i / $($jobs.Count)" }
  $src = [System.Drawing.Image]::FromFile($job.src)
  try {
    $w = $src.Width; $h = $src.Height
    if ($w -gt $max -or $h -gt $max) {
      if ($w -ge $h) { $nw = $max; $nh = [int]([math]::Round($h * $max / $w)) }
      else { $nh = $max; $nw = [int]([math]::Round($w * $max / $h)) }
    } else { $nw = $w; $nh = $h }
    $bmp = New-Object System.Drawing.Bitmap $nw, $nh
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.DrawImage($src, 0, 0, $nw, $nh)
    $g.Dispose()
    $eps = New-Object System.Drawing.Imaging.EncoderParameters 1
    $eps.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter $enc, $qi
    $bmp.Save($job.dest, $codec, $eps)
    $bmp.Dispose(); $eps.Dispose()
  } finally { $src.Dispose() }
}
Write-Host "Done $($jobs.Count)"
`;
	const r = spawnSync('powershell', ['-NoProfile', '-Command', ps], {
		encoding: 'utf8',
		windowsHide: true,
		maxBuffer: 20 * 1024 * 1024,
	});
	try {
		fs.unlinkSync(listPath);
	} catch {
		/* ignore */
	}
	if (r.status !== 0) {
		throw new Error(`Batch image convert failed: ${r.stderr || r.stdout}`);
	}
	console.log(r.stdout.trim());
}

function titleFromKebab(s) {
	return String(s)
		.replace(/[-_]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Curated vault: Doors/{full-overlay|inset}/{style-name}.jpg — already one image per style.
 */
function parseCuratedDoor(filePath, construction) {
	const name = path.basename(filePath);
	const base = name.replace(/\.(png|jpe?g|webp)$/i, '');
	const size = fs.statSync(filePath).size;
	if (size < MIN_DOOR_BYTES) return null;
	if (!/^[a-z0-9][a-z0-9-]*$/i.test(base)) return null;

	const slug = kebab(base);
	const display = titleFromKebab(base);
	return {
		filePath,
		name,
		styleKey: slug,
		display,
		construction,
		isNtl: true,
		score: 200,
		size,
	};
}

/** Legacy flat vault: STM-FDS / Style.FO.Ntl naming with natural-maple preference. */
function parseDoor(filePath) {
	const name = path.basename(filePath);
	const size = fs.statSync(filePath).size;
	if (size < MIN_DOOR_BYTES) return null;

	let styleKey = null;
	let construction = 'unknown';

	if (/^STM-FDS[_-](?:ULT_)?/i.test(name)) {
		const m = name.match(/^STM-FDS[_-](?:ULT_)?([A-Za-z0-9]+)/i);
		styleKey = m?.[1] ?? null;
	} else if (/^(\d+)\.(FO|IN|PO)\./i.test(name)) {
		const m = name.match(/^(\d+)\.(FO|IN|PO)\./i);
		styleKey = m[1];
		construction = m[2].toUpperCase() === 'IN' ? 'inset' : 'overlay';
	} else if (/^([A-Za-z]+)\.(FO|IN|PO)\./i.test(name)) {
		const m = name.match(/^([A-Za-z]+)\.(FO|IN|PO)\./i);
		styleKey = m[1];
		construction = m[2].toUpperCase() === 'IN' ? 'inset' : 'overlay';
	} else if (/^([A-Za-z]+)\.QW\./i.test(name)) {
		const m = name.match(/^([A-Za-z]+)\.QW\./i);
		styleKey = m[1];
		construction = 'overlay';
	}

	if (/\.IN\./i.test(name)) construction = 'inset';
	else if (/\.FO\./i.test(name) || /\.PO\./i.test(name)) construction = 'overlay';

	if (!styleKey) return null;

	const canon = DOOR_ALIASES[styleKey] || styleKey;
	const display = DOOR_NAMES[styleKey] || DOOR_NAMES[canon] || titleFromCamel(styleKey);

	const isNtl = /\.Ntl(_D|_D\d)?(\.|$)/i.test(name) || /\.Ntl_D/i.test(name);
	const isMpl = /(_|\.)MPL(\.|_)/i.test(name);
	const isCoF = /\.CoF_/i.test(name);
	const isVariant = /\.(5F|5R|SL|SM|Sculpted)\./i.test(name);
	const isDup = /_D\d\./i.test(name) || /Ntl_D\d/i.test(name);
	const isChocolate = /Chocolate/i.test(name);
	const isQwOnly = /\.QW\./i.test(name) && !isMpl;

	let score = 0;
	if (isNtl) score += 100;
	if (isMpl) score += 50;
	else if (isQwOnly) score += 15;
	if (!isVariant) score += 30;
	if (!isCoF) score += 20;
	if (!isDup) score += 10;
	if (!isChocolate) score += 10;
	if (construction !== 'unknown') score += 5;
	score += Math.min(15, Math.floor(size / 100000));

	return {
		filePath,
		name,
		styleKey: canon,
		display,
		construction,
		isNtl,
		score,
		size,
	};
}

function pickDoorsFromLegacy(files) {
	const byStyle = new Map();
	for (const f of files) {
		const parsed = parseDoor(f);
		if (!parsed) continue;
		const list = byStyle.get(parsed.styleKey) || [];
		list.push(parsed);
		byStyle.set(parsed.styleKey, list);
	}

	const inset = [];
	const overlay = [];

	for (const [, list] of byStyle) {
		const insetCands = list.filter((d) => d.construction === 'inset');
		const overlayCands = list.filter(
			(d) => d.construction === 'overlay' || d.construction === 'unknown',
		);

		const best = (cands) => cands.slice().sort((a, b) => b.score - a.score)[0];

		const bestInset = best(insetCands);
		if (bestInset) inset.push(bestInset);

		const bestOverlay = best(overlayCands);
		if (bestOverlay) {
			if (!bestInset || bestOverlay.filePath !== bestInset.filePath) {
				overlay.push(bestOverlay);
			}
		}
	}

	const sortByName = (a, b) => a.display.localeCompare(b.display, 'en');
	inset.sort(sortByName);
	overlay.sort(sortByName);
	return { inset, overlay };
}

function collectDoorFiles(doorsDir) {
	const inset = [];
	const overlay = [];
	let usedCurated = false;

	for (const [folderName, construction] of Object.entries(DOOR_FOLDER_MAP)) {
		const dir = path.join(doorsDir, folderName);
		if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) continue;
		usedCurated = true;
		const files = fs
			.readdirSync(dir)
			.filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
			.map((f) => path.join(dir, f));
		for (const f of files) {
			const parsed = parseCuratedDoor(f, construction);
			if (!parsed) {
				console.warn('  skip tiny/invalid door:', path.relative(doorsDir, f));
				continue;
			}
			if (construction === 'inset') inset.push(parsed);
			else overlay.push(parsed);
		}
	}

	if (usedCurated) {
		const sortByName = (a, b) => a.display.localeCompare(b.display, 'en');
		inset.sort(sortByName);
		overlay.sort(sortByName);
		return { inset, overlay, mode: 'curated' };
	}

	const flat = fs
		.readdirSync(doorsDir)
		.filter((f) => /\.(png|jpe?g)$/i.test(f))
		.map((f) => path.join(doorsDir, f));
	const picked = pickDoorsFromLegacy(flat);
	return { ...picked, mode: 'legacy' };
}

function parseFinish(filePath) {
	const name = path.basename(filePath);
	const size = fs.statSync(filePath).size;
	if (size < MIN_BYTES) return null;

	const isChocolateFile = /Chocolate/i.test(name);
	let speciesCode = null;
	let colorPart = null;
	let glazeParts = [];

	// Named specialty: "Lush Forest_MPL_F.png" / "Wander_WAL.Chocolate_F.png"
	const named = name.match(
		/^(.+?)_(MPL|CHP|ALD|HKY|OAK|QWO|WAL|PNT|RAL|RHK|RWO|QSO)(?:\.(Chocolate))?(?:\._)?_?F\.(?:png|jpg|jpeg)$/i,
	);
	if (named) {
		colorPart = named[1].trim();
		speciesCode = named[2].toUpperCase();
		// .Chocolate in named files is a dealer-portal twin render, not a separate glaze SKU
	}

	// STM-FDS_SPECIES_Color...
	const stm = name.match(
		/^STM-FDS_(PNT(?:\.OAK)?|MPL|CHP|ALD|HKY|OAK|QWO|WAL|RAL|RHK)_(.+?)(?:_F)?\.(?:png|jpg|jpeg)$/i,
	);
	if (!named && stm) {
		let sp = stm[1].toUpperCase();
		if (sp.startsWith('PNT')) sp = 'PNT';
		speciesCode = sp;
		colorPart = stm[2];
	}

	// SM_FS_OK / SM_FS_QW leftovers
	const sm = name.match(/^SM_FS_(OK|QW)\.(.+?)_F\.(?:png|jpg|jpeg)$/i);
	if (!named && !stm && sm) {
		speciesCode = sm[1].toUpperCase() === 'QW' ? 'QWO' : 'OAK';
		colorPart = sm[2];
	}

	if (!speciesCode || !colorPart) {
		// Fallback: try to salvage
		const loose = name.match(/_(MPL|CHP|ALD|HKY|OAK|QWO|WAL|PNT)[._]/i);
		if (!loose) return null;
		speciesCode = loose[1].toUpperCase();
		colorPart = name.replace(/\.(png|jpg|jpeg)$/i, '').replace(/_F$/i, '');
	}

	// Prefer plain paint over PNT.OAK duplicate substrate
	const isPaintOnOak = /STM-FDS_PNT\.OAK_/i.test(name);

	// Parse color + glazes from codes like Mrc.CoF or Slt.EbF
	const tokens = colorPart.split(/[._]/).filter(Boolean);
	const colorTokens = [];
	for (const t of tokens) {
		// Filename "Chocolate" twin marker — ignore as glaze SKU (CoF is the real chocolate glaze)
		if (/^Chocolate$/i.test(t)) continue;
		if (['CoF', 'EbF', 'NiF', 'LaF', 'Laf', 'Mat', 'WhS'].includes(t)) {
			glazeParts.push(t === 'Laf' ? 'LaF' : t);
		} else if (t !== 'F' && t !== '') {
			colorTokens.push(t);
		}
	}

	const colorName = colorTokens
		.map((t) => FINISH_CODES[t] || titleFromCamel(t))
		.join(' · ');

	const glazeName = glazeParts
		.map((t) => FINISH_CODES[t] || titleFromCamel(t))
		.filter((v, i, a) => a.indexOf(v) === i)
		.join(' · ');

	const speciesMeta = SPECIES[speciesCode] || { group: 'specialty', label: speciesCode };
	let group = speciesMeta.group;

	// Named specialty colorways (Whisper, Tideway, etc.) stay in their wood group;
	// orphaned/unclear go to specialty
	const displayBase = colorName || titleFromCamel(colorPart);
	const display = glazeName ? `${displayBase} · ${glazeName}` : displayBase;
	const speciesLabel = speciesMeta.label;

	// Dedup key: species + color + glaze (ignore Chocolate-in-filename when CoF already present)
	const dedupeKey = `${group}::${speciesCode}::${displayBase}::${glazeName}`.toLowerCase();

	let score = 0;
	if (!isChocolateFile) score += 50;
	if (!isPaintOnOak) score += 30;
	if (!glazeName) score += 5; // slight preference for base when choosing between identical
	score += Math.min(20, Math.floor(size / 50000));

	return {
		filePath,
		name,
		speciesCode,
		speciesLabel,
		group,
		display: `${display}`,
		fullName: `${speciesLabel} · ${display}`,
		dedupeKey,
		isChocolateFile,
		isPaintOnOak,
		score,
		size,
		hasGlaze: Boolean(glazeName),
	};
}

function pickFinishes(files) {
	/** Prefer non-Chocolate filename when two files share the same logical finish. */
	const byKey = new Map();
	for (const f of files) {
		const parsed = parseFinish(f);
		if (!parsed) continue;

		const key = parsed.dedupeKey;
		const existing = byKey.get(key);
		if (!existing) {
			byKey.set(key, parsed);
			continue;
		}
		if (existing.isChocolateFile && !parsed.isChocolateFile) {
			byKey.set(key, parsed);
		} else if (existing.isChocolateFile === parsed.isChocolateFile && parsed.score > existing.score) {
			byKey.set(key, parsed);
		} else if (!existing.isPaintOnOak && parsed.isPaintOnOak) {
			/* keep existing */
		} else if (existing.isPaintOnOak && !parsed.isPaintOnOak) {
			byKey.set(key, parsed);
		}
	}

	return [...byKey.values()].sort((a, b) => a.fullName.localeCompare(b.fullName, 'en'));
}

function writeDoorAssets(doors, construction) {
	const outDir = path.join(OUT_DOORS, construction);
	ensureDir(outDir);
	for (const f of fs.readdirSync(outDir)) {
		if (/\.(jpe?g|png|webp)$/i.test(f)) fs.unlinkSync(path.join(outDir, f));
	}

	const items = [];
	const jobs = [];
	const usedSlugs = new Set();
	for (const d of doors) {
		let slug = kebab(d.display);
		if (usedSlugs.has(slug)) slug = `${slug}-${d.styleKey.toLowerCase()}`;
		usedSlugs.add(slug);
		const dest = path.join(outDir, `${slug}.jpg`);
		jobs.push({ src: d.filePath, dest });
		items.push({
			src: `/images/brands/starmark/doors/${construction}/${slug}.jpg`,
			name: d.display,
			slug,
			construction,
			sourceFile: d.name,
		});
	}
	convertManyToJpeg(jobs);
	return items;
}

function writeFinishAssets(finishes) {
	const byGroup = Object.fromEntries(FINISH_GROUPS.map((g) => [g.slug, []]));
	const usedSlugs = new Map();
	const jobs = [];

	for (const fin of finishes) {
		const group = byGroup[fin.group] ? fin.group : 'specialty';
		ensureDir(path.join(OUT_FINISHES, group));
		const slugBase = kebab(`${fin.speciesLabel}-${fin.display}`);
		const used = usedSlugs.get(group) || new Set();
		let slug = slugBase;
		let n = 2;
		while (used.has(slug)) {
			slug = `${slugBase}-${n++}`;
		}
		used.add(slug);
		usedSlugs.set(group, used);

		const dest = path.join(OUT_FINISHES, group, `${slug}.jpg`);
		jobs.push({ src: fin.filePath, dest });
		byGroup[group].push({
			src: `/images/brands/starmark/finishes/${group}/${slug}.jpg`,
			name: fin.fullName,
			slug,
			species: fin.speciesLabel,
			group,
			sourceFile: fin.name,
		});
	}

	for (const g of FINISH_GROUPS) {
		const dir = path.join(OUT_FINISHES, g.slug);
		ensureDir(dir);
		const keep = new Set(byGroup[g.slug].map((i) => `${i.slug}.jpg`));
		for (const f of fs.readdirSync(dir)) {
			if (/\.(jpe?g|png|webp)$/i.test(f) && !keep.has(f)) {
				fs.unlinkSync(path.join(dir, f));
			}
		}
	}

	convertManyToJpeg(jobs);
	return byGroup;
}

function archiveFlatAssets() {
	const doorsRoot = path.join(ROOT, 'public', 'images', 'brands', 'starmark', 'doors');
	const finishesRoot = path.join(ROOT, 'public', 'images', 'brands', 'starmark', 'finishes');
	const archiveDoors = path.join(ROOT, 'public', 'images', 'brands', 'starmark', '_archive-old', 'doors');
	const archiveFinishes = path.join(
		ROOT,
		'public',
		'images',
		'brands',
		'starmark',
		'_archive-old',
		'finishes',
	);
	ensureDir(archiveDoors);
	ensureDir(archiveFinishes);

	if (fs.existsSync(doorsRoot)) {
		for (const f of fs.readdirSync(doorsRoot)) {
			const full = path.join(doorsRoot, f);
			if (fs.statSync(full).isFile() && /\.(jpe?g|png)$/i.test(f)) {
				fs.renameSync(full, path.join(archiveDoors, f));
			}
		}
	}
	if (fs.existsSync(finishesRoot)) {
		for (const f of fs.readdirSync(finishesRoot)) {
			const full = path.join(finishesRoot, f);
			if (fs.statSync(full).isFile() && /\.(jpe?g|png)$/i.test(f)) {
				fs.renameSync(full, path.join(archiveFinishes, f));
			}
		}
	}
}

function main() {
	const doorsDir = path.join(VAULT, 'Doors');
	const finishesDir = path.join(VAULT, 'Finishes');
	if (!fs.existsSync(doorsDir) || !fs.existsSync(finishesDir)) {
		console.error('Vault not found at', VAULT);
		process.exit(1);
	}

	console.log('Archiving flat curated assets…');
	archiveFlatAssets();

	const finishFiles = fs
		.readdirSync(finishesDir)
		.filter((f) => /\.(png|jpe?g)$/i.test(f))
		.map((f) => path.join(finishesDir, f));

	const { inset, overlay, mode } = collectDoorFiles(doorsDir);
	console.log(
		`Doors mode=${mode}: inset=${inset.length}, overlay=${overlay.length}; finishes scanned=${finishFiles.length}`,
	);
	const finishes = pickFinishes(finishFiles);
	console.log(`Selected finishes=${finishes.length}`);

	console.log('Converting door images…');
	const insetOut = writeDoorAssets(inset, 'inset');
	const overlayOut = writeDoorAssets(overlay, 'overlay');

	console.log('Converting finish images…');
	const finishesByGroup = writeFinishAssets(finishes);

	const groups = FINISH_GROUPS.map((g) => ({
		...g,
		count: finishesByGroup[g.slug]?.length ?? 0,
		items: finishesByGroup[g.slug] ?? [],
	})).filter((g) => g.count > 0);

	const catalog = {
		generatedAt: new Date().toISOString(),
		brand: 'starmark',
		doors: {
			inset: insetOut,
			overlay: overlayOut,
		},
		finishes: {
			groups,
		},
		notes: {
			doorsPolicy:
				'Curated vault: one image per style from Doors/full-overlay and Doors/inset (kebab filenames). Files under 8KB skipped. Legacy flat STM-FDS vault still supported as fallback (prefer natural/maple).',
			finishesPolicy:
				'Nearly all usable swatches ≥20KB. Chocolate file variants skipped when a non-Chocolate twin exists. Paint-on-oak substrate dupes deprioritized vs plain paint. Glaze variants (Chocolate/Ebony/Nickel/Latte) kept as separate samples. Walnut + quartersawn oak combined under specialty-woods; paint is its own group.',
			nameAmbiguities: [
				'Door display names taken from curated kebab filenames (e.g. emmerson.jpg → Emmerson) — confirm spelling against current StarMark literature.',
				'Paint codes Bmk/Ety/Euc/Sne mapped heuristically (Benchmark/Entity/Eucalyptus/Stone) — confirm dealer names.',
				'Tiny finish PNGs (<20KB) such as AutumnRed/GrapeHarvest skipped as likely broken.',
			],
		},
	};

	ensureDir(path.dirname(OUT_JSON));
	fs.writeFileSync(OUT_JSON, JSON.stringify(catalog, null, 2));
	console.log('Wrote', OUT_JSON);
	console.log(
		'Counts:',
		JSON.stringify(
			{
				inset: insetOut.length,
				overlay: overlayOut.length,
				finishes: Object.fromEntries(groups.map((g) => [g.slug, g.count])),
			},
			null,
			2,
		),
	);
}

main();
