import { MissionsView } from "@/components/MissionsView";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "任务 — 宇宙探索者" };

const MISSIONS = [
  { name: "旅行者 1 号", agency: "NASA", status: "active", year: 1977, target: "星际空间", body: "interstellar", desc: "1977 年发射，旅行者 1 号是人类迄今最遥远的使者。在造访木星与土星后，它于 2012 年穿越进入星际空间。如今距地球超过 240 亿公里，仍在从太阳系边界外传回数据。", color: "#a78bfa" },
  { name: "旅行者 2 号", agency: "NASA", status: "active", year: 1977, target: "星际空间", body: "interstellar", desc: "唯一造访过全部四颗气态巨行星——木星、土星、天王星与海王星——的航天器。旅行者 2 号于 2018 年穿越进入星际空间。", color: "#60a5fa" },
  { name: "新视野号", agency: "NASA", status: "active", year: 2006, target: "柯伊伯带", body: "kuiper-belt", desc: "2015 年飞掠冥王星，2019 年飞掠柯伊伯带天体 Arrokoth。如今正继续探索遥远的太阳系。", color: "#fbbf24" },
  { name: "毅力号", agency: "NASA", status: "active", year: 2020, target: "火星 耶泽罗陨石坑", body: "mars", desc: "一辆轿车大小的火星车，正在为未来的样本返回任务采集岩石样本。携带机智号——首架在另一颗星球上飞行的直升机。", color: "#dc2626" },
  { name: "好奇号", agency: "NASA", status: "active", year: 2011, target: "火星 盖尔陨石坑", body: "mars", desc: "研究火星的气候与地质。发现了古老的河床与有机分子的证据。", color: "#f97316" },
  { name: "朱诺号", agency: "NASA", status: "active", year: 2011, target: "木星", body: "jupiter", desc: "研究木星的组成、重力、磁场与深层大气。揭示了巨大的极地气旋。", color: "#d97706" },
  { name: "卡西尼号（2017 年结束）", agency: "NASA / ESA", status: "ended", year: 1997, target: "土星", body: "saturn", desc: "环绕土星 13 年，向土卫六释放了惠更斯探测器，并在坠入土星大气前穿越了土星环。", color: "#eab308" },
  { name: "黎明号（2018 年结束）", agency: "NASA", status: "ended", year: 2007, target: "灶神星与谷神星", body: "asteroid-belt", desc: "首艘环绕两颗地外天体运行的航天器。揭示了谷神星上的明亮盐沉积物与原行星灶神星。", color: "#a3a3a3" },
  { name: "信使号（2015 年结束）", agency: "NASA", status: "ended", year: 2004, target: "水星", body: "mercury", desc: "首艘环绕水星的航天器。绘制了水星的完整表面，并在极地环形山中发现水冰。", color: "#a8a29e" },
  { name: "帕克太阳探测器", agency: "NASA", status: "active", year: 2018, target: "太阳", body: "sun", desc: "比以往任何航天器都更接近太阳。研究日冕、太阳风与磁场。", color: "#fb923c" },
  { name: "贝皮科伦波", agency: "ESA / JAXA", status: "active", year: 2018, target: "水星", body: "mercury", desc: "前往水星的联合任务。途中将研究水星的组成、磁层与地质。", color: "#94a3b8" },
  { name: "露西号", agency: "NASA", status: "active", year: 2021, target: "木星 特洛伊小行星", body: "jupiter", desc: "首项造访木星特洛伊小行星的任务——这些是被木星引力束缚的早期太阳系化石。", color: "#fbbf24" },
  { name: "灵神星任务", agency: "NASA", status: "active", year: 2023, target: "灵神星 (16 Psyche)", body: "asteroid-belt", desc: "前往一颗富含金属的小行星——可能是一颗远古原行星裸露的核心。", color: "#fb923c" },
  { name: "欧罗巴快船", agency: "NASA", status: "active", year: 2024, target: "木卫二", body: "jupiter", desc: "研究木星冰封的卫星木卫二及其地下海洋——太阳系内最有希望找到地外生命的地方之一。", color: "#22d3ee" },
  { name: "阿尔忒弥斯二号", agency: "NASA", status: "upcoming", year: 2025, target: "月球", body: "earth", desc: "1972 年以来首次载人绕月任务。将环绕月球飞行后返回地球。", color: "#ffffff" },
  { name: "火星样本返回", agency: "NASA / ESA", status: "upcoming", year: 2030, target: "火星", body: "mars", desc: "将毅力号采集的样本送回地球。来自另一颗行星的首次样本返回任务。", color: "#dc2626" }
];

export default function Page() {
  return <MissionsView missions={MISSIONS} />;
}
