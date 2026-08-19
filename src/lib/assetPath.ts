/// 部署平台 basePath 处理:
/// - Cloudflare Pages: 无前缀
/// - GitHub Pages: /world_website 前缀
/// - SSR 时按 process.env.GITHUB_PAGES 决定, 避免 hydration 时图片 src 已经是裸路径
/// - 客户端通过 window.location.pathname 动态检测, 兼容两种部署

const ENV_BASE =
  typeof process !== "undefined" && process.env && process.env.GITHUB_PAGES === "true"
    ? "/world_website"
    : "";

export function assetBase(): string {
  if (typeof window !== "undefined") {
    return window.location.pathname.startsWith("/world_website") ? "/world_website" : "";
  }
  return ENV_BASE;
}

export function publicUrl(path: string): string {
  const base = assetBase();
  return base + path;
}