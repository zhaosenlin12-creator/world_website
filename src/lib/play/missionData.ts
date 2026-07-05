export type PlanetId =
  | "mercury"
  | "venus"
  | "earth"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune";

export type SurfaceNode = {
  id: string;
  label: string;
  x: number;
  y: number;
};

export type SurfaceHazard = {
  id: string;
  label: string;
  x: number;
  y: number;
  radius: number;
  amplitude: number;
  speed: number;
  axis: "x" | "y";
};

export type MissionQuiz = {
  question: string;
  options: string[];
  answer: number;
  fact: string;
};

export type MissionType =
  | "thermalSurvey"
  | "atmosphericDrill"
  | "orbitalScan"
  | "dustCrossing"
  | "gravitySlingshot"
  | "ringTraversal"
  | "rollLanding"
  | "windRun";

export type EnvironmentTuning = {
  atmosphereColor: string;
  fogDensity: number;
  gravity: number;
  hazardSpeed: number;
  tilt: number;
  rolling: boolean;
  wind: number;
  primarySample: string;
  missionType: MissionType;
  hint: string;
};

export type MissionDefinition = {
  title: string;
  codename: string;
  summary: string;
  briefing: string;
  flightGoal: string;
  landingGoal: string;
  surfaceGoal: string;
  reward: string;
  hazards: string[];
  highlights: string[];
  surfaceNodes: SurfaceNode[];
  surfaceHazards: SurfaceHazard[];
  quiz: MissionQuiz;
  environment: EnvironmentTuning;
};

export const PLANET_ORDER: PlanetId[] = [
  "mercury",
  "venus",
  "earth",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
];

export const COLLECT_KIND_LABEL: Record<string, string> = {
  star: "恒星样本",
  crystal: "晶体样本",
  ankh: "地层样本",
  ruby: "高温矿样",
  apple: "生态样本",
  sample: "地表信标",
};

export const missionData: Record<PlanetId, MissionDefinition> = {
  mercury: {
    title: "水星晨昏带勘测",
    codename: "MR-01",
    summary: "在强烈昼夜温差下穿越近地轨道，寻找晨昏带稳定区域并回收热流数据。",
    briefing: "水星靠近太阳，飞行窗口极短。你需要先完成高速接近，再穿过灼热边界，最后在岩质残骸区建立临时采样链路。",
    flightGoal: "保持飞船稳定，沿狭窄窗口接近晨昏带轨道。",
    landingGoal: "踩住漂移残骸逐层缓降，避开高温碎石。",
    surfaceGoal: "回收 3 处热异常信标，并返回上行中继点。",
    reward: "解锁水星核心样本与热流档案。",
    hazards: ["太阳辐射", "高速碎石", "温差冲击"],
    highlights: ["目标轨道最短", "昼夜温差极大", "着陆窗口极窄"],
    surfaceNodes: [
      { id: "a", label: "热裂谷", x: 22, y: 66 },
      { id: "b", label: "晨昏断层", x: 48, y: 42 },
      { id: "c", label: "金属反光区", x: 78, y: 60 },
    ],
    surfaceHazards: [
      { id: "h1", label: "辐射锋面", x: 34, y: 26, radius: 7, amplitude: 12, speed: 0.9, axis: "x" },
      { id: "h2", label: "熔蚀喷发", x: 70, y: 74, radius: 6, amplitude: 10, speed: 1.1, axis: "y" },
    ],
      environment: {
        atmosphereColor: "#fb923c",
        fogDensity: 0.012,
        gravity: 0.38,
        hazardSpeed: 1.6,
        tilt: 0,
        rolling: false,
        wind: 0,
        primarySample: "水星极地冰芯样本",
        missionType: "thermalSurvey",
        hint: "保持飞船与最近陨石带保持垂直间距，靠近时触发热测绘窗口。"
      },
    quiz: {
      question: "水星绕太阳一圈约需要多久？",
      options: ["58 地球日", "88 地球日", "176 地球日", "365 地球日"],
      answer: 1,
      fact: "水星是太阳系公转最快的行星，只需约 88 个地球日就能绕太阳一周。"
    }
  },
  venus: {
    title: "金星云顶窗口穿越",
    codename: "VS-02",
    summary: "在厚重的二氧化碳云层之上建立勘测航路，追踪电闪云暴与高温涡旋。",
    briefing: "金星地表并不适合长期停留，所以任务重点是利用短暂窗口完成轨道接近、缓降侦测和云顶信标采集。",
    flightGoal: "穿过密集干扰流，锁定金星高层大气观测窗。",
    landingGoal: "在漂移碎块和炽热扰动中完成减速，进入稳定勘测层。",
    surfaceGoal: "扫描 3 处酸性云暴边缘，上传气象剖面。",
    reward: "解锁金星高层风场模型。",
    hazards: ["酸雾扰动", "高温气旋", "雷暴放电"],
    highlights: ["最热行星", "反向自转", "二氧化碳厚大气"],
    surfaceNodes: [
      { id: "a", label: "云暴边缘", x: 20, y: 52 },
      { id: "b", label: "酸雾脊线", x: 52, y: 30 },
      { id: "c", label: "闪电回波点", x: 76, y: 66 },
    ],
    surfaceHazards: [
      { id: "h1", label: "酸雾团", x: 35, y: 68, radius: 6, amplitude: 14, speed: 1.2, axis: "x" },
      { id: "h2", label: "热浪剪切", x: 72, y: 36, radius: 7, amplitude: 9, speed: 0.85, axis: "y" },
    ],
      environment: {
        atmosphereColor: "#facc15",
        fogDensity: 0.032,
        gravity: 0.9,
        hazardSpeed: 0.7,
        tilt: 0,
        rolling: false,
        wind: 1.4,
        primarySample: "硫酸云化学微粒样本",
        missionType: "atmosphericDrill",
        hint: "穿越厚云层时护盾会被酸雾侵蚀，主动寻找酸云缝隙。"
      },
    quiz: {
      question: "下面哪项不适用于金星？",
      options: ["太阳系最热行星", "拥有厚厚二氧化碳大气", "位于地球轨道之外", "自转方向与多数行星相反"],
      answer: 2,
      fact: "金星位于地球轨道内侧，是太阳系最热的行星，并且自转方向与大多数行星相反。"
    }
  },
  earth: {
    title: "地球蓝境校准任务",
    codename: "EA-03",
    summary: "在熟悉却珍贵的蓝色世界完成近地校准，验证生命行星的轨道与环境基准。",
    briefing: "地球任务是整套系统的基准关卡。你将以更平稳的节奏完成接近、降落和地表样本采集，理解这颗蓝色家园为何独特。",
    flightGoal: "沿标准近地航路稳定推进，避开轨道碎片。",
    landingGoal: "在大气层与残骸链路中精确减速，安全落入采样区。",
    surfaceGoal: "采集海洋、磁层与生命迹象 3 组基准信号。",
    reward: "解锁地球生命支持基准档案。",
    hazards: ["近地碎片", "磁暴扰动", "高速云层"],
    highlights: ["液态水丰富", "氧气大气", "已知唯一生命行星"],
    surfaceNodes: [
      { id: "a", label: "磁层站", x: 24, y: 58 },
      { id: "b", label: "海洋回波点", x: 51, y: 34 },
      { id: "c", label: "生命信号桩", x: 80, y: 62 },
    ],
    surfaceHazards: [
      { id: "h1", label: "高空风切", x: 38, y: 40, radius: 6, amplitude: 10, speed: 0.8, axis: "x" },
      { id: "h2", label: "电离层扰动", x: 68, y: 72, radius: 7, amplitude: 12, speed: 0.95, axis: "y" },
    ],
      environment: {
        atmosphereColor: "#67e8f9",
        fogDensity: 0.006,
        gravity: 1,
        hazardSpeed: 0.85,
        tilt: 0,
        rolling: false,
        wind: 0.4,
        primarySample: "近地轨道等离子样本",
        missionType: "orbitalScan",
        hint: "跟随 4 颗引导卫星跳跃点切换轨道，分批回收信号塔。"
      },
    quiz: {
      question: "地球大气中氧气的体积分数大约是多少？",
      options: ["21%", "35%", "58%", "78%"],
      answer: 0,
      fact: "地球大气主要由氮气和氧气构成，其中氧气约占 21%，是复杂生命繁衍的重要条件。"
    }
  },
  mars: {
    title: "火星风暴穿越任务",
    codename: "MS-04",
    summary: "穿越火星接近航路、小行星碎带和大气层边缘，在沙暴来临前完成地表样本回收。",
    briefing: "火星任务会更强调游戏性：先飞船躲避障碍，再完成下降挑战，最后在风暴中寻找异常点与古水迹象。",
    flightGoal: "冲过陨石与碎环交织的接近区，稳定锁定火星着陆航线。",
    landingGoal: "沿漂移陨石与残骸逐级缓降，避免碎裂平台与火焰尾流。",
    surfaceGoal: "穿过沙暴带，回收 3 处古水线索并返回着陆点。",
    reward: "解锁火星样本与古环境档案。",
    hazards: ["沙尘暴", "陨石带", "稀薄大气热冲击"],
    highlights: ["奥林匹斯山", "古代水迹", "人类重点探索目标"],
    surfaceNodes: [
      { id: "a", label: "干涸河道", x: 18, y: 68 },
      { id: "b", label: "沉积扇", x: 48, y: 38 },
      { id: "c", label: "矿物脊线", x: 78, y: 56 },
    ],
    surfaceHazards: [
      { id: "h1", label: "横向沙暴", x: 32, y: 52, radius: 8, amplitude: 16, speed: 1.15, axis: "x" },
      { id: "h2", label: "落石区", x: 68, y: 34, radius: 7, amplitude: 12, speed: 0.9, axis: "y" },
    ],
      environment: {
        atmosphereColor: "#fb7185",
        fogDensity: 0.022,
        gravity: 0.38,
        hazardSpeed: 0.9,
        tilt: 0,
        rolling: false,
        wind: 0.8,
        primarySample: "奥林匹斯山熔岩管化石样本",
        missionType: "dustCrossing",
        hint: "沙尘暴会随机降能见度，沿火山口信标前进。"
      },
    quiz: {
      question: "奥林匹斯山在火星上代表什么？",
      options: ["古代河流", "太阳系最高的山", "火星第一基地", "最大撞击坑"],
      answer: 1,
      fact: "奥林匹斯山高约 22 公里，是太阳系已知最高的火山和山体。"
    }
  },
  jupiter: {
    title: "木星风暴边界取样",
    codename: "JP-05",
    summary: "在巨行星的强引力环境下保持飞行稳定，避开风暴云墙并提取高层大气样本。",
    briefing: "木星体积巨大，接近时视觉压迫感最强。你需要在快速推进中顶住重力与风暴的双重干扰。",
    flightGoal: "沿木星外层风暴边缘完成高速穿越，避免被乱流拉偏。",
    landingGoal: "利用漂浮残骸减速，进入高层观测平台。",
    surfaceGoal: "回收 3 处风暴回声并传回大红斑边缘数据。",
    reward: "解锁木星风暴与磁场档案。",
    hazards: ["强引力拖拽", "高压风暴", "闪电云墙"],
    highlights: ["太阳系最大行星", "大红斑风暴", "卫星众多"],
    surfaceNodes: [
      { id: "a", label: "赤道云塔", x: 20, y: 60 },
      { id: "b", label: "风暴眼回声", x: 50, y: 30 },
      { id: "c", label: "磁暴边界", x: 82, y: 58 },
    ],
    surfaceHazards: [
      { id: "h1", label: "云暴回卷", x: 34, y: 30, radius: 8, amplitude: 12, speed: 0.92, axis: "y" },
      { id: "h2", label: "乱流带", x: 72, y: 66, radius: 7, amplitude: 18, speed: 1.05, axis: "x" },
    ],
      environment: {
        atmosphereColor: "#fbbf24",
        fogDensity: 0.018,
        gravity: 2.2,
        hazardSpeed: 1.1,
        tilt: 0,
        rolling: true,
        wind: 2.4,
        primarySample: "大红斑深层气旋样本",
        missionType: "gravitySlingshot",
        hint: "借力大红斑的引力漩涡完成 2 次环绕跳跃。"
      },
    quiz: {
      question: "木星的大红斑本质上是什么？",
      options: ["新生行星核心", "持续数百年的巨型风暴", "木星最大卫星", "金属海洋入口"],
      answer: 1,
      fact: "大红斑是一场持续了数百年的反气旋风暴，尺度比地球还大。"
    }
  },
  saturn: {
    title: "土星环穿越校验",
    codename: "ST-06",
    summary: "在土星环碎片与环缝之间维持航路稳定，完成冰粒与尘埃信号采样。",
    briefing: "土星的美感来自环系，但这也意味着更复杂的障碍布局。你需要在环缝与碎冰间挑选最稳妥的下降路径。",
    flightGoal: "沿土星环缝穿行，避开密集冰粒与倾斜碎带。",
    landingGoal: "踩住漂移冰岩与飞船残骸进入终端减速区。",
    surfaceGoal: "收集 3 处环粒信号，建立环缝剖面图。",
    reward: "解锁土星环观测档案。",
    hazards: ["冰粒碎带", "环缝剪切", "冷凝尘暴"],
    highlights: ["著名环系", "冰粒与岩石碎片", "泰坦等大型卫星"],
    surfaceNodes: [
      { id: "a", label: "环缝 A", x: 22, y: 62 },
      { id: "b", label: "冰粒回声", x: 50, y: 34 },
      { id: "c", label: "尘埃潮汐", x: 78, y: 58 },
    ],
    surfaceHazards: [
      { id: "h1", label: "碎冰漂移", x: 36, y: 54, radius: 7, amplitude: 14, speed: 0.82, axis: "x" },
      { id: "h2", label: "冷凝乱流", x: 70, y: 28, radius: 6, amplitude: 10, speed: 1.08, axis: "y" },
    ],
      environment: {
        atmosphereColor: "#fde68a",
        fogDensity: 0.014,
        gravity: 1.1,
        hazardSpeed: 1,
        tilt: 0,
        rolling: false,
        wind: 0.6,
        primarySample: "土星环冰质碎屑样本",
        missionType: "ringTraversal",
        hint: "穿过环带的窄间隙窗口拾取冰样本，注意粒子侵蚀护盾。"
      },
    quiz: {
      question: "土星环主要由什么组成？",
      options: ["气体与云层", "冰与岩石碎片", "液态甲烷", "金属薄片"],
      answer: 1,
      fact: "土星环由大量冰粒、岩石碎片和尘埃构成，颗粒尺度差异极大。"
    }
  },
  uranus: {
    title: "天王星侧轴冰层探测",
    codename: "UR-07",
    summary: "在侧身自转的冰巨星周围建立航路，回收高层冰雾与倾角观测数据。",
    briefing: "天王星任务强调姿态变化与环境色调的独特性。你会看到一颗仿佛横卧在轨道上的青蓝世界。",
    flightGoal: "穿过倾斜轨道乱流，保持飞船姿态稳定。",
    landingGoal: "在冰雾碎屑间缓降，避开低温脆裂区。",
    surfaceGoal: "采集 3 组倾轴观测信号，并回传冰雾剖面。",
    reward: "解锁天王星侧轴模型。",
    hazards: ["倾斜乱流", "冰雾脆裂", "低温风剪"],
    highlights: ["近乎侧躺自转", "冰巨星", "极冷环境"],
    surfaceNodes: [
      { id: "a", label: "倾轴回波", x: 24, y: 56 },
      { id: "b", label: "冰雾层界", x: 48, y: 28 },
      { id: "c", label: "极区折线", x: 80, y: 62 },
    ],
    surfaceHazards: [
      { id: "h1", label: "冰晶雨", x: 38, y: 34, radius: 6, amplitude: 12, speed: 1.02, axis: "y" },
      { id: "h2", label: "侧轴乱流", x: 68, y: 66, radius: 7, amplitude: 16, speed: 0.88, axis: "x" },
    ],
      environment: {
        atmosphereColor: "#22d3ee",
        fogDensity: 0.012,
        gravity: 0.92,
        hazardSpeed: 1.05,
        tilt: 1.4,
        rolling: true,
        wind: 1.2,
        primarySample: "冰巨星甲烷晶体样本",
        missionType: "rollLanding",
        hint: "侧向引力使飞船持续滚动，依靠左右推进抵消倾角。"
      },
    quiz: {
      question: "天王星最独特的自转特征是什么？",
      options: ["没有自转", "约 98° 倾角侧身自转", "与太阳同步自转", "每天反复翻滚"],
      answer: 1,
      fact: "天王星的自转轴几乎躺平，约 98° 的倾角让它成为太阳系最特别的行星之一。"
    }
  },
  neptune: {
    title: "海王星风暴边疆任务",
    codename: "NP-08",
    summary: "在遥远而寒冷的海王星外缘完成最终任务，穿越最快风暴并回收深蓝边疆信号。",
    briefing: "这是整条主线的最终行星。距离最远、风暴最烈，视觉和难度都会更具压迫感，完成后才会进入最终科学考验。",
    flightGoal: "抵抗极端风暴与低可见度，在深空边缘维持航线。",
    landingGoal: "在高速碎屑与风暴尾迹中精准减速，完成终端着陆。",
    surfaceGoal: "收集 3 个深蓝风暴信号并返回主控中继。",
    reward: "解锁海王星边疆档案与终章样本。",
    hazards: ["超高速风暴", "低温乱流", "深空碎屑"],
    highlights: ["太阳系最远行星", "风速极高", "深蓝风暴系统"],
    surfaceNodes: [
      { id: "a", label: "深蓝风眼", x: 18, y: 62 },
      { id: "b", label: "寒流断带", x: 50, y: 32 },
      { id: "c", label: "极夜回波", x: 80, y: 58 },
    ],
    surfaceHazards: [
      { id: "h1", label: "黑斑风墙", x: 34, y: 36, radius: 8, amplitude: 14, speed: 1.15, axis: "y" },
      { id: "h2", label: "极寒碎流", x: 72, y: 70, radius: 7, amplitude: 18, speed: 0.96, axis: "x" },
    ],
      environment: {
        atmosphereColor: "#3b82f6",
        fogDensity: 0.024,
        gravity: 1.12,
        hazardSpeed: 1.6,
        tilt: 0,
        rolling: false,
        wind: 3.2,
        primarySample: "极地超音速暴风样本",
        missionType: "windRun",
        hint: "逆风带的强劲气流会推偏航线，提前按反方向键修正。"
      },
    quiz: {
      question: "海王星的大黑斑是什么类型的现象？",
      options: ["巨型火山口", "反气旋风暴", "永恒极夜阴影", "卫星投影"],
      answer: 1,
      fact: "海王星的大黑斑是一种反气旋风暴，伴随极强的高空风速。"
    }
  }
};
