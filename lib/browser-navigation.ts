export const PORTFOLIO_HOME = "/portfolio/";

export function resolveBrowserAddress(input: string): string {
  const value = input.trim();
  if (!value) return PORTFOLIO_HOME;
  if (value === "/portfolio/" || value === "scriblesean.github.io/portfolio/") return PORTFOLIO_HOME;
  if (/^(javascript|data|file|blob|about):/i.test(value)) throw new Error("Enter a website address or search terms.");
  const isAddress = /^https?:\/\//i.test(value) || /^(localhost|[^\s/]+\.[^\s/]+)([:/]|$)/i.test(value);
  if (!isAddress) return `https://www.google.com/search?igu=1&q=${encodeURIComponent(value)}`;
  const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Use an HTTP or HTTPS website.");
  if (url.username || url.password) throw new Error("Use an address without login credentials.");
  if (url.hostname === "google.com" || url.hostname === "www.google.com") {
    url.protocol = "https:";
    url.hostname = "www.google.com";
    if (url.pathname === "/") url.pathname = "/webhp";
    url.searchParams.set("igu", "1");
  }
  return url.href;
}
