/**
 * Process dealer vault images for Merit, Lectus, Kith, Nations into web catalog assets + JSON.
 * Skips Mouser (upload in progress) and StarMark (separate process-starmark-catalog.mjs).
 *
 * Vault layouts (mirrored as-found):
 * - merit / lectus / kith-kitchens: doors/ (flat), finishes/ (flat kebab names)
 * - kith-kitchens: also kith-specialty-finishes/
 * - nations: doors/ (flat), finishes/{framed,frameless}/
 *
 * Output: public/images/brands/<slug>/{doors,finishes}/ + src/data/catalogs/<slug>.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const MIN_FINISH_BYTES = 8 * 1024;
const MIN_DOOR_BYTES = 4 * 1024;
const MAX_EDGE = 1100;
const JPEG_QUALITY = 85;

const IMAGE_EXT = /\.(png|jpe?g|webp|gif)$/i;

/** Known finish group metadata (order matters for index pages). */
const FINISH_GROUP_META = {
	paint: { name: 'Paint', description: 'Solid paint colors and painted looks.' },
	maple: { name: 'Maple', description: 'Stains and specialty colors on maple.' },
	cherry: { name: 'Cherry', description: 'Stains and specialty colors on cherry.' },
	oak: { name: 'Oak', description: 'Stains and specialty colors on oak.' },
	alder: { name: 'Alder', description: 'Stains on alder.' },
	hickory: { name: 'Hickory', description: 'Stains on hickory.' },
	laminate: { name: 'Laminate', description: 'Laminate finish samples.' },
	thermofoil: { name: 'Thermofoil', description: 'Thermofoil finish samples.' },
	acrylic: { name: 'Acrylic', description: 'Acrylic finish samples.' },
	specialty: { name: 'Specialty', description: 'Glazes, vintage, and specialty colorways.' },
	'specialty-woods': {
		name: 'Specialty woods',
		description: 'Walnut, pine, and other specialty wood finishes.',
	},
	framed: {
		name: 'Framed (Tidwell)',
		description: 'Finish samples for Nations Tidwell framed cabinetry.',
	},
	frameless: {
		name: 'Frameless (DreamCraft)',
		description: 'Finish samples for Nations DreamCraft frameless cabinetry.',
	},
};

const BRANDS = [
	{
		vault: 'merit',
		slug: 'merit-kitchens',
		displayName: 'Merit Kitchens',
		doorsMode: 'flat',
		finishesMode: 'prefixed',
	},
	{
		vault: 'lectus',
		slug: 'lectus',
		displayName: 'Lectus',
		doorsMode: 'flat',
		finishesMode: 'prefixed',
	},
	{
		vault: 'kith-kitchens',
		slug: 'kith-kitchens',
		displayName: 'Kith Kitchens',
		doorsMode: 'flat',
		finishesMode: 'prefixed',
		specialtyFinishesDir: 'kith-specialty-finishes',
	},
	{
		vault: 'nations',
		slug: 'nations-cabinetry',
		displayName: 'Nations Cabinetry',
		doorsMode: 'flat',
		finishesMode: 'framed-frameless',
	},
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

function titleFromKebab(s) {
	return String(s)
		.replace(/[-_]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
		.replace(/\b\w/g, (c) => c.toUpperCase())
		.replace(/\bIi\b/g, 'II')
		.replace(/\bMdf\b/g, 'MDF')
		.replace(/\bJs\b/g, 'JS')
		.replace(/\bQso\b/g, 'QSO');
}

function convertManyToJpeg(jobs, label = 'images') {
	if (!jobs.length) return;
	for (const j of jobs) ensureDir(path.dirname(j.dest));

	const listPath = path.join(ROOT, 'scripts', `.brand-convert-jobs-${Date.now()}.json`);
	fs.writeFileSync(listPath, JSON.stringify(jobs));
	const ps = `
Add-Type -AssemblyName System.Drawing
$jobs = Get-Content -Raw '${listPath.replace(/'/g, "''")}' | ConvertFrom-Json
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$enc = [System.Drawing.Imaging.Encoder]::Quality
$max = ${MAX_EDGE}
$qi = ${JPEG_QUALITY}
$i = 0
$fail = 0
foreach ($job in $jobs) {
  $i++
  if ($i % 25 -eq 0) { Write-Host "Converted $i / $($jobs.Count)" }
  try {
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
      $g.Clear([System.Drawing.Color]::White)
      $g.DrawImage($src, 0, 0, $nw, $nh)
      $g.Dispose()
      $eps = New-Object System.Drawing.Imaging.EncoderParameters 1
      $eps.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter $enc, $qi
      $bmp.Save($job.dest, $codec, $eps)
      $bmp.Dispose(); $eps.Dispose()
    } finally { $src.Dispose() }
  } catch {
    $fail++
    Write-Host "FAIL $($job.src): $_"
  }
}
Write-Host "Done $($jobs.Count) ${label} (fail=$fail)"
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

/** Clean dealer scrape names like imgi_30_Concord-Slab-1-691x1024 */
function doorBaseFromFilename(name) {
	let base = name.replace(IMAGE_EXT, '');
	const imgi = base.match(/^imgi_\d+_(.+)$/i);
	if (imgi) {
		base = imgi[1]
			.replace(/-\d{2,4}x\d{2,4}$/i, '')
			.replace(/-web-thumbnail.*$/i, '')
			.replace(/-no-border$/i, '')
			.replace(/-Custom-Cabinet-Door-in-.*$/i, '')
			.replace(/-1$/i, '');
	}
	base = base
		.replace(/-door$/i, '')
		.replace(/-mdf$/i, '-mdf')
		.replace(/_+/g, '-');
	return kebab(base);
}

function parseDoorFile(filePath) {
	const name = path.basename(filePath);
	const size = fs.statSync(filePath).size;
	if (size < MIN_DOOR_BYTES) return null;

	const slug = doorBaseFromFilename(name);
	if (!slug || slug.length < 2) return null;

	const isImgi = /^imgi_/i.test(name);
	const display = titleFromKebab(slug);

	return {
		filePath,
		name,
		slug,
		display,
		isImgi,
		size,
		score: (isImgi ? 0 : 50) + Math.min(30, Math.floor(size / 20000)),
	};
}

function collectFlatDoors(doorsDir) {
	if (!fs.existsSync(doorsDir)) return [];
	const files = fs
		.readdirSync(doorsDir)
		.filter((f) => IMAGE_EXT.test(f))
		.map((f) => path.join(doorsDir, f));

	const bySlug = new Map();
	for (const f of files) {
		const parsed = parseDoorFile(f);
		if (!parsed) {
			console.warn('  skip tiny/invalid door:', path.basename(f));
			continue;
		}
		const existing = bySlug.get(parsed.slug);
		if (!existing || parsed.score > existing.score) {
			bySlug.set(parsed.slug, parsed);
		}
	}

	return [...bySlug.values()].sort((a, b) => a.display.localeCompare(b.display, 'en'));
}

/**
 * Infer finish group + display from kebab filenames like maple-natural, paint-alabaster, iron-laminate.
 */
function parsePrefixedFinish(filePath, { forceGroup, forceSpecialty } = {}) {
	const name = path.basename(filePath);
	const size = fs.statSync(filePath).size;
	if (size < MIN_FINISH_BYTES) return null;

	const base = kebab(name.replace(IMAGE_EXT, ''));
	if (!base) return null;

	let group = forceGroup || null;
	let displayBase = base;
	let speciesLabel = null;

	const SPECIES_PREFIX = /^(maple|cherry|oak|alder|hickory|walnut|pine)-(.+)$/i;
	const MATERIAL_SUFFIX = /^(.+)-(paint|laminate|thermofoil|acrylic)$/i;
	const PAINT_PREFIX = /^paint-(.+)$/i;
	const ACRYLIC_PREFIX = /^acrylic-(.+)$/i;

	if (forceSpecialty) {
		group = 'specialty';
		displayBase = base;
	} else if (PAINT_PREFIX.test(base)) {
		group = 'paint';
		displayBase = base.replace(PAINT_PREFIX, '$1');
		speciesLabel = 'Paint';
	} else if (ACRYLIC_PREFIX.test(base)) {
		group = 'acrylic';
		displayBase = base.replace(ACRYLIC_PREFIX, '$1');
		speciesLabel = 'Acrylic';
	} else if (SPECIES_PREFIX.test(base)) {
		const m = base.match(SPECIES_PREFIX);
		const sp = m[1].toLowerCase();
		if (sp === 'walnut' || sp === 'pine') {
			group = 'specialty-woods';
			speciesLabel = titleFromKebab(sp);
		} else {
			group = sp;
			speciesLabel = titleFromKebab(sp);
		}
		displayBase = m[2];
	} else if (MATERIAL_SUFFIX.test(base)) {
		const m = base.match(MATERIAL_SUFFIX);
		displayBase = m[1];
		const mat = m[2].toLowerCase();
		group = mat === 'paint' ? 'paint' : mat;
		speciesLabel = titleFromKebab(mat);
	} else if (/paint|opaque|frost/i.test(base) && !SPECIES_PREFIX.test(base)) {
		group = 'paint';
		displayBase = base.replace(/-paint$/i, '').replace(/^paint-/i, '');
		speciesLabel = 'Paint';
	} else if (/laminate/i.test(base)) {
		group = 'laminate';
		displayBase = base.replace(/-laminate$/i, '');
		speciesLabel = 'Laminate';
	} else {
		// Orphan color name — treat as paint for catalog browsing
		group = 'paint';
		displayBase = base;
		speciesLabel = 'Paint';
	}

	// Fix common typos / odd names
	displayBase = displayBase
		.replace(/^lectus-midnight$/i, 'midnight')
		.replace(/^whte$/i, 'white')
		.replace(/^twighlight$/i, 'twilight')
		.replace(/^hint-of-lavender-sky$/i, 'hint-of-lavender')
		.replace(/^rocky-cliff-laminate$/i, 'rocky-cliff')
		.replace(/^pearl-white$/i, 'pearl-white')
		.replace(/^snow-powder-frost$/i, 'snow-powder-frost')
		.replace(/^tahini-opaque$/i, 'tahini');

	const colorName = titleFromKebab(displayBase);
	const fullName = speciesLabel ? `${speciesLabel} · ${colorName}` : colorName;

	return {
		filePath,
		name,
		group,
		display: colorName,
		fullName,
		speciesLabel: speciesLabel || FINISH_GROUP_META[group]?.name || group,
		slugBase: kebab(`${speciesLabel || group}-${displayBase}`),
		dedupeKey: `${group}::${displayBase}`.toLowerCase(),
		size,
		score: Math.min(40, Math.floor(size / 10000)),
	};
}

function collectPrefixedFinishes(finishesDir, specialtyDir) {
	const files = [];
	if (fs.existsSync(finishesDir)) {
		for (const f of fs.readdirSync(finishesDir)) {
			if (IMAGE_EXT.test(f)) files.push({ path: path.join(finishesDir, f), specialty: false });
		}
	}
	if (specialtyDir && fs.existsSync(specialtyDir)) {
		for (const f of fs.readdirSync(specialtyDir)) {
			if (IMAGE_EXT.test(f)) files.push({ path: path.join(specialtyDir, f), specialty: true });
		}
	}

	const byKey = new Map();
	for (const { path: fp, specialty } of files) {
		const parsed = parsePrefixedFinish(fp, { forceSpecialty: specialty });
		if (!parsed) {
			console.warn('  skip tiny/invalid finish:', path.basename(fp));
			continue;
		}
		const existing = byKey.get(parsed.dedupeKey);
		if (!existing || parsed.score > existing.score) {
			byKey.set(parsed.dedupeKey, parsed);
		}
	}
	return [...byKey.values()].sort((a, b) => a.fullName.localeCompare(b.fullName, 'en'));
}

/**
 * Nations: finishes/framed + finishes/frameless.
 * Framed stays as its own group; frameless is split by species/material when prefixed.
 */
function collectNationsFinishes(finishesRoot) {
	const framedDir = path.join(finishesRoot, 'framed');
	const framelessDir = path.join(finishesRoot, 'frameless');
	const results = [];

	if (fs.existsSync(framedDir)) {
		for (const f of fs.readdirSync(framedDir)) {
			if (!IMAGE_EXT.test(f)) continue;
			const fp = path.join(framedDir, f);
			const size = fs.statSync(fp).size;
			if (size < MIN_FINISH_BYTES) {
				console.warn('  skip tiny framed finish:', f);
				continue;
			}
			const base = kebab(f.replace(IMAGE_EXT, ''));
			const colorName = titleFromKebab(base);
			results.push({
				filePath: fp,
				name: f,
				group: 'framed',
				display: colorName,
				fullName: `Framed · ${colorName}`,
				speciesLabel: 'Framed',
				slugBase: kebab(`framed-${base}`),
				dedupeKey: `framed::${base}`,
				size,
				score: Math.min(40, Math.floor(size / 10000)),
			});
		}
	}

	if (fs.existsSync(framelessDir)) {
		for (const f of fs.readdirSync(framelessDir)) {
			if (!IMAGE_EXT.test(f)) continue;
			const fp = path.join(framelessDir, f);
			const parsed = parsePrefixedFinish(fp);
			if (!parsed) {
				console.warn('  skip tiny frameless finish:', f);
				continue;
			}
			// Unprefixed frameless colors → paint group (not "framed")
			if (parsed.group === 'paint' && !/^(paint|maple|cherry|oak|alder|hickory|acrylic|walnut|pine)/i.test(kebab(f.replace(IMAGE_EXT, '')))) {
				// Keep as paint for solid colors / stains without species on DreamCraft
				const base = kebab(f.replace(IMAGE_EXT, ''));
				const specialtyWoods = /^(walnut|wenge|merapi|mochatini|gregio-pine|sahali-pine|seared-oak|toasted-oak|slate|morning-fog)$/i;
				if (specialtyWoods.test(base)) {
					parsed.group = 'specialty-woods';
					parsed.speciesLabel = 'Specialty';
					parsed.fullName = `Specialty · ${parsed.display}`;
					parsed.slugBase = kebab(`specialty-${base}`);
					parsed.dedupeKey = `specialty-woods::${base}`;
				}
			}
			// Prefix fullName with Frameless context only for clarity in mixed lists? Keep species-style.
			results.push(parsed);
		}
	}

	const byKey = new Map();
	for (const fin of results) {
		const existing = byKey.get(fin.dedupeKey);
		if (!existing || fin.score > existing.score) byKey.set(fin.dedupeKey, fin);
	}
	return [...byKey.values()].sort((a, b) => a.fullName.localeCompare(b.fullName, 'en'));
}

function clearImageFiles(dir) {
	if (!fs.existsSync(dir)) return;
	for (const f of fs.readdirSync(dir)) {
		const full = path.join(dir, f);
		if (fs.statSync(full).isFile() && IMAGE_EXT.test(f)) fs.unlinkSync(full);
	}
}

function writeDoorAssets(doors, slug) {
	const outDir = path.join(ROOT, 'public', 'images', 'brands', slug, 'doors');
	ensureDir(outDir);
	clearImageFiles(outDir);

	const items = [];
	const jpegJobs = [];
	const used = new Set();

	for (const d of doors) {
		let s = d.slug;
		let n = 2;
		while (used.has(s)) s = `${d.slug}-${n++}`;
		used.add(s);

		// System.Drawing often can't decode WebP — copy as-is for those sources.
		const isWebp = /\.webp$/i.test(d.name);
		if (isWebp) {
			const dest = path.join(outDir, `${s}.webp`);
			fs.copyFileSync(d.filePath, dest);
			items.push({
				src: `/images/brands/${slug}/doors/${s}.webp`,
				name: d.display,
				slug: s,
				construction: 'doors',
				sourceFile: d.name,
			});
			continue;
		}

		const dest = path.join(outDir, `${s}.jpg`);
		jpegJobs.push({ src: d.filePath, dest });
		items.push({
			src: `/images/brands/${slug}/doors/${s}.jpg`,
			name: d.display,
			slug: s,
			construction: 'doors',
			sourceFile: d.name,
		});
	}

	convertManyToJpeg(jpegJobs, `${slug} doors`);
	return items;
}

function writeFinishAssets(finishes, slug) {
	const outRoot = path.join(ROOT, 'public', 'images', 'brands', slug, 'finishes');
	ensureDir(outRoot);

	const byGroup = {};
	const usedSlugs = new Map();
	const jobs = [];

	for (const fin of finishes) {
		const group = FINISH_GROUP_META[fin.group] ? fin.group : 'specialty';
		if (!byGroup[group]) byGroup[group] = [];
		ensureDir(path.join(outRoot, group));

		const used = usedSlugs.get(group) || new Set();
		let s = fin.slugBase;
		let n = 2;
		while (used.has(s)) s = `${fin.slugBase}-${n++}`;
		used.add(s);
		usedSlugs.set(group, used);

		const dest = path.join(outRoot, group, `${s}.jpg`);
		jobs.push({ src: fin.filePath, dest });
		byGroup[group].push({
			src: `/images/brands/${slug}/finishes/${group}/${s}.jpg`,
			name: fin.fullName,
			slug: s,
			species: fin.speciesLabel,
			group,
			sourceFile: fin.name,
		});
	}

	// Clean stale files in known + new group dirs
	const groupSlugs = new Set([...Object.keys(byGroup), ...Object.keys(FINISH_GROUP_META)]);
	for (const g of groupSlugs) {
		const dir = path.join(outRoot, g);
		if (!fs.existsSync(dir)) continue;
		const keep = new Set((byGroup[g] || []).map((i) => `${i.slug}.jpg`));
		for (const f of fs.readdirSync(dir)) {
			if (IMAGE_EXT.test(f) && !keep.has(f) && f.endsWith('.jpg') === false) {
				// remove non-matching
			}
			if (IMAGE_EXT.test(f) && !keep.has(f)) fs.unlinkSync(path.join(dir, f));
		}
	}

	convertManyToJpeg(jobs, `${slug} finishes`);
	return byGroup;
}

function processBrand(cfg) {
	const vaultRoot = path.join(ROOT, 'images', 'brands', cfg.vault);
	const doorsDir = path.join(vaultRoot, 'doors');
	const finishesDir = path.join(vaultRoot, 'finishes');

	console.log(`\n=== ${cfg.displayName} (${cfg.slug}) ===`);
	if (!fs.existsSync(vaultRoot)) {
		console.error('Vault missing:', vaultRoot);
		return null;
	}

	const doors = collectFlatDoors(doorsDir);
	console.log(`Doors selected: ${doors.length}`);

	let finishes = [];
	if (cfg.finishesMode === 'framed-frameless') {
		finishes = collectNationsFinishes(finishesDir);
	} else {
		const specialty = cfg.specialtyFinishesDir
			? path.join(vaultRoot, cfg.specialtyFinishesDir)
			: null;
		finishes = collectPrefixedFinishes(finishesDir, specialty);
	}
	console.log(`Finishes selected: ${finishes.length}`);

	const doorItems = writeDoorAssets(doors, cfg.slug);
	const finishesByGroup = writeFinishAssets(finishes, cfg.slug);

	const groupOrder = Object.keys(FINISH_GROUP_META);
	const groups = groupOrder
		.filter((g) => (finishesByGroup[g] || []).length > 0)
		.map((g) => ({
			slug: g,
			name: FINISH_GROUP_META[g].name,
			description: FINISH_GROUP_META[g].description,
			count: finishesByGroup[g].length,
			items: finishesByGroup[g],
		}));

	// Any unexpected groups
	for (const g of Object.keys(finishesByGroup)) {
		if (groups.some((x) => x.slug === g)) continue;
		groups.push({
			slug: g,
			name: titleFromKebab(g),
			description: `${titleFromKebab(g)} finish samples.`,
			count: finishesByGroup[g].length,
			items: finishesByGroup[g],
		});
	}

	const catalog = {
		generatedAt: new Date().toISOString(),
		brand: cfg.slug,
		displayName: cfg.displayName,
		doorsMode: cfg.doorsMode,
		doors: {
			all: doorItems,
		},
		finishes: { groups },
		notes: {
			vault: `images/brands/${cfg.vault}`,
			doorsPolicy:
				'Flat doors/ folder — one sample per style. Kebab filenames preferred; imgi_* scrape names cleaned. Files under 4KB skipped.',
			finishesPolicy:
				cfg.finishesMode === 'framed-frameless'
					? 'Nations finishes/framed kept as Framed (Tidwell). finishes/frameless split by species/material prefix when present; unprefixed solids → paint; specialty woods combined. Files under 8KB skipped.'
					: 'Finishes grouped by filename prefix/suffix (maple-, paint-, *-laminate, etc.). Specialty folder (Kith) → specialty group. Files under 8KB skipped.',
		},
	};

	const outJson = path.join(ROOT, 'src', 'data', 'catalogs', `${cfg.slug}.json`);
	ensureDir(path.dirname(outJson));
	fs.writeFileSync(outJson, JSON.stringify(catalog, null, 2));
	console.log('Wrote', outJson);
	console.log(
		'Counts:',
		JSON.stringify(
			{
				doors: doorItems.length,
				finishes: Object.fromEntries(groups.map((g) => [g.slug, g.count])),
			},
			null,
			2,
		),
	);
	return catalog;
}

function main() {
	const results = [];
	for (const cfg of BRANDS) {
		results.push(processBrand(cfg));
	}
	console.log('\nAll brand catalogs processed.');
	console.log(
		'Summary:',
		results.filter(Boolean).map((c) => ({
			brand: c.brand,
			doors: c.doors.all.length,
			finishGroups: c.finishes.groups.length,
			finishes: c.finishes.groups.reduce((s, g) => s + g.count, 0),
		})),
	);
}

main();
