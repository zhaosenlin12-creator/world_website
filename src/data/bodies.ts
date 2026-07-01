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
  emoji: "\u2600\uFE0F",
  color: "#fbbf24",
  radiusKm: 696340,
  diameterKm: 1392680,
  massKg: "1.989\u00D710^30",
  gravity: "274 m/s\u00B2",
  orbitAu: 0,
  orbitPeriodDays: 0,
  rotationHours: 609.6,
  axialTiltDeg: 7.25,
  composition: "Hydrogen (73%), Helium (25%), trace elements",
  atmosphere: "Photosphere, chromosphere, corona",
  temperatureC: { min: 5500, max: 15000000 },
  tagline: "Our star \u2014 a 4.6-billion-year-old ball of fusion.",
  description: "The Sun is the heart of our solar system. Its gravity holds everything from the smallest dust mote to the gas giants in orbit. In its core, 600 million tons of hydrogen fuse into helium every second, releasing energy that travels 93 million miles to warm our world.",
  funFacts: [
    "Light from the Sun takes 8 minutes 20 seconds to reach Earth.",
    "The Sun accounts for 99.86% of the solar system\u2019s mass.",
    "Its surface temperature is ~5,500\u00B0C \u2014 but the corona is 200\u00D7 hotter.",
    "Every second, the Sun converts ~4 million tons of mass into energy."
  ],
  symbol: "\u2609",
  order: 0, nameZh: "太阳", taglineZh: "我们的恒星——一颗 46 亿岁、持续核聚变的炽热球体。", descriptionZh: "太阳是我们太阳系的心脏。它的引力将一切——从最微小的尘埃到巨行星——束缚在轨道上。在其核心，每秒有 6 亿吨氢聚变成氦，释放的能量穿越 1.5 亿公里温暖我们的世界。", compositionZh: "氢（73%）、氦（25%）及微量元素", atmosphereZh: "光球层、色球层、日冕", funFactsZh: ["太阳光需要 8 分 20 秒才能到达地球。", "太阳占整个太阳系质量的 99.86%。", "其表面温度约 5,500°C，但日冕比表面热 200 倍。", "太阳每秒把约 400 万吨质量转化为能量。"]
};

export const BODIES: SolarBody[] = [
  { id: "mercury", name: "Mercury", kind: "planet", emoji: "\u263F", color: "#a8a29e", radiusKm: 2440, diameterKm: 4879, massKg: "3.30\u00D710^23", gravity: "3.7 m/s\u00B2", orbitAu: 0.387, orbitPeriodDays: 88, rotationHours: 1407.6, axialTiltDeg: 0.034, composition: "Iron core (~75% radius), silicate mantle", atmosphere: "Trace: O\u2082, Na, H\u2082, He", temperatureC: { min: -173, max: 427 }, tagline: "The swift messenger of the gods.", description: "Mercury is the smallest planet in our solar system and the closest to the Sun. With virtually no atmosphere, its surface swings between blistering days and frigid nights. The MESSENGER and BepiColombo missions revealed a planet rich in iron and scarred by ancient impacts.", funFacts: ["A single Mercury day lasts ~176 Earth days \u2014 twice its year.", "Despite being closest to the Sun, Venus is hotter.", "Craters on Mercury are named after artists, musicians, and authors.", "Ice may hide in permanently shadowed polar craters."], symbol: "\u263F", moons: 0, order: 1, nameZh: "水星", taglineZh: "众神的迅捷信使。", descriptionZh: "水星是太阳系最小的行星，也是离太阳最近的一颗。几乎没有大气，它的表面在灼热的白昼与严寒的黑夜间剧烈摆荡。MESSENGER 与 BepiColombo 揭示了这颗富含铁、伤痕累累的古老世界。", compositionZh: "铁核（占半径约 75%）、硅酸盐地幔", atmosphereZh: "痕量：O₂、Na、H₂、He", funFactsZh: ["水星上一天约 176 地球日——比它一年还长一倍。", "尽管离太阳最近，金星却更热。", "水星上的环形山以艺术家、音乐家和作家命名。", "永久阴影的极地环形山中可能藏有水冰。"] },
  { id: "venus", name: "Venus", kind: "planet", emoji: "\u2640", color: "#fcd34d", radiusKm: 6052, diameterKm: 12104, massKg: "4.87\u00D710^24", gravity: "8.87 m/s\u00B2", orbitAu: 0.723, orbitPeriodDays: 225, rotationHours: -5832.5, axialTiltDeg: 177.4, composition: "Iron core, rocky mantle, CO\u2082 atmosphere", atmosphere: "96% CO\u2082, 3.5% N\u2082, sulfuric acid clouds", temperatureC: { min: 462, max: 471 }, tagline: "Earth\u2019s hellish twin.", description: "Venus is the hottest planet in the solar system thanks to a runaway greenhouse atmosphere of carbon dioxide. Its surface pressure is 92\u00D7 Earth\u2019s, and its clouds rain sulfuric acid. Radar mapping by Magellan revealed volcanoes, vast plains, and a young, restless surface.", funFacts: ["A day on Venus is longer than its year.", "It rotates backwards \u2014 the Sun rises in the west.", "Surface temps (~465\u00B0C) melt lead.", "It\u2019s the brightest planet in our night sky."], symbol: "\u2640", moons: 0, order: 2, nameZh: "金星", taglineZh: "地球的地狱姊妹。", descriptionZh: "金星是太阳系最炽热的行星——这要归功于失控的二氧化碳温室大气。其表面气压是地球的 92 倍，云层降下的是硫酸雨。麦哲伦号的雷达测绘揭示了火山、广袤平原与年轻而躁动的地表。", compositionZh: "铁核、岩质地幔、CO₂ 大气", atmosphereZh: "96% CO₂、3.5% N₂、硫酸云", funFactsZh: ["金星上一天比一年还长。", "它自转方向相反——太阳从西边升起。", "地表温度约 465°C，足以让铅熔化。", "它是我们夜空中最明亮的行星。"] },
  { id: "earth", name: "Earth", kind: "planet", emoji: "\uD83C\uDF0D", color: "#3b82f6", radiusKm: 6371, diameterKm: 12742, massKg: "5.97\u00D710^24", gravity: "9.81 m/s\u00B2", orbitAu: 1.0, orbitPeriodDays: 365.25, rotationHours: 23.93, axialTiltDeg: 23.44, composition: "Iron core, silicate mantle, liquid water oceans", atmosphere: "78% N\u2082, 21% O\u2082, 1% trace", temperatureC: { min: -89, max: 58 }, tagline: "The pale blue dot \u2014 home.", description: "Earth is the only world we know that hosts life. Liquid water, a magnetic field, plate tectonics, and an oxygen-rich atmosphere combine to make a planet of storms, oceans, forests, and us. From orbit, it\u2019s the brightest thing in the lunar sky.", funFacts: ["Earth is not a perfect sphere \u2014 it bulges at the equator.", "The Moon stabilizes our axial tilt and climate.", "71% of the surface is ocean.", "Our magnetic field deflects solar wind."], symbol: "\u2295", moons: 1, order: 3, nameZh: "地球", taglineZh: "那颗淡蓝的圆点——家园。", descriptionZh: "地球是已知唯一孕育生命的世界。液态水、磁场、板块构造与富含氧气的大气共同造就了这颗充满风暴、海洋、森林与人类的行星。从轨道俯瞰，它是月球天空中最明亮的天体。", compositionZh: "铁核、硅酸盐地幔、液态水海洋", atmosphereZh: "78% N₂、21% O₂、1% 其他", funFactsZh: ["地球并非完美球体——赤道处微微鼓起。", "月球稳定着我们的轴倾角与气候。", "地球表面 71% 被海洋覆盖。", "我们的磁场偏转了太阳风。"] },
  { id: "mars", name: "Mars", kind: "planet", emoji: "\u2642", color: "#dc2626", radiusKm: 3390, diameterKm: 6779, massKg: "6.42\u00D710^23", gravity: "3.71 m/s\u00B2", orbitAu: 1.524, orbitPeriodDays: 687, rotationHours: 24.62, axialTiltDeg: 25.19, composition: "Iron core, basaltic mantle, iron-oxide surface", atmosphere: "95% CO\u2082, 3% N\u2082, 1.6% Ar", temperatureC: { min: -87, max: -5 }, tagline: "The red planet \u2014 our next frontier.", description: "Mars has captured human imagination for centuries. With seasons, polar caps, and the largest volcano in the solar system (Olympus Mons), it\u2019s a cold desert world with a thin atmosphere. Rovers Perseverance, Curiosity, and Zhurong are actively exploring its surface.", funFacts: ["Olympus Mons is 22 km tall \u2014 2.5\u00D7 Everest.", "Dust storms can engulf the entire planet.", "A day on Mars is only 37 minutes longer than Earth\u2019s.", "Frozen water lies beneath its surface."], symbol: "\u2642", moons: 2, order: 4, nameZh: "火星", taglineZh: "红色行星——我们的下一站。", descriptionZh: "火星几个世纪以来一直吸引着人类的想象。它有季节变化、极地冰冠，以及太阳系最大的火山（奥林帕斯山），是一颗大气稀薄、气候寒冷的沙漠世界。毅力号、好奇号与祝融号正在积极探索其地表。", compositionZh: "铁核、玄武岩地幔、氧化铁表面", atmosphereZh: "95% CO₂、3% N₂、1.6% Ar", funFactsZh: ["奥林帕斯山高 22 公里——是珠穆朗玛峰的 2.5 倍。", "火星上一天仅比地球长 37 分钟。", "奥林帕斯山的底部与法国国土面积相当。", "火星天空因尘埃而呈红色，但日落却是蓝色的。"] },
  { id: "jupiter", name: "Jupiter", kind: "planet", emoji: "\u2643", color: "#d97706", radiusKm: 69911, diameterKm: 139820, massKg: "1.90\u00D710^27", gravity: "24.79 m/s\u00B2", orbitAu: 5.203, orbitPeriodDays: 4333, rotationHours: 9.93, axialTiltDeg: 3.13, composition: "Hydrogen, helium, trace ices", atmosphere: "90% H\u2082, 10% He, CH\u2084, NH\u2083, H\u2082O clouds", temperatureC: { min: -145, max: -110 }, tagline: "King of planets \u2014 a failed star.", description: "Jupiter is the largest planet, with a Great Red Spot \u2014 a storm bigger than Earth that has raged for at least 350 years. Its mass is 2.5\u00D7 all the other planets combined. Juno revealed cyclones at the poles, deep ammonia clouds, and a fuzzy core.", funFacts: ["Jupiter has 95 known moons (as of 2026).", "Its magnetic field is 20,000\u00D7 stronger than Earth\u2019s.", "It radiates more heat than it receives from the Sun.", "The Great Red Spot is shrinking \u2014 but still huge."], symbol: "\u2643", moons: 95, order: 5, nameZh: "木星", taglineZh: "太阳系之王——失败的恒星。", descriptionZh: "木星是太阳系最大的行星——质量超过其他所有行星之和的气态巨行星。它的条纹与旋涡由氨云和强风造就；大红斑是已持续 350 多年的反气旋风暴。伽利略卫星是搜寻地外生命的目标。", compositionZh: "氢（90%）、氦（10%）、微量甲烷、水、氨", atmosphereZh: "氢、氦、甲烷、水蒸气、氨晶体云", funFactsZh: ["大红斑是已持续至少 350 年的风暴。", "木星至少拥有 95 颗已知卫星。", "它的磁场比地球强 20,000 倍。", "木星一天仅约 10 小时——这使它明显扁平。"] },
  { id: "saturn", name: "Saturn", kind: "planet", emoji: "\u2644", color: "#eab308", radiusKm: 58232, diameterKm: 116460, massKg: "5.68\u00D710^26", gravity: "10.44 m/s\u00B2", orbitAu: 9.537, orbitPeriodDays: 10759, rotationHours: 10.7, axialTiltDeg: 26.73, composition: "Hydrogen, helium", atmosphere: "96% H\u2082, 3% He", temperatureC: { min: -178, max: -138 }, tagline: "The jewel \u2014 a ringed gas giant.", description: "Saturn\u2019s rings are made of billions of icy fragments \u2014 from grains to houses \u2014 spread across a system wider than the planet but only ~10 meters thick. Cassini\u2019s Grand Finale in 2017 dove between the rings before plunging into the gas giant.", funFacts: ["Saturn is so light it would float in water (if a bathtub existed).", "It has 146 confirmed moons \u2014 more than any other planet.", "Its rings are younger than the dinosaurs \u2014 under 400 million years old.", "Titan, its largest moon, has lakes of liquid methane."], symbol: "\u2644", ringColor: "#f5deb3", hasRings: true, moons: 146, order: 6, nameZh: "土星", taglineZh: "环抱宝石——气态巨行星。", descriptionZh: "土星以壮观的环系闻名——主要由冰块与岩石碎片组成。它的密度低于水，理论上可以浮在足够大的浴缸里。卡西尼号探测器揭示了环中的精细结构、风暴以及土卫六和土卫二的海洋世界。", compositionZh: "氢、氦，少量甲烷、水、氨", atmosphereZh: "氢（96%）、氦（3%）、甲烷痕迹", funFactsZh: ["土星环主要由直径 1 厘米到 10 米的冰块组成。", "土卫六拥有比地球还浓密的大气。", "土星密度低于水——它会浮起来。", "它有 146 颗已知卫星——比任何其他行星都多。"] },
  { id: "uranus", name: "Uranus", kind: "planet", emoji: "\u2645", color: "#06b6d4", radiusKm: 25362, diameterKm: 50724, massKg: "8.68\u00D710^25", gravity: "8.69 m/s\u00B2", orbitAu: 19.191, orbitPeriodDays: 30687, rotationHours: -17.24, axialTiltDeg: 97.77, composition: "Ices (H\u2082O, CH\u2084, NH\u2083), H\u2082/He envelope", atmosphere: "82% H\u2082, 15% He, 2% CH\u2084", temperatureC: { min: -224, max: -197 }, tagline: "The tilted ice giant.", description: "Uranus rotates on its side \u2014 likely due to an ancient cataclysmic collision. Its methane-rich atmosphere gives it a cyan hue. A faint ring system and 28 known moons orbit it. Voyager 2 is the only spacecraft to have visited.", funFacts: ["Uranus\u2019s tilt means each pole sees 42 years of sunlight, then 42 years of darkness.", "It\u2019s the coldest planetary atmosphere in the solar system.", "It was the first planet discovered with a telescope (William Herschel, 1781).", "Its winds reach 900 km/h."], symbol: "\u2645", hasRings: true, ringColor: "#67e8f9", moons: 28, order: 7, nameZh: "天王星", taglineZh: "侧卧旋转的冰巨人。", descriptionZh: "天王星是太阳系最冷的行星之一——大气最低温达 -224°C。它以 98° 的极端轴倾角侧向自转，使每个极区都有长达 42 年的连续日照与黑暗。甲烷赋予它标志性的青蓝色。", compositionZh: "氢、氦、甲烷、水、甲烷与氨的冰", atmosphereZh: "氢、氦、甲烷（赋予蓝色）", funFactsZh: ["天王星以 98° 倾角侧向自转。", "它是太阳系最冷的行星之一。", "天王星和海王星都被归类为冰巨星。", "它有 13 个已确认的模糊环。"] },
  { id: "neptune", name: "Neptune", kind: "planet", emoji: "\u2646", color: "#1d4ed8", radiusKm: 24622, diameterKm: 49244, massKg: "1.02\u00D710^26", gravity: "11.15 m/s\u00B2", orbitAu: 30.069, orbitPeriodDays: 60190, rotationHours: 16.11, axialTiltDeg: 28.32, composition: "Ices (H\u2082O, CH\u2084, NH\u2083), H\u2082/He envelope", atmosphere: "80% H\u2082, 19% He, 1% CH\u2084", temperatureC: { min: -218, max: -200 }, tagline: "The windswept ice giant.", description: "Neptune is the windiest planet, with gusts up to 2,100 km/h. Its vivid blue color comes from methane absorbing red light. Discovered by mathematical prediction in 1846, it was visited only once \u2014 by Voyager 2 in 1989.", funFacts: ["Neptune was the first planet found by math before observation.", "One Neptune year = 165 Earth years.", "It has 16 known moons \u2014 Triton orbits backwards.", "A 1989 dark spot (Great Dark Spot) has since vanished."], symbol: "\u2646", moons: 16, order: 8, nameZh: "海王星", taglineZh: "风驰电掣的冰巨星。", descriptionZh: "海王星是太阳系最遥远的行星。它拥有最强的风——超过 2,000 公里/小时。深蓝色来自大气中的甲烷。旅行者 2 号是迄今唯一造访过它的探测器。", compositionZh: "氢、氦、甲烷冰", atmosphereZh: "氢、氦、甲烷", funFactsZh: ["海王星上的风速超过 2,000 公里/小时。", "它需要 165 地球年才能绕太阳一圈。", "1989 年大暗斑是一个短暂的反气旋风暴。", "海王星在 1846 年是通过数学预测而非观测发现的。"] },
  { id: "pluto", name: "Pluto", kind: "dwarf", emoji: "\u2647", color: "#a78bfa", radiusKm: 1188, diameterKm: 2376, massKg: "1.30\u00D710^22", gravity: "0.62 m/s\u00B2", orbitAu: 39.482, orbitPeriodDays: 90560, rotationHours: -153.3, axialTiltDeg: 122.53, composition: "Rock and ice", atmosphere: "Thin N\u2082, CH\u2084, CO", temperatureC: { min: -240, max: -218 }, tagline: "The beloved dwarf planet.", description: "Pluto was reclassified as a dwarf planet in 2006, but it remains a world of wonder. New Horizons flew by in 2015, revealing a heart-shaped glacier, ice mountains, and a possible subsurface ocean. It has 5 moons, including Charon \u2014 half its size.", funFacts: ["Pluto\u2019s heart-shaped glacier is named Tombaugh Regio.", "It hasn\u2019t completed a single orbit since 1930 (discovery).", "Sunlight at Pluto is 1,000\u00D7 dimmer than on Earth.", "A year on Pluto is 248 Earth years."], symbol: "\u2647", moons: 5, order: 9, nameZh: "冥王星", taglineZh: "被降级但仍迷人的矮行星。", descriptionZh: "冥王星是柯伊伯带中最大、最著名的一颗矮行星。2015 年新视野号飞掠揭示了冰质山脉、氮冰平原，以及标志性的心形冰原（汤博区）。它有 5 颗卫星，其中最大的是冥卫一卡戎——大小约为冥王星的一半。", compositionZh: "岩石和冰", atmosphereZh: "稀薄氮气", funFactsZh: ["冥王星的心形冰原名为汤博区。", "自 1930 年发现以来，它还未完成一圈完整公转。", "冥王星处的阳光比地球弱 1,000 倍。", "冥王星上的一年约等于 248 地球年。"] },
  { id: "ceres", name: "Ceres", kind: "dwarf", emoji: "\u26B6", color: "#94a3b8", radiusKm: 473, diameterKm: 940, massKg: "9.39\u00D710^20", gravity: "0.27 m/s\u00B2", orbitAu: 2.766, orbitPeriodDays: 1682, rotationHours: 9.07, axialTiltDeg: 4, composition: "Rock and ice", atmosphere: "Trace water vapor", temperatureC: { min: -158, max: -38 }, tagline: "The asteroid belt\u2019s brightest resident.", description: "Ceres is the largest object in the asteroid belt and the closest dwarf planet. NASA\u2019s Dawn mission (2015) revealed bright salt deposits in Occator crater \u2014 evidence of past briny water. It may host a subsurface ocean.", funFacts: ["Ceres makes up 25% of the asteroid belt\u2019s mass.", "It\u2019s the only dwarf planet in the inner solar system.", "Bright spots are sodium carbonate from brine.", "A day on Ceres is just 9 hours."], symbol: "\u26B6", moons: 0, order: 10, nameZh: "谷神星", taglineZh: "小行星带中最亮的居民。", descriptionZh: "谷神星是小行星带中最大的天体，也是距离我们最近的矮行星。NASA 的黎明号（2015 年）揭示了 Occator 环形山中的明亮盐沉积物——这证明了过去有盐水存在。它可能还藏有地下海洋。", compositionZh: "岩石和冰", atmosphereZh: "痕量水蒸气", funFactsZh: ["谷神星占小行星带总质量的 25%。", "它是内太阳系中唯一的矮行星。", "其上的亮斑来自盐水蒸发后的碳酸钠。", "谷神星上一天只有 9 小时。"] },
  { id: "makemake", name: "Makemake", kind: "dwarf", emoji: "\uD83E\uDE90", color: "#fb923c", radiusKm: 715, diameterKm: 1430, massKg: "3.1\u00D710^21", gravity: "0.57 m/s\u00B2", orbitAu: 45.791, orbitPeriodDays: 112897, rotationHours: 22.83, axialTiltDeg: 29, composition: "Rock and ice", atmosphere: "Thin CH\u2084 haze", temperatureC: { min: -243, max: -228 }, tagline: "Easter Island\u2019s sky guardian.", description: "Makemake was discovered in 2005 \u2014 one of the reasons Pluto was reclassified. It\u2019s a bright, frozen world named after the creation deity of Rapa Nui. Surface ices of methane and nitrogen give it a reddish tint.", funFacts: ["It was discovered just after Easter \u2014 hence the name.", "It has at least one moon, S/2015 (136472) 1.", "It lacks the heavy CH\u2084 atmosphere Pluto has.", "It takes ~310 Earth years to orbit the Sun once."], symbol: "\uD83E\uDE90", moons: 1, order: 11, nameZh: "鸟神星", taglineZh: "复活节岛的天空守护神。", descriptionZh: "鸟神星于 2005 年被发现——这正是冥王星被重新分类的原因之一。它是一颗明亮的冰冻世界，以复活节岛拉帕努伊的创世之神命名。表面的甲烷和氮冰赋予它微微泛红的光泽。", compositionZh: "岩石和冰", atmosphereZh: "稀薄的 CH₄ 雾", funFactsZh: ["它刚在复活节后被发现——因此得名。", "它至少有一颗卫星 S/2015 (136472) 1。", "它不像冥王星那样有浓密的 CH₄ 大气。", "它绕太阳一圈需要约 310 地球年。"] },
  { id: "haumea", name: "Haumea", kind: "dwarf", emoji: "\uD83E\uDE90", color: "#e5e5e5", radiusKm: 780, diameterKm: 1632, massKg: "4.0\u00D710^21", gravity: "0.63 m/s\u00B2", orbitAu: 43.116, orbitPeriodDays: 103468, rotationHours: 3.92, axialTiltDeg: 13.41, composition: "Rock with ice mantle", temperatureC: { min: -241, max: -223 }, tagline: "The spinning egg of the outer solar system.", description: "Haumea is one of the fastest-spinning large bodies in the solar system \u2014 a day lasts under 4 hours. This rapid spin stretched it into an ellipsoid (egg-shape). It has a ring system and two moons, Hi\u2019iaka and Namaka.", funFacts: ["Haumea completes a rotation in just 3.9 hours.", "It was the first dwarf planet found with rings.", "It\u2019s shaped like a squashed rugby ball.", "A day on Haumea is shorter than a typical movie."], symbol: "\uD83E\uDE90", moons: 2, hasRings: true, ringColor: "#a3a3a3", order: 12, nameZh: "妊神星", taglineZh: "外太阳系中旋转的卵。", descriptionZh: "妊神星是太阳系中自转最快的大型天体之一——一天不到 4 小时。这种快速自转让它被拉伸成椭球形（卵形）。它拥有一个环系和两颗卫星——Hi’iaka 与 Namaka。", compositionZh: "岩石与冰质外壳", funFactsZh: ["妊神星的自转周期仅 3.9 小时。", "它是首颗被发现带环的矮行星。", "它的形状像一个被压扁的橄榄球。", "在妊神星上，一天比一部电影还短。"] },
  { id: "eris", name: "Eris", kind: "dwarf", emoji: "\uD83E\uDE90", color: "#f1f5f9", radiusKm: 1163, diameterKm: 2326, massKg: "1.66\u00D710^22", gravity: "0.82 m/s\u00B2", orbitAu: 67.781, orbitPeriodDays: 203830, rotationHours: 25.9, axialTiltDeg: 78, composition: "Rock and ice", atmosphere: "Possible transient CH\u2084", temperatureC: { min: -243, max: -228 }, tagline: "The world that dethroned Pluto.", description: "Eris\u2019s discovery in 2005 forced astronomers to redefine \u2018planet\u2019. It\u2019s slightly smaller than Pluto but ~27% more massive. It has one moon, Dysnomia, and an orbit so eccentric it spends 280 years beyond Pluto.", funFacts: ["Eris sparked the 2006 IAU planet definition debate.", "It\u2019s the most distant known dwarf planet.", "Its surface is covered in methane ice \u2014 blindingly white.", "Dysnomia, its moon, is named after Eris\u2019s daughter, the spirit of lawlessness."], symbol: "\uD83E\uDE90", moons: 1, order: 13, nameZh: "阋神星", taglineZh: "使冥王星被降级的世界。", descriptionZh: "阋神星于 2005 年的发现迫使天文学家重新定义行星。它比冥王星略小但质量多约 27%。它有一颗卫星——戴丝诺米娅，轨道偏心率极大，单在冥王星之外就要待上 280 年。", compositionZh: "岩石和冰", atmosphereZh: "可能存在短暂的 CH₄", funFactsZh: ["阋神星引发了 2006 年 IAU 行星定义的争论。", "它是已知最遥远的矮行星。", "其表面被甲烷冰覆盖——白得耀眼。", "它的卫星戴丝诺米娅以混乱女神命名。"] }
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
  description: "The asteroid belt is a region between Mars and Jupiter where millions of small rocky bodies orbit the Sun. Despite sci-fi depictions, it\u2019s mostly empty \u2014 spacecraft pass through with ease.",
  funFacts: [
    "It contains over 1.3 million known asteroids.",
    "Ceres accounts for 25% of its total mass.",
    "Total mass is just 4% of our Moon.",
    "It\u2019s a failed planet that never coalesced \u2014 Jupiter\u2019s gravity prevented it."
  ],
  symbol: "\u2022",
  order: 5.5, nameZh: "小行星带", taglineZh: "火星与木星之间的无数世界。", descriptionZh: "小行星带是位于火星和木星之间的一片区域，百万计的小型岩质天体绕太阳运行。尽管科幻电影把它描绘得危险，它实际非常空旷——航天器可以轻松穿越。", compositionZh: "岩石与金属碎片", funFactsZh: ["它包含超过 130 万颗已知小行星。", "谷神星占其总质量的 25%。", "总质量仅为月球的 4%。", "它是一颗从未凝聚成功的失败行星——木星的引力阻止了它。"]
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
  description: "Beyond Neptune lies the Kuiper Belt \u2014 a doughnut-shaped region of icy bodies, home to Pluto, Haumea, Makemake, and Eris. It\u2019s the source of many short-period comets.",
  funFacts: [
    "It contains billions of icy objects.",
    "It\u2019s 20\u00D7 wider than the asteroid belt.",
    "New Horizons is the only mission to explore it.",
    "Pluto is the most famous resident."
  ],
  symbol: "\u2022",
  order: 9.5, nameZh: "柯伊伯带", taglineZh: "海王星之外的冰封前线。", descriptionZh: "海王星之外是柯伊伯带——一个甜甜圈形状的冰天体区域，冥王星、妊神星、鸟神星和阋神星都居住其中。它是许多短周期彗星的来源。", compositionZh: "冰质天体（水、甲烷、氨冰）", funFactsZh: ["它包含数十亿个冰质天体。", "它的宽度是小行星带的 20 倍。", "新视野号是唯一造访过它的探测器。", "冥王星是其中最著名的居民。"]
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
  tagline: "The solar system\u2019s ghostly shell.",
  description: "The Oort Cloud is a hypothetical sphere of icy bodies surrounding the Sun at distances up to 100,000 AU. It\u2019s the source of long-period comets \u2014 visitors from the solar system\u2019s edge.",
  funFacts: [
    "It may extend a quarter of the way to Proxima Centauri.",
    "It\u2019s never been directly observed.",
    "Long-period comets come from here.",
    "Voyager 1 won\u2019t reach it for ~300 years."
  ],
  symbol: "\u2022",
  order: 14, nameZh: "奥尔特云", taglineZh: "太阳系朦胧的外壳。", descriptionZh: "奥尔特云是推测中围绕太阳、距其远达 100,000 AU 的冰质天体球。它是长周期彗星的来源——来自太阳系边缘的访客。", compositionZh: "冰质天体、彗星", funFactsZh: ["它可能延伸到距比邻星四分之一的距离。", "它从未被直接观测到。", "长周期彗星来自这里。", "旅行者 1 号还需要约 300 年才能抵达。"]
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
