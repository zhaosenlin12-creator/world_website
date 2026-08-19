// 部署平台 basePath 处理:
// - Cloudflare Pages: 无前缀
// - GitHub Pages: /world_website 前缀
// 运行时检测 (客户端 + 服务端均安全)

export function assetBase(): string {
  if (typeof window !== "undefined") {
    return window.location.pathname.startsWith("/world_website") ? "/world_website" : "";
  }
  return "";
}

export function publicUrl(path: string): string {
  const base = assetBase();
  return base + path;
}
