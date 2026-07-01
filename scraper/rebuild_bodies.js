const fs = require("fs");
const p = "D:/kaifa_stu/world_website/src/data/bodies.ts";
// Re-create bodies.ts using ASCII-only and unicode escape for non-ASCII

const bodies = `// Solar system bodies data (NASA-derived public domain facts).

export type BodyKind = "star" | "planet" | "dwarf" | "moon" | "asteroid" | "comet" | "belt";

export interface SolarBody {
  id: string;
  name: string;
  kind: BodyKind;
  emoji?: string;
  color: string;
  radiusKm: number;
  diameterKm: number;
  massKg: string;
  gravity: string;
  orbitAu: number;
  orbitPeriodDays: number;
  rotationHours: number;
  axialTiltDeg: number;
  composition: string;
  atmosphere?: string;
  temperatureC: { min: number; max: number };
  tagline: string;
  description: string;
  funFacts: string[];
  textureUrl?: string;
  ringColor?: string;
  hasRings?: boolean;
  moons?: number;
  order: number;
  symbol: string;
  parent?: string;
}

export const SUN: SolarBody = {
  id: "sun",
  name: "Sun",
  kind: "star",
  emoji: "\\u2600\\uFE0F",
  color: "#fbbf24",
  radiusKm: 696340,
  diameterKm: 1392680,
  massKg: "1.989\\u00D710^30",
  gravity: "274 m/s\\u00B2",
  orbitAu: 0,
  orbitPeriodDays: 0,
  rotationHours: 609.6,
  axialTiltDeg: 7.25,
  composition: "Hydrogen (73%), Helium (25%), trace elements",
  atmosphere: "Photosphere, chromosphere, corona",
  temperatureC: { min: 5500, max: 15000000 },
  tagline: "Our star \\u2014 a 4.6-billion-year-old ball of fusion.",
  description: "The Sun is the heart of our solar system. Its gravity holds everything from the smallest dust mote to the gas giants in orbit. In its core, 600 million tons of hydrogen fuse into helium every second, releasing energy that travels 93 million miles to warm our world.",
  funFacts: [
    "Light from the Sun takes 8 minutes 20 seconds to reach Earth.",
    "The Sun accounts for 99.86% of the solar system\\u2019s mass.",
    "Its surface temperature is ~5,500\\u00B0C \\u2014 but the corona is 200\\u00D7 hotter.",
    "Every second, the Sun converts ~4 million tons of mass into energy."
  ],
  symbol: "\\u2609",
  order: 0
};

export const BODIES: SolarBody[] = [
  { id: "mercury", name: "Mercury", kind: "planet", emoji: "\\u263F", color: "#a8a29e", radiusKm: 2440, diameterKm: 4879, massKg: "3.30\\u00D710^23", gravity: "3.7 m/s\\u00B2", orbitAu: 0.387, orbitPeriodDays: 88, rotationHours: 1407.6, axialTiltDeg: 0.034, composition: "Iron core (~75% radius), silicate mantle", atmosphere: "Trace: O\\u2082, Na, H\\u2082, He", temperatureC: { min: -173, max: 427 }, tagline: "The swift messenger of the gods.", description: "Mercury is the smallest planet in our solar system and the closest to the Sun. With virtually no atmosphere, its surface swings between blistering days and frigid nights. The MESSENGER and BepiColombo missions revealed a planet rich in iron and scarred by ancient impacts.", funFacts: ["A single Mercury day lasts ~176 Earth days \\u2014 twice its year.", "Despite being closest to the Sun, Venus is hotter.", "Craters on Mercury are named after artists, musicians, and authors.", "Ice may hide in permanently shadowed polar craters."], symbol: "\\u263F", moons: 0, order: 1 },
  { id: "venus", name: "Venus", kind: "planet", emoji: "\\u2640", color: "#fcd34d", radiusKm: 6052, diameterKm: 12104, massKg: "4.87\\u00D710^24", gravity: "8.87 m/s\\u00B2", orbitAu: 0.723, orbitPeriodDays: 225, rotationHours: -5832.5, axialTiltDeg: 177.4, composition: "Iron core, rocky mantle, CO\\u2082 atmosphere", atmosphere: "96% CO\\u2082, 3.5% N\\u2082, sulfuric acid clouds", temperatureC: { min: 462, max: 471 }, tagline: "Earth\\u2019s hellish twin.", description: "Venus is the hottest planet in the solar system thanks to a runaway greenhouse atmosphere of carbon dioxide. Its surface pressure is 92\\u00D7 Earth\\u2019s, and its clouds rain sulfuric acid. Radar mapping by Magellan revealed volcanoes, vast plains, and a young, restless surface.", funFacts: ["A day on Venus is longer than its year.", "It rotates backwards \\u2014 the Sun rises in the west.", "Surface temps (~465\\u00B0C) melt lead.", "It\\u2019s the brightest planet in our night sky."], symbol: "\\u2640", moons: 0, order: 2 },
  { id: "earth", name: "Earth", kind: "planet", emoji: "\\uD83C\\uDF0D", color: "#3b82f6", radiusKm: 6371, diameterKm: 12742, massKg: "5.97\\u00D710^24", gravity: "9.81 m/s\\u00B2", orbitAu: 1.0, orbitPeriodDays: 365.25, rotationHours: 23.93, axialTiltDeg: 23.44, composition: "Iron core, silicate mantle, liquid water oceans", atmosphere: "78% N\\u2082, 21% O\\u2082, 1% trace", temperatureC: { min: -89, max: 58 }, tagline: "The pale blue dot \\u2014 home.", description: "Earth is the only world we know that hosts life. Liquid water, a magnetic field, plate tectonics, and an oxygen-rich atmosphere combine to make a planet of storms, oceans, forests, and us. From orbit, it\\u2019s the brightest thing in the lunar sky.", funFacts: ["Earth is not a perfect sphere \\u2014 it bulges at the equator.", "The Moon stabilizes our axial tilt and climate.", "71% of the surface is ocean.", "Our magnetic field deflects solar wind."], symbol: "\\u2295", moons: 1, order: 3 },
  { id: "mars", name: "Mars", kind: "planet", emoji: "\\u2642", color: "#dc2626", radiusKm: 3390, diameterKm: 6779, massKg: "6.42\\u00D710^23", gravity: "3.71 m/s\\u00B2", orbitAu: 1.524, orbitPeriodDays: 687, rotationHours: 24.62, axialTiltDeg: 25.19, composition: "Iron core, basaltic mantle, iron-oxide surface", atmosphere: "95% CO\\u2082, 3% N\\u2082, 1.6% Ar", temperatureC: { min: -87, max: -5 }, tagline: "The red planet \\u2014 our next frontier.", description: "Mars has captured human imagination for centuries. With seasons, polar caps, and the largest volcano in the solar system (Olympus Mons), it\\u2019s a cold desert world with a thin atmosphere. Rovers Perseverance, Curiosity, and Zhurong are actively exploring its surface.", funFacts: ["Olympus Mons is 22 km tall \\u2014 2.5\\u00D7 Everest.", "Dust storms can engulf the entire planet.", "A day on Mars is only 37 minutes longer than Earth\\u2019s.", "Frozen water lies beneath its surface."], symbol: "\\u2642", moons: 2, order: 4 },
  { id: "jupiter", name: "Jupiter", kind: "planet", emoji: "\\u2643", color: "#d97706", radiusKm: 69911, diameterKm: 139820, massKg: "1.90\\u00D710^27", gravity: "24.79 m/s\\u00B2", orbitAu: 5.203, orbitPeriodDays: 4333, rotationHours: 9.93, axialTiltDeg: 3.13, composition: "Hydrogen, helium, trace ices", atmosphere: "90% H\\u2082, 10% He, CH\\u2084, NH\\u2083, H\\u2082O clouds", temperatureC: { min: -145, max: -110 }, tagline: "King of planets \\u2014 a failed star.", description: "Jupiter is the largest planet, with a Great Red Spot \\u2014 a storm bigger than Earth that has raged for at least 350 years. Its mass is 2.5\\u00D7 all the other planets combined. Juno revealed cyclones at the poles, deep ammonia clouds, and a fuzzy core.", funFacts: ["Jupiter has 95 known moons (as of 2026).", "Its magnetic field is 20,000\\u00D7 stronger than Earth\\u2019s.", "It radiates more heat than it receives from the Sun.", "The Great Red Spot is shrinking \\u2014 but still huge."], symbol: "\\u2643", moons: 95, order: 5 },
  { id: "saturn", name: "Saturn", kind: "planet", emoji: "\\u2644", color: "#eab308", radiusKm: 58232, diameterKm: 116460, massKg: "5.68\\u00D710^26", gravity: "10.44 m/s\\u00B2", orbitAu: 9.537, orbitPeriodDays: 10759, rotationHours: 10.7, axialTiltDeg: 26.73, composition: "Hydrogen, helium", atmosphere: "96% H\\u2082, 3% He", temperatureC: { min: -178, max: -138 }, tagline: "The jewel \\u2014 a ringed gas giant.", description: "Saturn\\u2019s rings are made of billions of icy fragments \\u2014 from grains to houses \\u2014 spread across a system wider than the planet but only ~10 meters thick. Cassini\\u2019s Grand Finale in 2017 dove between the rings before plunging into the gas giant.", funFacts: ["Saturn is so light it would float in water (if a bathtub existed).", "It has 146 confirmed moons \\u2014 more than any other planet.", "Its rings are younger than the dinosaurs \\u2014 under 400 million years old.", "Titan, its largest moon, has lakes of liquid methane."], symbol: "\\u2644", ringColor: "#f5deb3", hasRings: true, moons: 146, order: 6 },
  { id: "uranus", name: "Uranus", kind: "planet", emoji: "\\u2645", color: "#06b6d4", radiusKm: 25362, diameterKm: 50724, massKg: "8.68\\u00D710^25", gravity: "8.69 m/s\\u00B2", orbitAu: 19.191, orbitPeriodDays: 30687, rotationHours: -17.24, axialTiltDeg: 97.77, composition: "Ices (H\\u2082O, CH\\u2084, NH\\u2083), H\\u2082/He envelope", atmosphere: "82% H\\u2082, 15% He, 2% CH\\u2084", temperatureC: { min: -224, max: -197 }, tagline: "The tilted ice giant.", description: "Uranus rotates on its side \\u2014 likely due to an ancient cataclysmic collision. Its methane-rich atmosphere gives it a cyan hue. A faint ring system and 28 known moons orbit it. Voyager 2 is the only spacecraft to have visited.", funFacts: ["Uranus\\u2019s tilt means each pole sees 42 years of sunlight, then 42 years of darkness.", "It\\u2019s the coldest planetary atmosphere in the solar system.", "It was the first planet discovered with a telescope (William Herschel, 1781).", "Its winds reach 900 km/h."], symbol: "\\u2645", hasRings: true, ringColor: "#67e8f9", moons: 28, order: 7 },
  { id: "neptune", name: "Neptune", kind: "planet", emoji: "\\u2646", color: "#1d4ed8", radiusKm: 24622, diameterKm: 49244, massKg: "1.02\\u00D710^26", gravity: "11.15 m/s\\u00B2", orbitAu: 30.069, orbitPeriodDays: 60190, rotationHours: 16.11, axialTiltDeg: 28.32, composition: "Ices (H\\u2082O, CH\\u2084, NH\\u2083), H\\u2082/He envelope", atmosphere: "80% H\\u2082, 19% He, 1% CH\\u2084", temperatureC: { min: -218, max: -200 }, tagline: "The windswept ice giant.", description: "Neptune is the windiest planet, with gusts up to 2,100 km/h. Its vivid blue color comes from methane absorbing red light. Discovered by mathematical prediction in 1846, it was visited only once \\u2014 by Voyager 2 in 1989.", funFacts: ["Neptune was the first planet found by math before observation.", "One Neptune year = 165 Earth years.", "It has 16 known moons \\u2014 Triton orbits backwards.", "A 1989 dark spot (Great Dark Spot) has since vanished."], symbol: "\\u2646", moons: 16, order: 8 },
  { id: "pluto", name: "Pluto", kind: "dwarf", emoji: "\\u2647", color: "#a78bfa", radiusKm: 1188, diameterKm: 2376, massKg: "1.30\\u00D710^22", gravity: "0.62 m/s\\u00B2", orbitAu: 39.482, orbitPeriodDays: 90560, rotationHours: -153.3, axialTiltDeg: 122.53, composition: "Rock and ice", atmosphere: "Thin N\\u2082, CH\\u2084, CO", temperatureC: { min: -240, max: -218 }, tagline: "The beloved dwarf planet.", description: "Pluto was reclassified as a dwarf planet in 2006, but it remains a world of wonder. New Horizons flew by in 2015, revealing a heart-shaped glacier, ice mountains, and a possible subsurface ocean. It has 5 moons, including Charon \\u2014 half its size.", funFacts: ["Pluto\\u2019s heart-shaped glacier is named Tombaugh Regio.", "It hasn\\u2019t completed a single orbit since 1930 (discovery).", "Sunlight at Pluto is 1,000\\u00D7 dimmer than on Earth.", "A year on Pluto is 248 Earth years."], symbol: "\\u2647", moons: 5, order: 9 },
  { id: "ceres", name: "Ceres", kind: "dwarf", emoji: "\\u26B6", color: "#94a3b8", radiusKm: 473, diameterKm: 940, massKg: "9.39\\u00D710^20", gravity: "0.27 m/s\\u00B2", orbitAu: 2.766, orbitPeriodDays: 1682, rotationHours: 9.07, axialTiltDeg: 4, composition: "Rock and ice", atmosphere: "Trace water vapor", temperatureC: { min: -158, max: -38 }, tagline: "The asteroid belt\\u2019s brightest resident.", description: "Ceres is the largest object in the asteroid belt and the closest dwarf planet. NASA\\u2019s Dawn mission (2015) revealed bright salt deposits in Occator crater \\u2014 evidence of past briny water. It may host a subsurface ocean.", funFacts: ["Ceres makes up 25% of the asteroid belt\\u2019s mass.", "It\\u2019s the only dwarf planet in the inner solar system.", "Bright spots are sodium carbonate from brine.", "A day on Ceres is just 9 hours."], symbol: "\\u26B6", moons: 0, order: 10 },
  { id: "makemake", name: "Makemake", kind: "dwarf", emoji: "\\uD83E\\uDE90", color: "#fb923c", radiusKm: 715, diameterKm: 1430, massKg: "3.1\\u00D710^21", gravity: "0.57 m/s\\u00B2", orbitAu: 45.791, orbitPeriodDays: 112897, rotationHours: 22.83, axialTiltDeg: 29, composition: "Rock and ice", atmosphere: "Thin CH\\u2084 haze", temperatureC: { min: -243, max: -228 }, tagline: "Easter Island\\u2019s sky guardian.", description: "Makemake was discovered in 2005 \\u2014 one of the reasons Pluto was reclassified. It\\u2019s a bright, frozen world named after the creation deity of Rapa Nui. Surface ices of methane and nitrogen give it a reddish tint.", funFacts: ["It was discovered just after Easter \\u2014 hence the name.", "It has at least one moon, S/2015 (136472) 1.", "It lacks the heavy CH\\u2084 atmosphere Pluto has.", "It takes ~310 Earth years to orbit the Sun once."], symbol: "\\uD83E\\uDE90", moons: 1, order: 11 },
  { id: "haumea", name: "Haumea", kind: "dwarf", emoji: "\\uD83E\\uDE90", color: "#e5e5e5", radiusKm: 780, diameterKm: 1632, massKg: "4.0\\u00D710^21", gravity: "0.63 m/s\\u00B2", orbitAu: 43.116, orbitPeriodDays: 103468, rotationHours: 3.92, axialTiltDeg: 13.41, composition: "Rock with ice mantle", temperatureC: { min: -241, max: -223 }, tagline: "The spinning egg of the outer solar system.", description: "Haumea is one of the fastest-spinning large bodies in the solar system \\u2014 a day lasts under 4 hours. This rapid spin stretched it into an ellipsoid (egg-shape). It has a ring system and two moons, Hi\\u2019iaka and Namaka.", funFacts: ["Haumea completes a rotation in just 3.9 hours.", "It was the first dwarf planet found with rings.", "It\\u2019s shaped like a squashed rugby ball.", "A day on Haumea is shorter than a typical movie."], symbol: "\\uD83E\\uDE90", moons: 2, hasRings: true, ringColor: "#a3a3a3", order: 12 },
  { id: "eris", name: "Eris", kind: "dwarf", emoji: "\\uD83E\\uDE90", color: "#f1f5f9", radiusKm: 1163, diameterKm: 2326, massKg: "1.66\\u00D710^22", gravity: "0.82 m/s\\u00B2", orbitAu: 67.781, orbitPeriodDays: 203830, rotationHours: 25.9, axialTiltDeg: 78, composition: "Rock and ice", atmosphere: "Possible transient CH\\u2084", temperatureC: { min: -243, max: -228 }, tagline: "The world that dethroned Pluto.", description: "Eris\\u2019s discovery in 2005 forced astronomers to redefine \\u2018planet\\u2019. It\\u2019s slightly smaller than Pluto but ~27% more massive. It has one moon, Dysnomia, and an orbit so eccentric it spends 280 years beyond Pluto.", funFacts: ["Eris sparked the 2006 IAU planet definition debate.", "It\\u2019s the most distant known dwarf planet.", "Its surface is covered in methane ice \\u2014 blindingly white.", "Dysnomia, its moon, is named after Eris\\u2019s daughter, the spirit of lawlessness."], symbol: "\\uD83E\\uDE90", moons: 1, order: 13 }
];

export const BELT: SolarBody = {
  id: "asteroid-belt",
  name: "Asteroid Belt",
  kind: "belt",
  color: "#737373",
  radiusKm: 0,
  diameterKm: 0,
  massKg: "4% of the Moon",
  gravity: "negligible",
  orbitAu: 2.7,
  orbitPeriodDays: 0,
  rotationHours: 0,
  axialTiltDeg: 0,
  composition: "Rocky and metallic debris",
  temperatureC: { min: -100, max: 0 },
  tagline: "Millions of worlds between Mars and Jupiter.",
  description: "The asteroid belt is a region between Mars and Jupiter where millions of small rocky bodies orbit the Sun. Despite sci-fi depictions, it\\u2019s mostly empty \\u2014 spacecraft pass through with ease.",
  funFacts: [
    "It contains over 1.3 million known asteroids.",
    "Ceres accounts for 25% of its total mass.",
    "Total mass is just 4% of our Moon.",
    "It\\u2019s a failed planet that never coalesced \\u2014 Jupiter\\u2019s gravity prevented it."
  ],
  symbol: "\\u2022",
  order: 5.5
};

export const KUIPER: SolarBody = {
  id: "kuiper-belt",
  name: "Kuiper Belt",
  kind: "belt",
  color: "#a5b4fc",
  radiusKm: 0,
  diameterKm: 0,
  massKg: "~0.1 Earth masses",
  gravity: "negligible",
  orbitAu: 30,
  orbitPeriodDays: 0,
  rotationHours: 0,
  axialTiltDeg: 0,
  composition: "Icy bodies (water, methane, ammonia ices)",
  temperatureC: { min: -243, max: -223 },
  tagline: "The icy frontier beyond Neptune.",
  description: "Beyond Neptune lies the Kuiper Belt \\u2014 a doughnut-shaped region of icy bodies, home to Pluto, Haumea, Makemake, and Eris. It\\u2019s the source of many short-period comets.",
  funFacts: [
    "It contains billions of icy objects.",
    "It\\u2019s 20\\u00D7 wider than the asteroid belt.",
    "New Horizons is the only mission to explore it.",
    "Pluto is the most famous resident."
  ],
  symbol: "\\u2022",
  order: 9.5
};

export const OORT: SolarBody = {
  id: "oort-cloud",
  name: "Oort Cloud",
  kind: "belt",
  color: "#cbd5e1",
  radiusKm: 0,
  diameterKm: 0,
  massKg: "Unknown (~5 Earth masses estimated)",
  gravity: "negligible",
  orbitAu: 2000,
  orbitPeriodDays: 0,
  rotationHours: 0,
  axialTiltDeg: 0,
  composition: "Icy bodies, comets",
  temperatureC: { min: -268, max: -253 },
  tagline: "The solar system\\u2019s ghostly shell.",
  description: "The Oort Cloud is a hypothetical sphere of icy bodies surrounding the Sun at distances up to 100,000 AU. It\\u2019s the source of long-period comets \\u2014 visitors from the solar system\\u2019s edge.",
  funFacts: [
    "It may extend a quarter of the way to Proxima Centauri.",
    "It\\u2019s never been directly observed.",
    "Long-period comets come from here.",
    "Voyager 1 won\\u2019t reach it for ~300 years."
  ],
  symbol: "\\u2022",
  order: 14
};

export const ALL_BODIES: SolarBody[] = [SUN, ...BODIES, BELT, KUIPER, OORT];

export const PLANET_LIST = BODIES.filter((b) => b.kind === "planet");
export const DWARF_LIST = BODIES.filter((b) => b.kind === "dwarf");

// 3D scene scaling (NON-physical, for visualization)
export const SCENE = {
  sunSize: 4,
  bodyScale: 1.8,
  orbitScale: 0.9,
  distance: (au: number) => 8 + Math.pow(Math.max(au, 0.05), 0.55) * 3.5
};
`;

// Decode escape sequences
const decoded = bodies.replace(/\\\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16))).replace(/\\\\u([0-9a-fA-F]{4})\\\\u([0-9a-fA-F]{4})/g, (_, a, b) => String.fromCharCode(parseInt(a, 16)) + String.fromCharCode(parseInt(b, 16)));
fs.writeFileSync(p, decoded, "utf8");
console.log("wrote", decoded.length, "bytes");
