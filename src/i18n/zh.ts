// 中文语言包
export const zh = {
  // Site
  siteName: "宇宙探索",
  siteTagline: "EXPLORER",
  nav: {
    home: "首页",
    explorer: "3D 探索",
    planets: "行星",
    stories: "故事",
    facts: "数据",
    missions: "任务",
    resources: "资源",
    about: "关于"
  },
  buttons: {
    launch3d: "启动 3D",
    browsePlanets: "浏览行星",
    reset: "重置",
    open: "打开",
    explore: "探索",
    read: "阅读",
    discover: "发现"
  },
  // Hero
  hero: {
    eyebrow: "欢迎来到宇宙",
    titleA: "一段精心策划的旅程",
    titleB: "穿越我们的太阳系",
    desc: "八颗行星、数百颗卫星、以及数十亿颗冰封的旅行者。踏入电影感的 3D 宇宙，学习科学知识，跟随改写人类认知的探测任务。",
    stats: {
      planets: "颗行星",
      dwarfs: "颗矮行星",
      moons: "颗卫星",
      asteroids: "颗小行星"
    }
  },
  // Loader
  loader: "正在校准宇宙…",
  // Marquee
  marquee: {
    sunMercury: "太阳 → 水星：5800 万公里",
    sunEarth: "太阳 → 地球：1.5 亿公里",
    sunNeptune: "太阳 → 海王星：45 亿公里",
    voyager1: "旅行者 1 号：240 亿公里外",
    andromeda: "仙女座逼近：45 亿年",
    observable: "可观测宇宙：930 亿光年",
    milkyway: "银河系恒星：1000-4000 亿",
    sunLight: "阳光到达地球：8 分 20 秒"
  },
  // Planets grid
  planetsSection: {
    eyebrow: "八大世界",
    title: "我们太阳系的行星",
    desc: "从被太阳炙烤的水星，到狂风呼啸的海王星——每一颗行星都在诉说着不同的世界形成故事，也让我们珍视这颗淡蓝星辰的独特。"
  },
  // Feature belt
  feature: {
    eyebrow: "特性",
    feat1: {
      title: "交互式 3D 太阳系",
      desc: "旋转镜头，点击任意行星，跟随它们的轨道。基于 Three.js 构建的实时浏览器内模拟。"
    },
    feat2: {
      title: "任务故事与发现",
      desc: "旅行者号的伟大旅程、毅力号探测火星、新视野号飞掠冥王星、詹姆斯·韦伯太空望远镜——背景与影响。"
    },
    feat3: {
      title: "外太阳系",
      desc: "海王星之外：柯伊伯带、矮行星以及奥尔特云——太阳系隐藏的边界。"
    }
  },
  // What's up
  whatsup: {
    eyebrow: "本月星空",
    title: "观星指南",
    desc: "没有望远镜？没关系。这里列出了用肉眼、双筒望远镜或家用望远镜本季能看到的景象。",
    cards: {
      tonight: { date: "今晚", title: "国际空间站", body: "一颗明亮、匀速移动的星。每天可见 4-6 次。查询 Heavens-Above 获取过境时间。" },
      july4: { date: "7 月 4 日", title: "地球到达远日点", body: "地球到达距太阳最远点——1.52 亿公里。四季与距离无关。" },
      july21: { date: "7 月 21 日", title: "满月（雄鹿月）", body: "7 月满月在日落时升起。请在后半夜的星空中寻找满月附近的土星。" }
    }
  },
  // Stories
  stories: {
    eyebrow: "文章与新闻",
    title: "来自太阳系的故事",
    desc: "精选自 NASA 科学任务理事会——发现、任务更新以及头条背后的科学。",
    searchPlaceholder: "搜索故事…",
    empty: "没有匹配 \"{q}\" 的故事。",
    allStories: "全部故事"
  },
  // Facts
  facts: {
    eyebrow: "数字说话",
    title: "数据与数字",
    desc: "排序、比较、探索。点击列标题即可排序。",
    columns: {
      body: "天体",
      type: "类型",
      order: "顺序",
      diameter: "直径（km）",
      distance: "距离（AU）",
      day: "日长（小时）",
      year: "年长（天）",
      moons: "卫星"
    },
    bigStats: {
      age: { k: "46 亿年", v: "太阳系年龄" },
      orbit: { k: "约 24,000", v: "年（绕银心一周）" },
      sunSpeed: { k: "220 km/s", v: "太阳绕银河速度" }
    }
  },
  // Missions
  missions: {
    eyebrow: "机器人与载人探测",
    title: "任务",
    desc: "过去、现在与未来的航天器——塑造了我们对太阳系理解的使者。",
    active: "进行中",
    upcoming: "即将开展",
    ended: "已完成",
    live: "活跃",
    future: "未来",
    past: "历史"
  },
  // Resources
  resources: {
    eyebrow: "为学习者与教育者",
    title: "资源库",
    desc: "教学计划、活动、可打印图形、3D 模型，以及精选的太阳系资源包。"
  },
  // About
  about: {
    eyebrow: "关于本项目",
    title: "宇宙探索者",
    intro: "宇宙探索者是一个交互式、电影感的太阳系之旅。它是一个教育性粉丝项目，将 NASA 科学任务理事会的公有领域内容重新组织并重新呈现，提供现代、动效丰富的网页体验。",
    whatsInside: "项目亮点",
    stack: "技术栈",
    credits: "致谢",
    dataSources: "数据来源",
    bullets: [
      "一个可旋转、点击、缩放的 3D 太阳系——基于 Three.js 和 @react-three/fiber 构建。",
      "由 Framer Motion 驱动的电影感滚动和过渡动效。",
      "具有视差、闪烁和流星的交互式星空背景，使用 2D 画布渲染。",
      "每个行星、矮行星、小行星带、柯伊伯带和奥尔特云的专属详情页。",
      "资源库、任务时间线以及可排序的数据表。"
    ],
    sources: "所有文本、图片和结构化数据均来自 NASA 开放科学档案。文章内容来自 science.nasa.gov/solar-system。3D 太阳系数据——包括物理参数、轨道根数和大气组成——源自 NASA 公开的事实清单。",
    stackList: [
      "Next.js 14 + App Router",
      "TypeScript + Tailwind CSS",
      "Three.js（3D 渲染）",
      "Framer Motion（UI 动效）",
      "Scrapling（数据采集）"
    ],
    creditsText: "原始内容 © NASA。所有商标、徽标和品牌名称均属其各自所有者。本项目与 NASA 无关，也未得到其认可。"
  },
  // Planets index
  planetsIndex: {
    eyebrow: "全部世界",
    title: "行星与更多",
    desc: "八颗行星、五颗官方承认的矮行星，以及更远的冰封世界。点击一个天体即可深入了解。",
    sections: {
      planets: "行星",
      dwarfs: "矮行星",
      regions: "区域"
    }
  },
  // Planet detail
  planetDetail: {
    about: "关于 {name}",
    didYouKnow: "你知道吗？",
    fromNasa: "来自 NASA",
    readOnNasa: "在 NASA.gov 上阅读 →",
    openIn3d: "在 3D 探索中打开",
    related: "相关世界",
    dragRotate: "拖动旋转",
    moons: "颗卫星",
    noMoons: "无卫星",
    nasaColors: "NASA 衍生配色"
  },
  // Body panel (explorer)
  panel: {
    about: "关于",
    atmosphere: "大气",
    didYouKnow: "你知道吗？",
    fromNasa: "来自 NASA",
    close: "关闭"
  },
  // Explorer
  explorer: {
    hint: "点击行星聚焦 · 拖动旋转 · 滚轮缩放",
    speed: "速度",
    orbits: "轨道",
    labels: "标签",
    paused: "暂停",
    play: "播放"
  },
  // Stats labels
  stat: {
    diameter: "直径",
    mass: "质量",
    surfaceGravity: "表面重力",
    day: "日长",
    year: "年长",
    distance: "距日距离",
    axialTilt: "轴倾角",
    temperature: "温度",
    composition: "组成",
    moons: "卫星"
  },
  // Body types
  type: {
    star: "恒星",
    planet: "行星",
    dwarf: "矮行星",
    moon: "卫星",
    asteroid: "小行星",
    comet: "彗星",
    belt: "区域"
  },
  // Footer
  footer: {
    aboutTitle: "宇宙探索者",
    aboutDesc: "一段精心策划的太阳系电影之旅。所有内容均来自 NASA 公有领域素材，并经过重新渲染以提供交互式学习体验。",
    exploreCol: "探索",
    learnCol: "学习",
    dataCol: "数据与图像",
    dataDesc: "所有文本和图像来自 NASA 科学任务理事会，按其公有领域政策使用。已重新组织以提供交互式学习体验。",
    original: "原 NASA 站点 →",
    copyright: "© {year} 宇宙探索者。教育性粉丝项目。",
    built: "使用 Next.js · Three.js · Framer Motion 构建"
  }
};
