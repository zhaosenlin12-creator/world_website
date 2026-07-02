// Solar system bodies data (NASA-derived public domain facts).

export type BodyKind = "star" | "planet" | "dwarf" | "moon" | "asteroid" | "comet" | "belt";

export interface SolarBody {
  id: string;
  name: string;
  nameZh: string;
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
  compositionZh?: string;
  atmosphere?: string;
  atmosphereZh?: string;
  temperatureC: { min: number; max: number };
  tagline: string;
  taglineZh: string;
  description: string;
  descriptionZh: string;
  funFacts: string[];
  funFactsZh: string[];
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
  emoji: "☀️",
  color: "#fbbf24",
  radiusKm: 696340,
  diameterKm: 1392680,
  massKg: "1.989×10^30",
  gravity: "274 m/s²",
  orbitAu: 0,
  orbitPeriodDays: 0,
  rotationHours: 609.6,
  axialTiltDeg: 7.25,
  composition: "Hydrogen (73%), Helium (25%), trace elements",
  atmosphere: "Photosphere, chromosphere, corona",
  temperatureC: {
  min: 5500,
  max: 15000000
},
  tagline: "Our star — a 4.6-billion-year-old ball of fusion.",
  description: "The Sun is the heart of our solar system. Its gravity holds everything from the smallest dust mote to the gas giants in orbit. In its core, 600 million tons of hydrogen fuse into helium every second, releasing energy that travels 93 million miles to warm our world.",
  funFacts: ["Light from the Sun takes 8 minutes 20 seconds to reach Earth.", "The Sun accounts for 99.86% of the solar system’s mass.", "Its surface temperature is ~5,500°C — but the corona is 200× hotter.", "Every second, the Sun converts ~4 million tons of mass into energy."],
  symbol: "☉",
  order: 0,
  nameZh: "太阳",
  taglineZh: "我们的恒星——一颗 46 亿岁、持续核聚变的炽热球体。",
  descriptionZh: "太阳是我们太阳系的心脏。它的引力将一切——从最微小的尘埃到巨行星——束缚在轨道上。在其核心，每秒有 6 亿吨氢聚变成氦，释放的能量穿越 1.5 亿公里温暖我们的世界。",
  compositionZh: "氢（73%）、氦（25%）及微量元素",
  atmosphereZh: "光球层、色球层、日冕",
  funFactsZh: ["阳光需要 8 分 20 秒才能到达地球。", "太阳占整个太阳系质量的 99.86%。", "其表面温度约 5,500°C，但日冕比表面热 200 倍。", "太阳每秒把约 400 万吨质量转化为能量。"]
};

export const BODIES: SolarBody[] = [
  {
  id: "mercury",
  name: "Mercury",
  kind: "planet",
  emoji: "☿",
  color: "#a8a29e",
  radiusKm: 2440,
  diameterKm: 4879,
  massKg: "3.30×10^23",
  gravity: "3.7 m/s²",
  orbitAu: 0.387,
  orbitPeriodDays: 88,
  rotationHours: 1407.6,
  axialTiltDeg: 0.034,
  composition: "Iron core (~75% radius), silicate mantle",
  atmosphere: "Trace: O₂, Na, H₂, He",
  temperatureC: {
  min: -173,
  max: 427
},
  tagline: "The swift messenger of the gods.",
  description: "Mercury is the smallest planet in our solar system and the closest to the Sun. With virtually no atmosphere, its surface swings between blistering days and frigid nights. The MESSENGER and BepiColombo missions revealed a planet rich in iron and scarred by ancient impacts.",
  funFacts: ["A single Mercury day lasts ~176 Earth days — twice its year.", "Despite being closest to the Sun, Venus is hotter.", "Craters on Mercury are named after artists, musicians, and authors.", "Ice may hide in permanently shadowed polar craters."],
  symbol: "☿",
  moons: 0,
  order: 1,
  nameZh: "水星",
  taglineZh: "众神的迅捷信使。",
  descriptionZh: "水星是太阳系最小的行星，也是离太阳最近的一颗。几乎没有大气，它的表面在灼热的白昼与严寒的黑夜间剧烈摆荡。MESSENGER 与 BepiColombo 揭示了这颗富含铁、伤痕累累的古老世界。",
  compositionZh: "铁核（占半径约 75%）、硅酸盐地幔",
  atmosphereZh: "痕量：O₂、Na、H₂、He",
  funFactsZh: ["水星上一天约 176 地球日——比它一年还长一倍。", "尽管离太阳最近，金星却更热。", "水星上的环形山以艺术家、音乐家和作家命名。", "永久阴影的极地环形山中可能藏有水冰。"]
},
  {
  id: "venus",
  name: "Venus",
  kind: "planet",
  emoji: "♀",
  color: "#fcd34d",
  radiusKm: 6052,
  diameterKm: 12104,
  massKg: "4.87×10^24",
  gravity: "8.87 m/s²",
  orbitAu: 0.723,
  orbitPeriodDays: 225,
  rotationHours: -5832.5,
  axialTiltDeg: 177.4,
  composition: "Iron core, rocky mantle, CO₂ atmosphere",
  atmosphere: "96% CO₂, 3.5% N₂, sulfuric acid clouds",
  temperatureC: {
  min: 462,
  max: 471
},
  tagline: "Earth’s hellish twin.",
  description: "Venus is the hottest planet in the solar system thanks to a runaway greenhouse atmosphere of carbon dioxide. Its surface pressure is 92× Earth’s, and its clouds rain sulfuric acid. Radar mapping by Magellan revealed volcanoes, vast plains, and a young, restless surface.",
  funFacts: ["A day on Venus is longer than its year.", "It rotates backwards — the Sun rises in the west.", "Surface temps (~465°C) melt lead.", "It’s the brightest planet in our night sky."],
  symbol: "♀",
  moons: 0,
  order: 2,
  nameZh: "金星",
  taglineZh: "地球的地狱姊妹。",
  descriptionZh: "金星是太阳系最炽热的行星——这要归功于失控的二氧化碳温室大气。其表面气压是地球的 92 倍，云层降下的是硫酸雨。麦哲伦号的雷达测绘揭示了火山、广袤平原与年轻而躁动的地表。",
  compositionZh: "铁核、岩质地幔、CO₂ 大气",
  atmosphereZh: "96% CO₂、3.5% N₂、硫酸云",
  funFactsZh: ["金星上一天比一年还长。", "它自转方向相反——太阳从西边升起。", "地表温度约 465°C，足以让铅熔化。", "它是我们夜空中最明亮的行星。"]
},
  {
  id: "earth",
  name: "Earth",
  kind: "planet",
  emoji: "🌍",
  color: "#3b82f6",
  radiusKm: 6371,
  diameterKm: 12742,
  massKg: "5.97×10^24",
  gravity: "9.81 m/s²",
  orbitAu: 1,
  orbitPeriodDays: 365.25,
  rotationHours: 23.93,
  axialTiltDeg: 23.44,
  composition: "Iron core, silicate mantle, liquid water oceans",
  atmosphere: "78% N₂, 21% O₂, 1% trace",
  temperatureC: {
  min: -89,
  max: 58
},
  tagline: "The pale blue dot — home.",
  description: "Earth is the only world we know that hosts life. Liquid water, a magnetic field, plate tectonics, and an oxygen-rich atmosphere combine to make a planet of storms, oceans, forests, and us. From orbit, it’s the brightest thing in the lunar sky.",
  funFacts: ["Earth is not a perfect sphere — it bulges at the equator.", "The Moon stabilizes our axial tilt and climate.", "71% of the surface is ocean.", "Our magnetic field deflects solar wind."],
  symbol: "⊕",
  moons: 1,
  order: 3,
  nameZh: "地球",
  taglineZh: "那颗淡蓝的圆点——家园。",
  descriptionZh: "地球是已知唯一孕育生命的世界。液态水、磁场、板块构造与富含氧气的大气共同造就了这颗充满风暴、海洋、森林与人类的行星。从轨道俯瞰，它是月球天空中最明亮的天体。",
  compositionZh: "铁核、硅酸盐地幔、液态水海洋",
  atmosphereZh: "78% N₂、21% O₂、1% 其他",
  funFactsZh: ["地球并非完美球体——赤道处微微鼓起。", "月球稳定着我们的轴倾角与气候。", "地球表面 71% 被海洋覆盖。", "我们的磁场偏转了太阳风。"]
},
  {
  id: "mars",
  name: "Mars",
  kind: "planet",
  emoji: "🌲",
  color: "#dc2626",
  radiusKm: 3389,
  diameterKm: 6779,
  massKg: "6.42×10^23",
  gravity: "3.71 m/s²",
  orbitAu: 1.524,
  orbitPeriodDays: 687,
  rotationHours: 24.62,
  axialTiltDeg: 25.19,
  composition: "Iron core, silicate mantle, iron oxide surface",
  atmosphere: "95% CO₂, 3% N₂, 1.6% Ar",
  temperatureC: {
  min: -143,
  max: 35
},
  tagline: "The red frontier.",
  description: "Mars has captured human imagination for centuries. Today we know it once had rivers, lakes, and perhaps oceans. The Perseverance and Curiosity rovers are actively searching for signs of ancient microbial life, while future missions plan to bring samples back to Earth.",
  funFacts: ["Olympus Mons is the tallest volcano in the solar system (22 km).", "A Martian day is just 37 minutes longer than Earth’s.", "Mars has two potato-shaped moons: Phobos and Deimos.", "Dust storms can engulf the entire planet for months."],
  symbol: "♂",
  moons: 2,
  order: 4,
  nameZh: "火星",
  taglineZh: "红色的边疆。",
  descriptionZh: "火星数个世纪以来一直吸引着人类的想象。今天我们知道它曾经拥有河流、湖泊，也许还有海洋。毅力号与好奇号正在积极寻找古代微生物生命的迹象，而未来的任务计划将样本带回地球。",
  compositionZh: "铁核、硅酸盐地幔、氧化铁表面",
  atmosphereZh: "95% CO₂、3% N₂、1.6% Ar",
  funFactsZh: ["奥林帕斯山是太阳系最高的火山（22 公里）。", "火星的一天仅比地球长 37 分钟。", "火星有两颗土豆形状的卫星：火卫一与火卫二。", "沙尘暴可吞没整颗行星长达数月。"]
},
  {
  id: "jupiter",
  name: "Jupiter",
  kind: "planet",
  emoji: "♃",
  color: "#f59e0b",
  radiusKm: 69911,
  diameterKm: 139822,
  massKg: "1.90×10^27",
  gravity: "24.79 m/s²",
  orbitAu: 5.203,
  orbitPeriodDays: 4333,
  rotationHours: 9.93,
  axialTiltDeg: 3.13,
  composition: "Hydrogen, helium, trace gases",
  atmosphere: "90% H₂, 10% He, traces of CH₄, NH₃, H₂O",
  temperatureC: {
  min: -145,
  max: -108
},
  tagline: "King of the planets.",
  description: "Jupiter is the largest planet in our solar system—more massive than all the others combined. Its Great Red Spot is a storm that has raged for at least 350 years. With at least 95 moons, including the icy Europa, Jupiter is a mini solar system of its own.",
  funFacts: ["Jupiter’s Great Red Spot is shrinking but has lasted 350+ years.", "Jupiter rotates once every 10 hours — the fastest of any planet.", "Its moon Europa may hide a subsurface ocean.", "Jupiter’s gravity shields inner planets from some comets."],
  symbol: "♃",
  moons: 95,
  order: 5,
  nameZh: "木星",
  taglineZh: "行星之王。",
  descriptionZh: "木星是太阳系最大的行星——质量超过所有其他行星的总和。它的大红斑是一场已持续至少 350 年的风暴。至少拥有 95 颗卫星，包括冰封的木卫二欧罗巴，木星本身就像一个微缩的太阳系。",
  compositionZh: "氢、氦、痕量气体",
  atmosphereZh: "90% H₂、10% He、痕量 CH₄、NH₃、H₂O",
  funFactsZh: ["木星的大红斑正在缩小，但已持续 350 年以上。", "木星每 10 小时自转一圈——是行星中最快的。", "它的卫星木卫二可能藏有地下海洋。", "木星的引力为内行星遮挡了部分彗星。"]
},
  {
  id: "saturn",
  name: "Saturn",
  kind: "planet",
  emoji: "♄",
  color: "#fbbf24",
  radiusKm: 58232,
  diameterKm: 116464,
  massKg: "5.68×10^26",
  gravity: "10.44 m/s²",
  orbitAu: 9.537,
  orbitPeriodDays: 10759,
  rotationHours: 10.7,
  axialTiltDeg: 26.73,
  composition: "Hydrogen, helium, trace gases",
  hasRings: true,
  ringColor: "#fcd34d",
  atmosphere: "96% H₂, 3% He",
  temperatureC: {
  min: -178,
  max: -138
},
  tagline: "The jewel of the solar system.",
  description: "Saturn’s iconic ring system is made of billions of particles of ice and rock, ranging from grains to house-sized boulders. The planet itself is so light it would float in water (if you found a bathtub big enough). Its moon Titan has lakes of liquid methane.",
  funFacts: ["Saturn’s rings are only ~10 meters thick on average.", "Saturn has 146 known moons — the most of any planet.", "Titan is the only other world with stable surface liquids.", "Saturn’s density is less than water’s."],
  symbol: "♄",
  moons: 146,
  order: 6,
  nameZh: "土星",
  taglineZh: "太阳系的宝石。",
  descriptionZh: "土星标志性的环系由数十亿颗冰与岩石颗粒组成，从沙粒大小到房屋大小的巨石都有。这颗行星本身非常轻，能浮在水面上（如果你找到一个足够大的浴缸）。它的卫星泰坦拥有液态甲烷的湖泊。",
  compositionZh: "氢、氦、痕量气体",
  atmosphereZh: "96% H₂、3% He",
  funFactsZh: ["土星环的平均厚度仅约 10 米。", "土星有 146 颗已知卫星——是行星中最多的。", "泰坦是唯一拥有稳定地表液体的其他世界。", "土星的密度比水还低。"]
},
  {
  id: "uranus",
  name: "Uranus",
  kind: "planet",
  emoji: "♅",
  color: "#7dd3fc",
  radiusKm: 25362,
  diameterKm: 50724,
  massKg: "8.68×10^25",
  gravity: "8.69 m/s²",
  orbitAu: 19.191,
  orbitPeriodDays: 30687,
  rotationHours: -17.24,
  axialTiltDeg: 97.77,
  composition: "Hydrogen, helium, water, methane",
  hasRings: true,
  ringColor: "#a3a3a3",
  atmosphere: "82% H₂, 15% He, 2% CH₄",
  temperatureC: {
  min: -224,
  max: -197
},
  tagline: "The tilted ice giant.",
  description: "Uranus rolls on its side with an axial tilt of 98 degrees, likely due to an ancient cataclysmic collision. This means its seasons are extreme: 21 years of sunlight followed by 21 years of darkness at the poles. Its blue-green color comes from methane in the upper atmosphere.",
  funFacts: ["Uranus rotates on its side, like a rolling ball.", "It’s the coldest planetary atmosphere in the solar system.", "Uranus has 13 faint rings.", "It was the first planet discovered with a telescope (1781)."],
  symbol: "♅",
  moons: 28,
  order: 7,
  nameZh: "天王星",
  taglineZh: "侧倾的冰巨星。",
  descriptionZh: "天王星侧向自转，轴倾角达 98 度，可能源于一次古老的灾难性碰撞。这意味着它的季节极为极端：两极地区会出现 21 年阳光接着 21 年黑暗。它的蓝绿色来自上层大气中的甲烷。",
  compositionZh: "氢、氦、水、甲烷",
  atmosphereZh: "82% H₂、15% He、2% CH₄",
  funFactsZh: ["天王星侧向自转，像滚动的球。", "它拥有太阳系最冷的行星大气。", "天王星有 13 条暗淡的环。", "它是第一颗用望远镜发现的行星（1781 年）。"]
},
  {
  id: "neptune",
  name: "Neptune",
  kind: "planet",
  emoji: "♆",
  color: "#3b82f6",
  radiusKm: 24622,
  diameterKm: 49244,
  massKg: "1.02×10^26",
  gravity: "11.15 m/s²",
  orbitAu: 30.069,
  orbitPeriodDays: 60190,
  rotationHours: 16.11,
  axialTiltDeg: 28.32,
  composition: "Hydrogen, helium, water, methane",
  atmosphere: "80% H₂, 19% He, 1% CH₄",
  temperatureC: {
  min: -218,
  max: -201
},
  tagline: "The windswept world.",
  description: "Neptune is the windiest planet, with supersonic gusts reaching 2,100 km/h. Despite being farther from the Sun than Uranus, it’s slightly warmer—an unexplained puzzle. Its largest moon, Triton, orbits backwards and is likely a captured Kuiper Belt object.",
  funFacts: ["Neptune’s winds are the fastest in the solar system (2,100 km/h).", "It was discovered by mathematical prediction in 1846.", "Triton orbits Neptune backwards and is geologically active.", "A Neptune year lasts 165 Earth years."],
  symbol: "♆",
  moons: 16,
  order: 8,
  nameZh: "海王星",
  taglineZh: "风之世界。",
  descriptionZh: "海王星是风力最强的行星，超音速阵风可达 2,100 公里/小时。尽管它比天王星更远离太阳，却稍微温暖——这是一个未解之谜。它最大的卫星海卫一逆向公转，可能是被捕获的柯伊伯带天体。",
  compositionZh: "氢、氦、水、甲烷",
  atmosphereZh: "80% H₂、19% He、1% CH₄",
  funFactsZh: ["海王星的风速是太阳系中最快的（2,100 公里/小时）。", "它于 1846 年通过数学预测被发现的。", "海卫一逆向公转海王星，且地质活动活跃。", "一个海王星年等于 165 个地球年。"]
},
  {
  id: "pluto",
  name: "Pluto",
  kind: "dwarf",
  emoji: "♇",
  color: "#d4d4d8",
  radiusKm: 1188,
  diameterKm: 2376,
  massKg: "1.31×10^22",
  gravity: "0.62 m/s²",
  orbitAu: 39.482,
  orbitPeriodDays: 90560,
  rotationHours: 153.3,
  axialTiltDeg: 122.53,
  composition: "Rock and ice",
  atmosphere: "Thin N₂, CH₄, CO",
  temperatureC: {
  min: -240,
  max: -218
},
  tagline: "The underdog of the outer solar system.",
  description: "Pluto was reclassified as a dwarf planet in 2006, but it remains a complex world with mountains of water ice, nitrogen glaciers, and a heart-shaped plain named Tombaugh Regio. New Horizons gave us our first close-up in 2015.",
  funFacts: ["Pluto has a heart-shaped glacier called Sputnik Planitia.", "A day on Pluto is 6.4 Earth days.", "It orbits in a 17-degree tilt from the ecliptic.", "Pluto has 5 known moons, the largest being Charon."],
  symbol: "♇",
  moons: 5,
  order: 9,
  nameZh: "冥王星",
  taglineZh: "外太阳系的逆袭者。",
  descriptionZh: "冥王星在 2006 年被重新归类为矮行星，但它仍是一个复杂的世界，拥有水冰山、氮冰川和名为汤博区的心形平原。新视野号于 2015 年给了我们第一次近距离观测。",
  compositionZh: "岩石与冰",
  atmosphereZh: "稀薄的 N₂、CH₄、CO",
  funFactsZh: ["冥王星有一个心形冰川，名为斯普特尼克平原。", "冥王星上一天等于 6.4 个地球日。", "它的轨道与黄道面倾角 17 度。", "冥王星有 5 颗已知卫星，最大的是卡戎。"]
},
  {
  id: "ceres",
  name: "Ceres",
  kind: "dwarf",
  emoji: "⚳",
  color: "#a8a29e",
  radiusKm: 473,
  diameterKm: 940,
  massKg: "9.39×10^20",
  gravity: "0.27 m/s²",
  orbitAu: 2.767,
  orbitPeriodDays: 1682,
  rotationHours: 9.07,
  axialTiltDeg: 4,
  composition: "Rock and ice",
  temperatureC: {
  min: -143,
  max: -38
},
  tagline: "Queen of the asteroid belt.",
  description: "Ceres is the largest object in the asteroid belt and the closest dwarf planet. Its bright spots in Occator Crater are salt deposits from a brine that once reached the surface. NASA’s Dawn spacecraft orbited it from 2015 to 2018.",
  funFacts: ["Ceres contains a third of the asteroid belt’s mass.", "It has bright salt deposits in Occator Crater.", "Ceres may have a subsurface ocean.", "It was the first dwarf planet visited by a spacecraft."],
  symbol: "⚳",
  moons: 0,
  order: 10,
  nameZh: "谷神星",
  taglineZh: "小行星带的女王。",
  descriptionZh: "谷神星是小行星带中最大的天体，也是距离地球最近的矮行星。位于 Occator 撞击坑的亮斑是曾到达地表的盐水的沉积物。NASA 的曙光号探测器于 2015 至 2018 年绕其飞行。",
  compositionZh: "岩石与冰",
  funFactsZh: ["谷神星包含小行星带质量的三分之一。", "它的 Occator 撞击坑中有亮盐沉积。", "谷神星可能有地下海洋。", "它是首颗被航天器造访的矮行星。"]
},
  {
  id: "makemake",
  name: "Makemake",
  kind: "dwarf",
  emoji: "🪐",
  color: "#e5e5e5",
  radiusKm: 715,
  diameterKm: 1430,
  massKg: "3.1×10^21",
  gravity: "0.57 m/s²",
  orbitAu: 45.791,
  orbitPeriodDays: 111867,
  rotationHours: 22.83,
  axialTiltDeg: 29,
  composition: "Rock and ice",
  temperatureC: {
  min: -243,
  max: -228
},
  tagline: "The Easterbunny of the outer solar system.",
  description: "Makemake was discovered just after Easter in 2005 — one of the reasons Pluto was reclassified. It’s a bright, frozen world named after the creation deity of Rapa Nui. Surface ices of methane and nitrogen give it a reddish tint.",
  funFacts: ["It was discovered just after Easter — hence the name.", "It has at least one moon, S/2015 (136472) 1.", "It lacks the heavy CH₄ atmosphere Pluto has.", "It takes ~310 Earth years to orbit the Sun once."],
  symbol: "🪐",
  moons: 1,
  order: 11,
  nameZh: "鸟神星",
  taglineZh: "复活节兔子之名的外太阳系。",
  descriptionZh: "鸟神星于 2005 年复活节后不久被发现——这也是冥王星被重新分类的原因之一。它是一个明亮的冰冻世界，以拉帕努伊的创世之神命名。表面上的甲烷与氮冰赋予其微红色调。",
  compositionZh: "岩石与冰",
  funFactsZh: ["它在复活节后被发现——因此得名。", "它至少有一颗卫星 S/2015 (136472) 1。", "它不像冥王星那样拥有浓厚的 CH₄ 大气。", "它绕太阳一圈约需 310 个地球年。"]
},
  {
  id: "haumea",
  name: "Haumea",
  kind: "dwarf",
  emoji: "🪐",
  color: "#e5e5e5",
  radiusKm: 780,
  diameterKm: 1632,
  massKg: "4.0×10^21",
  gravity: "0.63 m/s²",
  orbitAu: 43.116,
  orbitPeriodDays: 103468,
  rotationHours: 3.92,
  axialTiltDeg: 13.41,
  composition: "Rock with ice mantle",
  temperatureC: {
  min: -241,
  max: -223
},
  tagline: "The spinning egg of the outer solar system.",
  description: "Haumea is one of the fastest-spinning large bodies in the solar system — a day lasts under 4 hours. This rapid spin stretched it into an ellipsoid (egg-shape). It has a ring system and two moons, Hi’iaka and Namaka.",
  funFacts: ["Haumea completes a rotation in just 3.9 hours.", "It was the first dwarf planet found with rings.", "It’s shaped like a squashed rugby ball.", "A day on Haumea is shorter than a typical movie."],
  symbol: "🪐",
  moons: 2,
  hasRings: true,
  ringColor: "#a3a3a3",
  order: 12,
  nameZh: "妊神星",
  taglineZh: "外太阳系旋转的鸡蛋。",
  descriptionZh: "妊神星是太阳系自转最快的大型天体之一——一天不到 4 小时。这种快速自转让它被拉伸成椭球体（鸡蛋形）。它拥有一个环系和两颗卫星：Hi’iaka 与 Namaka。",
  compositionZh: "岩石与冰质地幔",
  funFactsZh: ["妊神星自转一周仅 3.9 小时。", "它是首颗被发现的带环矮行星。", "它的形状像被压扁的橄榄球。", "妊神星上一天比一部电影还短。"]
},
  {
  id: "eris",
  name: "Eris",
  kind: "dwarf",
  emoji: "🪐",
  color: "#f1f5f9",
  radiusKm: 1163,
  diameterKm: 2326,
  massKg: "1.66×10^22",
  gravity: "0.82 m/s²",
  orbitAu: 67.781,
  orbitPeriodDays: 203830,
  rotationHours: 25.9,
  axialTiltDeg: 78,
  composition: "Rock and ice",
  atmosphere: "Possible transient CH₄",
  temperatureC: {
  min: -243,
  max: -228
},
  tagline: "The world that dethroned Pluto.",
  description: "Eris’s discovery in 2005 forced astronomers to redefine ‘planet’. It’s slightly smaller than Pluto but ~27% more massive. It has one moon, Dysnomia, and an orbit so eccentric it spends 280 years beyond Pluto.",
  funFacts: ["Eris sparked the 2006 IAU planet definition debate.", "It’s the most distant known dwarf planet.", "Its surface is covered in methane ice — blindingly white.", "Dysnomia, its moon, is named after Eris’s daughter, the spirit of lawlessness."],
  symbol: "🪐",
  moons: 1,
  order: 13,
  nameZh: "阋神星",
  taglineZh: "让冥王星被降级的世界。",
  descriptionZh: "阋神星于 2005 年的发现迫使天文学家重新定义“行星”。它比冥王星略小但质量多约 27%。它有一颗卫星 Dysnomia，轨道偏心率极大，在冥王星之外度过 280 年。",
  compositionZh: "岩石与冰",
  atmosphereZh: "可能存在短暂的 CH₄",
  funFactsZh: ["阋神星引发了 2006 年 IAU 行星定义的争论。", "它是已知最远的矮行星。", "它的表面被甲烷冰覆盖——白得耀眼。", "它的卫星 Dysnomia 以阋神星之女、无序之神命名。"]
}
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
  temperatureC: {
  min: -100,
  max: 0
},
  tagline: "Millions of worlds between Mars and Jupiter.",
  description: "The asteroid belt is a region of millions of rocky bodies between Mars and Jupiter. Despite the sci-fi image, it’s mostly empty space—a spacecraft can pass through safely. The largest object, Ceres, holds about a third of the belt’s total mass.",
  funFacts: ["The total mass of the belt is only ~4% of the Moon.", "Ceres holds about a third of the belt’s mass.", "The average distance between asteroids is millions of km.", "It’s a failed planet that never coalesced — Jupiter’s gravity prevented it."],
  nameZh: "小行星带",
  taglineZh: "火星与木星之间的数百万世界。",
  descriptionZh: "小行星带是火星与木星之间由数百万个岩石天体组成的区域。尽管科幻电影中有不同印象，但这里大部分是空旷的空间——航天器可以安全通过。最大的天体谷神星约占小行星带总质量的三分之一。",
  compositionZh: "岩石与金属碎片",
  funFactsZh: ["小行星带的总质量约为月球的 4%。", "谷神星约占小行星带质量的三分之一。", "小行星之间的平均距离是数百万公里。", "它是一颗未能聚合的失败行星——木星的引力阻止了它。"]
};

export const KUIPER: SolarBody = {
  id: "kuiper-belt",
  name: "Kuiper Belt",
  kind: "belt",
  color: "#94a3b8",
  radiusKm: 0,
  diameterKm: 0,
  massKg: "~0.1 Earth masses",
  gravity: "negligible",
  orbitAu: 42,
  orbitPeriodDays: 0,
  rotationHours: 0,
  axialTiltDeg: 0,
  composition: "Icy bodies (water, methane, ammonia)",
  temperatureC: {
  min: -243,
  max: -223
},
  tagline: "The frozen frontier of the planets.",
  description: "Beyond Neptune lies the Kuiper Belt—a doughnut-shaped region of icy bodies. It’s the source of many short-period comets and home to dwarf planets like Pluto, Haumea, Makemake, and Eris. New Horizons is the only spacecraft to have visited it.",
  funFacts: ["It contains hundreds of thousands of icy bodies larger than 100 km.", "Pluto is the best-known Kuiper Belt object.", "It’s 20 to 200 times more massive than the asteroid belt.", "The Kuiper Belt’s outer edge marks the true end of the solar system."],
  nameZh: "柯伊伯带",
  taglineZh: "行星的冰封边疆。",
  descriptionZh: "海王星之外是柯伊伯带——一个甜甜圈形状的冰冷天体区域。它是许多短周期彗星的源头，也是冥王星、妊神星、鸟神星和阋神星等矮行星的家园。新视野号是唯一造访过它的航天器。",
  compositionZh: "冰质天体（水、甲烷、氨）",
  funFactsZh: ["它包含数十万个直径超过 100 公里的冰质天体。", "冥王星是最著名的柯伊伯带天体。", "它的质量是小行星带的 20 至 200 倍。", "柯伊伯带的外缘标志着太阳系的真正尽头。"]
};

export const OORT: SolarBody = {
  id: "oort-cloud",
  name: "Oort Cloud",
  kind: "belt",
  color: "#cbd5e1",
  radiusKm: 0,
  diameterKm: 0,
  massKg: "~5 Earth masses (est.)",
  gravity: "negligible",
  orbitAu: 20000,
  orbitPeriodDays: 0,
  rotationHours: 0,
  axialTiltDeg: 0,
  composition: "Icy bodies",
  temperatureC: {
  min: -268,
  max: -253
},
  tagline: "The solar system’s ghost shell.",
  description: "The Oort Cloud is a hypothetical spherical shell of icy objects that may extend out to 100,000 AU—nearly halfway to the nearest star. It’s the source of long-period comets and the outermost boundary of the Sun’s gravitational influence.",
  funFacts: ["No spacecraft has ever reached the Oort Cloud.", "It may contain trillions of objects.", "Long-period comets come from the Oort Cloud.", "It could extend out to 100,000 AU."],
  nameZh: "奥尔特云",
  taglineZh: "太阳系的幽灵外壳。",
  descriptionZh: "奥尔特云是一个假想的球形冰质天体壳层，可能延伸到 10 万天文单位——几乎到达最近的恒星。它是长周期彗星的源头，也是太阳引力影响的最外层边界。",
  compositionZh: "冰质天体",
  funFactsZh: ["尚无航天器抵达过奥尔特云。", "它可能包含数万亿个天体。", "长周期彗星来自奥尔特云。", "它可能延伸到 10 万天文单位。"]
};

export const ALL_BODIES: SolarBody[] = [SUN, ...BODIES, BELT, KUIPER, OORT];

// 3D scene scaling (NON-physical, for visualization)
export const SCENE = {
  sunSize: 4.2,
  bodyScale: 1.9,
  orbitScale: 1.0,
  // 轨道间距对数重映射:内圈/外圈都展开,不再互相挤压
  // Mercury 0.39 -> 11.3  Venus 0.72 -> 12.5  Earth 1.00 -> 13.0
  // Mars   1.52 -> 13.7  Jupiter 5.20 -> 17.4 Saturn 9.58 -> 19.6
  // Uranus 19.20-> 22.5  Neptune 30.10-> 24.5
  distance: (au: number) => 8.5 + Math.log(1 + Math.max(au, 0.05)) * 6.4
};
