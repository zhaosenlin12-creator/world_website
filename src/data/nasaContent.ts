export interface NasaTopicCard {
  tag: string;
  title: string;
  description: string;
  href: string;
  tone?: "neutral" | "cyan" | "fuchsia" | "amber";
  mediaType?: "video" | "image";
  mediaUrl?: string;
  poster?: string;
}

export const heroDiscovery = {
  eyebrow: "NASA 科学发现",
  title: "钱德拉与韦布正在改写我们对宇宙的认知",
  body: "NASA 的多项任务仍在不断拓展我们对恒星、星系与深空结构的理解。这一组页面汇集了最新的 NASA Science 视频、图像和 3D 资源，让探索体验更具沉浸感。",
  video: "https://assets.science.nasa.gov/content/dam/science/missions/webb/outreach/migrated/2022/STScI-01G6X376A8FS0E1GMJAPT56NZ3.mp4",
  poster: "https://assets.science.nasa.gov/content/dam/science/missions/webb/outreach/migrated/2017/STScI-01H8PJ6083PCF4KJ1AYKVVRX8Q.png/jcr:content/renditions/cq5dam.web.1280.1280.png",
  href: "https://science.nasa.gov/universe/",
};

export const featuredTopics: NasaTopicCard[] = [
  {
    tag: "恒星",
    title: "恒星如何诞生并走向演化",
    description: "NASA Science 指出，可观测宇宙中的恒星数量可能高达 1 千万亿亿颗。它们从分子云中凝聚诞生，并根据质量不同走向完全不同的生命历程。",
    href: "https://science.nasa.gov/universe/stars/",
    tone: "amber",
    mediaType: "video",
    mediaUrl: "https://assets.science.nasa.gov/content/dam/science/missions/webb/outreach/migrated/2022/STScI-01G6X376A8FS0E1GMJAPT56NZ3.mp4",
  },
  {
    tag: "黑洞",
    title: "为什么黑洞能够弯曲光线",
    description: "Gaia BH1 是目前已知距离我们最近的静默黑洞，大约位于 1500 光年之外。它的发现依赖 Gaia 的高精度天体测量与后续观测结果。",
    href: "https://science.nasa.gov/universe/black-holes/",
    tone: "fuchsia",
    mediaType: "image",
    mediaUrl: "https://assets.science.nasa.gov/content/dam/science/psd/solar/2023/09/b/blackhole_1600.jpg/jcr:content/renditions/cq5dam.web.1280.1280.jpeg",
  },
  {
    tag: "银河系",
    title: "重新测量银河系的旋臂结构",
    description: "结合钱德拉与 XMM-Newton 的研究成果，科学家通过 X 射线回声重新描绘了银河系旋臂的尺度与形态。",
    href: "https://science.nasa.gov/missions/chandra/nasas-chandra-examines-milky-way-at-arms-length/",
    tone: "cyan",
    mediaType: "video",
    mediaUrl: "https://assets.science.nasa.gov/content/dam/science/missions/hubble/galaxies/milky-way/STScI-01EVSC7MAP60H76EJ48D5YEMG1.mp4",
  },
  {
    tag: "韦布",
    title: "JWST 持续带来的新发现",
    description: "韦布望远镜正在不断输出系外行星大气与深空结构的光谱数据，让我们对宇宙化学和行星环境有了更深认识。",
    href: "https://science.nasa.gov/mission/webb/",
    tone: "fuchsia",
    mediaType: "image",
    mediaUrl: "https://assets.science.nasa.gov/content/dam/science/missions/webb/science/2019/04/STScI-01G5A807X1CM2RBZKYFK0184YM.jpg/jcr:content/renditions/cq5dam.web.1280.1280.jpeg",
  },
  {
    tag: "NASA Eyes",
    title: "交互式宇宙可视化工具",
    description: "NASA Eyes 可以让你穿越太阳系、悬停在遥远的系外行星上方，并实时追踪正在执行任务的飞行器。",
    href: "https://science.nasa.gov/eyes/",
    tone: "cyan",
    mediaType: "image",
    mediaUrl: "https://assets.science.nasa.gov/content/dam/science/missions/webb/outreach/migrated/2017/STScI-01H8PJ6083PCF4KJ1AYKVVRX8Q.png/jcr:content/renditions/cq5dam.web.1280.1280.png",
  },
  {
    tag: "星系",
    title: "什么是星系",
    description: "星系是由恒星、气体、尘埃与暗物质共同组成的巨大引力系统。银河系直径超过 10 万光年，并且只是本星系群的一员。",
    href: "https://science.nasa.gov/universe/galaxies/",
    tone: "amber",
    mediaType: "image",
    mediaUrl: "https://assets.science.nasa.gov/content/dam/science/missions/webb/science/2019/04/STScI-01G5A807X1CM2RBZKYFK0184YM.jpg/jcr:content/renditions/cq5dam.web.1280.1280.jpeg",
  },
];

export const quickFacts = [
  {
    value: "138 亿年",
    label: "宇宙年龄",
    description: "标准宇宙学模型认为，大爆炸发生在大约 138 亿年前，这也是目前宇宙年龄的主流估计值。",
    href: "https://science.nasa.gov/universe/overview/",
  },
  {
    value: "8 颗",
    label: "太阳系主要行星",
    description: "太阳系共有 8 颗主要行星，另外还有 5 颗被官方认可的矮行星，以及大量卫星和小天体。",
    href: "https://science.nasa.gov/solar-system/planets/",
  },
  {
    value: "1000 亿+",
    label: "银河系恒星数量",
    description: "NASA Science 估计，银河系中的恒星数量至少超过 1000 亿颗，是一个极其庞大的恒星系统。",
    href: "https://science.nasa.gov/universe/stars/",
  },
  {
    value: "1500 光年",
    label: "最近已知黑洞",
    description: "Gaia BH1 是目前发现的最近静默恒星级黑洞之一，与地球相距大约 1500 光年。",
    href: "https://science.nasa.gov/universe/black-holes/",
  },
];

export const sources = [
  { label: "NASA Science 首页", href: "https://science.nasa.gov/" },
  { label: "宇宙总览", href: "https://science.nasa.gov/universe/overview/" },
  { label: "太阳系探索", href: "https://science.nasa.gov/solar-system/" },
  { label: "星系", href: "https://science.nasa.gov/universe/galaxies/" },
  { label: "恒星", href: "https://science.nasa.gov/universe/stars/" },
  { label: "黑洞", href: "https://science.nasa.gov/universe/black-holes/" },
  { label: "NASA 3D 资源库", href: "https://science.nasa.gov/3d-resources/" },
];

