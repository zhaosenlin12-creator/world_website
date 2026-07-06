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
  nameZh: "太阳",
  kind: "star",
  color: "#fbbf24",
  radiusKm: 696340,
  diameterKm: 1392680,
  massKg: "1.989e30",
  gravity: "274 m/s^2",
  orbitAu: 0,
  orbitPeriodDays: 0,
  rotationHours: 609.6,
  axialTiltDeg: 7.25,
  composition: "Hydrogen (73%), Helium (25%), trace elements",
  compositionZh: "氢 (73%)、氦 (25%) 及微量元素",
  atmosphere: "Photosphere, chromosphere, corona",
  atmosphereZh: "光球层、色球层、日冕",
  temperatureC: { min: 5500, max: 15000000 },
  tagline: "Our star - a 4.6-billion-year-old ball of fusion.",
  taglineZh: "我们的恒星 - 一颗 46 亿岁、持续核聚变的炽热球体。",
  description: "The Sun is the heart of our solar system. Its gravity holds everything from the smallest dust mote to the gas giants in orbit. In its core, 600 million tons of hydrogen fuse into helium every second, releasing energy that travels 93 million miles to warm our world.",
  descriptionZh: "太阳是我们太阳系的心脏。它的引力将一切 - 从最小的尘埃到气体巨星 - 全部束缚在轨道上。在其核心，每秒有 6 亿吨氢聚变成氦，释放的能量穿越 1.5 亿公里温暖我们的世界。",
  funFacts: [
    "Light from the Sun takes 8 minutes 20 seconds to reach Earth.",
    "The Sun accounts for 99.86% of the solar system mass.",
    "Its surface temperature is ~5,500 C - but the corona is 200x hotter.",
    "Every second, the Sun converts ~4 million tons of mass into energy."
  ],
  funFactsZh: [
    "阳光需要 8 分 20 秒才能到达地球。",
    "太阳占整个太阳系质量的 99.86%。",
    "表面温度约 5,500℃，但日冕比表面热 200 倍。",
    "太阳每秒把约 400 万吨质量转化为能量。"
  ],
  order: 0,
  symbol: "S"
};

export const BODIES: SolarBody[] = [
  {
    id: "mercury",
    name: "Mercury",
    nameZh: "水星",
    kind: "planet",
    color: "#a8a29e",
    radiusKm: 2440,
    diameterKm: 4879,
    massKg: "3.30e23",
    gravity: "3.7 m/s^2",
    orbitAu: 0.387,
    orbitPeriodDays: 88,
    rotationHours: 1407.6,
    axialTiltDeg: 0.034,
    composition: "Iron core (~75% radius), silicate mantle",
    compositionZh: "铁核 (半径的约 75%)、硅酸盐地幔",
    atmosphere: "Trace: O2, Na, H2, He",
    atmosphereZh: "微量: 氧、钠、氢、氦",
    temperatureC: { min: -173, max: 427 },
    tagline: "The swift messenger of the gods.",
    taglineZh: "众神迅捷的信使。",
    description: "Mercury is the smallest planet in our solar system and the closest to the Sun. With virtually no atmosphere, its surface swings between blistering days and frigid nights. The MESSENGER and BepiColombo missions revealed a planet rich in iron and scarred by ancient impacts.",
    descriptionZh: "水星是太阳系最小的行星，也是离太阳最近的一颗。由于几乎没有大气，其表面在灼热的白天与严寒的夜晚之间剧烈摆动。MESSENGER 与 BepiColombo 任务揭示了这颗富含铁、被古老撞击坑刻满的行星。",
    funFacts: [
      "A single Mercury day lasts ~176 Earth days - twice its year.",
      "Despite being closest to the Sun, it is not the hottest planet.",
      "It has no atmosphere and no moons.",
      "Surface temperatures swing by 600 C between day and night."
    ],
    funFactsZh: [
      "一个水星日约 176 个地球日 - 是其公转周期的两倍。",
      "尽管离太阳最近，它却不是最热的行星。",
      "没有大气，也没有卫星。",
      "表面昼夜温差达 600℃。"
    ],
    order: 1,
    symbol: "M"
  },
  {
    id: "venus",
    name: "Venus",
    nameZh: "金星",
    kind: "planet",
    color: "#fbbf24",
    radiusKm: 6052,
    diameterKm: 12104,
    massKg: "4.87e24",
    gravity: "8.87 m/s^2",
    orbitAu: 0.723,
    orbitPeriodDays: 225,
    rotationHours: -5832.5,
    axialTiltDeg: 177.4,
    composition: "Iron core, silicate mantle, CO2 atmosphere",
    compositionZh: "铁核、硅酸盐地幔、二氧化碳大气",
    atmosphere: "96% CO2, 3.5% N2, sulfuric acid clouds",
    atmosphereZh: "96% 二氧化碳、3.5% 氮、硫酸云层",
    temperatureC: { min: 462, max: 462 },
    tagline: "Earth's hellish twin.",
    taglineZh: "地球的地狱双胞胎。",
    description: "Venus is the hottest planet in our solar system, wrapped in a thick CO2 atmosphere that traps heat in a runaway greenhouse effect. It rotates backward compared to most planets, and a day on its surface is longer than its year.",
    descriptionZh: "金星是太阳系最热的行星，被一层厚厚的二氧化碳包裹，形成失控的温室效应。它与多数行星相反地自转，表面一天比一年还长。",
    funFacts: [
      "Surface pressure is 92x Earth's - equivalent to 900m underwater.",
      "It rotates backward - the sun rises in the west.",
      "A Venusian day (243 Earth days) is longer than its year (225 days).",
      "It is the brightest planet in our night sky."
    ],
    funFactsZh: [
      "表面气压是地球的 92 倍 - 相当于水下 900 米。",
      "反向自转 - 太阳从西边升起。",
      "金星的一天 (243 地球日) 比一年 (225 天) 还长。",
      "它是夜空中最亮的行星。"
    ],
    order: 2,
    symbol: "V"
  },
  {
    id: "earth",
    name: "Earth",
    nameZh: "地球",
    kind: "planet",
    color: "#3b82f6",
    radiusKm: 6371,
    diameterKm: 12742,
    massKg: "5.97e24",
    gravity: "9.81 m/s^2",
    orbitAu: 1.0,
    orbitPeriodDays: 365.25,
    rotationHours: 23.93,
    axialTiltDeg: 23.44,
    composition: "Iron core, silicate mantle, hydrosphere",
    compositionZh: "铁核、硅酸盐地幔、水圈",
    atmosphere: "78% N2, 21% O2, 1% other",
    atmosphereZh: "78% 氮、21% 氧、1% 其他",
    temperatureC: { min: -89, max: 58 },
    tagline: "Our blue marble - the only known cradle of life.",
    taglineZh: "我们的蓝色弹珠 - 已知的唯一生命摇篮。",
    description: "Earth is the third planet from the Sun and the only known world to harbor life. Liquid water covers 71% of its surface, an oxygen-rich atmosphere shelters complex ecosystems, and a magnetic field shields it from solar radiation.",
    descriptionZh: "地球是第三颗行星，也是已知唯一孕育生命的星球。液态水覆盖其 71% 的表面，富氧大气庇护着复杂的生态系统，磁场使其免受太阳辐射的伤害。",
    funFacts: [
      "Earth is not a perfect sphere - it bulges at the equator.",
      "The Moon is moving away from Earth at 3.8 cm per year.",
      "Earth's core is as hot as the surface of the Sun (~6000 C).",
      "99% of Earth's gold is buried in the core."
    ],
    funFactsZh: [
      "地球并非完美的球体 - 赤道处隆起。",
      "月球每年以 3.8 厘米的速度远离地球。",
      "地核与太阳表面一样热 (约 6000℃)。",
      "地球上 99% 的黄金埋在地核里。"
    ],
    moons: 1,
    order: 3,
    symbol: "E"
  },
  {
    id: "mars",
    name: "Mars",
    nameZh: "火星",
    kind: "planet",
    color: "#dc2626",
    radiusKm: 3389,
    diameterKm: 6779,
    massKg: "6.42e23",
    gravity: "3.71 m/s^2",
    orbitAu: 1.524,
    orbitPeriodDays: 687,
    rotationHours: 24.62,
    axialTiltDeg: 25.19,
    composition: "Iron core, silicate mantle, iron oxide surface",
    compositionZh: "铁核、硅酸盐地幔、氧化铁表面",
    atmosphere: "95% CO2, 3% N2, 1.6% Ar",
    atmosphereZh: "95% 二氧化碳、3% 氮、1.6% 氩",
    temperatureC: { min: -143, max: 35 },
    tagline: "The red planet - our next frontier.",
    taglineZh: "红色行星 - 我们的下一片疆土。",
    description: "Mars has captivated human imagination for centuries. Its rust-colored surface, polar ice caps, and the largest volcano in the solar system - Olympus Mons - hint at a dynamic past. Robotic rovers have found evidence of ancient water flows and are searching for signs of past life.",
    descriptionZh: "火星几个世纪以来一直吸引着人类的想象。它锈红的表面、极地冰盖、太阳系最高的火山 - 奥林匹斯山 - 都暗示着它活跃的过去。漫游车已找到古代水流的证据，并正在寻找过往生命的痕迹。",
    funFacts: [
      "Olympus Mons is 22 km tall - nearly 3x Mount Everest.",
      "Sunsets on Mars are blue.",
      "A Martian day (sol) is just 39 minutes longer than Earth's.",
      "Mars has the largest dust storms in the solar system."
    ],
    funFactsZh: [
      "奥林匹斯山高 22 公里 - 接近珠穆朗玛峰的 3 倍。",
      "火星上的日落是蓝色的。",
      "火星日 (sol) 只比地球日长 39 分钟。",
      "火星拥有太阳系最大的尘暴。"
    ],
    moons: 2,
    order: 4,
    symbol: "Ma"
  },
  {
    id: "jupiter",
    name: "Jupiter",
    nameZh: "木星",
    kind: "planet",
    color: "#fbbf24",
    radiusKm: 69911,
    diameterKm: 139822,
    massKg: "1.90e27",
    gravity: "24.79 m/s^2",
    orbitAu: 5.204,
    orbitPeriodDays: 4333,
    rotationHours: 9.93,
    axialTiltDeg: 3.13,
    composition: "Hydrogen, helium, trace gases",
    compositionZh: "氢、氦、微量气体",
    atmosphere: "90% H2, 10% He, ammonia clouds",
    atmosphereZh: "90% 氢、10% 氦、氨云",
    temperatureC: { min: -145, max: -145 },
    tagline: "King of the planets - a failed star.",
    taglineZh: "行星之王 - 一颗失败的恒星。",
    description: "Jupiter is the largest planet in our solar system - more massive than all the others combined. Its iconic Great Red Spot is a storm that has raged for at least 350 years, and its 95 known moons include the icy ocean world Europa.",
    descriptionZh: "木星是太阳系最大的行星 - 质量超过其他所有行星之和。它标志性的「大红斑」是一场已持续至少 350 年的风暴，95 颗已知卫星中包括冰封海洋世界欧罗巴。",
    funFacts: [
      "The Great Red Spot is shrinking but still larger than Earth.",
      "Jupiter's moon Ganymede is larger than Mercury.",
      "It has the shortest day of any planet - under 10 hours.",
      "Jupiter's gravity shields inner planets from comets."
    ],
    funFactsZh: [
      "大红斑正在缩小，但仍比地球大。",
      "木星的卫星木卫三比水星还大。",
      "它的自转周期最短 - 不到 10 小时。",
      "木星的引力为内行星遮挡彗星。"
    ],
    moons: 95,
    order: 5,
    symbol: "J"
  },
  {
    id: "saturn",
    name: "Saturn",
    nameZh: "土星",
    kind: "planet",
    color: "#fbbf24",
    radiusKm: 58232,
    diameterKm: 116464,
    massKg: "5.68e26",
    gravity: "10.44 m/s^2",
    orbitAu: 9.582,
    orbitPeriodDays: 10759,
    rotationHours: 10.66,
    axialTiltDeg: 26.73,
    composition: "Hydrogen, helium",
    compositionZh: "氢、氦",
    atmosphere: "96% H2, 3% He",
    atmosphereZh: "96% 氢、3% 氦",
    temperatureC: { min: -178, max: -178 },
    tagline: "The jewel of the solar system.",
    taglineZh: "太阳系的宝石。",
    description: "Saturn's stunning ring system is made of billions of icy fragments ranging from dust to house-sized chunks. With 146 known moons including the haze-shrouded Titan, Saturn is a miniature solar system in its own right.",
    descriptionZh: "土星惊艳的环系由数十亿块冰质碎片组成，从尘埃到房屋大小的碎块。146 颗已知卫星中包括被雾霭笼罩的泰坦 - 土星本身就是一个微型太阳系。",
    funFacts: [
      "Saturn is so light it would float in a (giant) bathtub.",
      "Its rings are only ~10m thick on average.",
      "Titan has lakes of liquid methane.",
      "A Saturn year is 29.5 Earth years."
    ],
    funFactsZh: [
      "土星非常轻，理论上能浮在水中。",
      "它的环平均只有约 10 米厚。",
      "土卫六 (泰坦) 拥有液态甲烷湖。",
      "一个土星年等于 29.5 个地球年。"
    ],
    hasRings: true,
    ringColor: "#e7c98a",
    moons: 146,
    order: 6,
    symbol: "Sa"
  },
  {
    id: "uranus",
    name: "Uranus",
    nameZh: "天王星",
    kind: "planet",
    color: "#22d3ee",
    radiusKm: 25362,
    diameterKm: 50724,
    massKg: "8.68e25",
    gravity: "8.69 m/s^2",
    orbitAu: 19.201,
    orbitPeriodDays: 30687,
    rotationHours: -17.24,
    axialTiltDeg: 97.77,
    composition: "Hydrogen, helium, water, methane, ammonia ices",
    compositionZh: "氢、氦、水、甲烷、氨冰",
    atmosphere: "H2, He, CH4 (gives it blue-green color)",
    atmosphereZh: "氢、氦、甲烷 (使它呈蓝绿色)",
    temperatureC: { min: -224, max: -224 },
    tagline: "The tilted ice giant rolling on its side.",
    taglineZh: "侧身自转的冰巨星。",
    description: "Uranus rotates on its side with an axial tilt of 98 degrees, possibly due to an ancient collision. Its pale cyan color comes from methane in the upper atmosphere, which absorbs red light. It has 13 faint rings and 28 known moons.",
    descriptionZh: "天王星以 98 度的倾角侧身自转，可能源于一次古老的碰撞。淡青色来自上层大气的甲烷 - 它吸收红光。它有 13 条暗淡的光环和 28 颗已知卫星。",
    funFacts: [
      "Uranus rotates on its side at 98 degrees.",
      "It is the coldest planetary atmosphere in the solar system.",
      "Methane gives it that blue-green tint.",
      "A Uranian season lasts 21 Earth years."
    ],
    funFactsZh: [
      "天王星以 98 度倾角侧身自转。",
      "它拥有太阳系最冷的大气。",
      "甲烷赋予它蓝绿色调。",
      "一个天王星季节持续 21 个地球年。"
    ],
    hasRings: true,
    ringColor: "#67e8f9",
    moons: 28,
    order: 7,
    symbol: "U"
  },
  {
    id: "neptune",
    name: "Neptune",
    nameZh: "海王星",
    kind: "planet",
    color: "#3b82f6",
    radiusKm: 24622,
    diameterKm: 49244,
    massKg: "1.02e26",
    gravity: "11.15 m/s^2",
    orbitAu: 30.047,
    orbitPeriodDays: 60190,
    rotationHours: 16.11,
    axialTiltDeg: 28.32,
    composition: "Hydrogen, helium, water, methane ices",
    compositionZh: "氢、氦、水、甲烷冰",
    atmosphere: "H2, He, CH4",
    atmosphereZh: "氢、氦、甲烷",
    temperatureC: { min: -218, max: -218 },
    tagline: "The windswept world at the edge of the planets.",
    taglineZh: "行星边界上的狂风世界。",
    description: "Neptune is the windiest planet, with gusts超过 2000 km/h. Discovered through mathematical prediction in 1846, its deep blue color and dynamic storms make it a fitting sentinel at the outer edge of the planetary realm.",
    descriptionZh: "海王星是风速最快的行星，阵风超过 2000 公里/小时。1846 年通过数学预测发现，它深邃的蓝色与多变的暴风使它成为行星疆域外缘最合适的哨兵。",
    funFacts: [
      "Winds reach 2,100 km/h - the fastest in the solar system.",
      "It was the first planet found by mathematical prediction.",
      "A Neptune year is nearly 165 Earth years.",
      "It has 14 known moons, the largest being Triton."
    ],
    funFactsZh: [
      "风速可达 2100 公里/小时 - 太阳系之最。",
      "它是第一颗通过数学预测发现的行星。",
      "一个海王星年约等于 165 个地球年。",
      "已知 14 颗卫星，最大的是海卫一 (Triton)。"
    ],
    hasRings: true,
    ringColor: "#6366f1",
    moons: 14,
    order: 8,
    symbol: "N"
  }
];

export const BELT: SolarBody = {
  id: "asteroid-belt",
  name: "Asteroid Belt",
  nameZh: "小行星带",
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
  compositionZh: "岩石与金属碎片",
  temperatureC: { min: -100, max: 0 },
  tagline: "Millions of worlds between Mars and Jupiter.",
  taglineZh: "火星与木星之间的数百万个世界。",
  description: "The asteroid belt is a region of millions of rocky bodies between Mars and Jupiter. Despite the sci-fi image, it is mostly empty space - a spacecraft can pass through safely. The largest object, Ceres, holds about a third of the belt total mass.",
  descriptionZh: "小行星带是位于火星与木星之间、由数百万岩石天体组成的区域。虽常被科幻作品渲染危险，它实际上极为空旷 - 飞船可以安全穿越。最大的天体谷神星约占整带总质量的三分之一。",
  funFacts: [
    "The total mass of the belt is only ~4% of the Moon.",
    "Ceres holds about a third of the belt mass.",
    "The average distance between asteroids is millions of km.",
    "It is a failed planet that never coalesced - Jupiter gravity prevented it."
  ],
  funFactsZh: [
    "整带总质量仅为月球的约 4%。",
    "谷神星约占整带质量的三分之一。",
    "小行星之间的平均距离达数百万公里。",
    "它是一颗未能形成的行星 - 木星的引力阻止了它聚合。"
  ],
  order: 9,
  symbol: "A"
};

export const KUIPER: SolarBody = {
  id: "kuiper-belt",
  name: "Kuiper Belt",
  nameZh: "柯伊伯带",
  kind: "belt",
  color: "#cbd5e1",
  radiusKm: 0,
  diameterKm: 0,
  massKg: "~0.1 Earth masses",
  gravity: "negligible",
  orbitAu: 39.5,
  orbitPeriodDays: 0,
  rotationHours: 0,
  axialTiltDeg: 0,
  composition: "Icy bodies (water, methane, ammonia)",
  compositionZh: "冰质天体 (水、甲烷、氨)",
  temperatureC: { min: -243, max: -223 },
  tagline: "The frozen frontier of the planets.",
  taglineZh: "行星的冰封边疆。",
  description: "Beyond Neptune lies the Kuiper Belt - a doughnut-shaped region of icy bodies. It is the source of many short-period comets and home to dwarf planets like Pluto, Haumea, Makemake, and Eris. New Horizons is the only spacecraft to have visited it.",
  descriptionZh: "海王星轨道之外是柯伊伯带 - 一片甜甜圈形状的冰质天体区域。它是许多短周期彗星的源头，也是冥王星、妊神星、鸟神星与阋神星等矮行星的家园。新视野号是唯一造访过它的探测器。",
  funFacts: [
    "It contains hundreds of thousands of icy bodies larger than 100 km.",
    "Pluto is the best-known Kuiper Belt object.",
    "It is 20 to 200 times more massive than the asteroid belt.",
    "The Kuiper Belt outer edge marks the true end of the solar system."
  ],
  funFactsZh: [
    "它包含数十万个直径超过 100 公里的冰质天体。",
    "冥王星是最著名的柯伊伯带天体。",
    "它的质量是小行星带的 20 至 200 倍。",
    "柯伊伯带的外缘标志着太阳系的真正终点。"
  ],
  order: 10,
  symbol: "K"
};

export const OORT: SolarBody = {
  id: "oort-cloud",
  name: "Oort Cloud",
  nameZh: "奥尔特云",
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
  compositionZh: "冰质天体",
  temperatureC: { min: -268, max: -253 },
  tagline: "The solar system ghost shell.",
  taglineZh: "太阳系的幽魂外壳。",
  description: "The Oort Cloud is a hypothetical spherical shell of icy objects that may extend out to 100,000 AU - nearly halfway to the nearest star. It is the source of long-period comets and the outermost boundary of the Sun gravitational influence.",
  descriptionZh: "奥尔特云是一个假说中的冰质天体球状外壳，可能延伸到 10 万天文单位 - 几乎到达最近的恒星。它是长周期彗星的源头，也是太阳引力影响的最外层边界。",
  funFacts: [
    "No spacecraft has ever reached the Oort Cloud.",
    "It may contain trillions of objects.",
    "Long-period comets come from the Oort Cloud.",
    "It could extend out to 100,000 AU."
  ],
  funFactsZh: [
    "尚无探测器抵达奥尔特云。",
    "它可能包含数万亿个天体。",
    "长周期彗星来自奥尔特云。",
    "它可能延伸至 10 万天文单位。"
  ],
  order: 11,
  symbol: "O"
};

export const ALL_BODIES: SolarBody[] = [SUN, ...BODIES, BELT, KUIPER, OORT];

// 3D scene scaling (NON-physical, for visualization)
export const SCENE = {
  sunSize: 4.2,
  bodyScale: 1.9,
  orbitScale: 1.0,
  distance: (au: number) => 7.0 + Math.sqrt(Math.max(au, 0.05)) * 8.5
};

export const PLANET_LIST: SolarBody[] = BODIES.filter((b) => b.kind === "planet");
export const DWARF_LIST: SolarBody[] = BODIES.filter((b) => b.kind === "dwarf");


