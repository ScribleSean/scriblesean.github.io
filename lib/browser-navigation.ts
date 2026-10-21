export const PORTFOLIO_HOME = "/portfolio/";

export function resolveBrowserAddress(input: string): string {
  const value = input.trim();
  if (!value) return PORTFOLIO_HOME;
  if (value === "/portfolio/" || value === "scriblesean.github.io/portfolio/") return PORTFOLIO_HOME;
  if (/^(javascript|data|file|blob|about):/i.test(value)) throw new Error("Enter a website address or search terms.");
  const isAddress = /^https?:\/\//i.test(value) || /^(localhost|[^\s/]+\.[^\s/]+)([:/]|$)/i.test(value);
  if (!isAddress) return `https://www.google.com/search?q=${encodeURIComponent(value)}`;
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    // For example "https://" alone, which new URL rejects with a raw TypeError.
    throw new Error("Enter a complete website address, like example.com.");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Use an HTTP or HTTPS website.");
  if (url.username || url.password) throw new Error("Use an address without login credentials.");
  if (url.hostname === "scriblesean.github.io" && /^\/portfolio\/?$/.test(url.pathname)) return PORTFOLIO_HOME;
  return url.href;
}
