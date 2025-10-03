// lib/crawl.ts
import * as cheerio from "cheerio";
import { extract } from "@extractus/article-extractor";
import { request } from "undici";

export type Page = { url: string; content: string };

async function fetchHtml(url: string) {
  const res = await request(url);
  if (res.statusCode !== 200) throw new Error(`Failed ${url}: ${res.statusCode}`);
  return await res.body.text();
}

export async function crawlSeed(url: string, maxLinks = 5): Promise<Page[]> {
  const pages: Page[] = [];
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  const art = await extract(url).catch(() => null);
  pages.push({ url, content: art?.content ?? $("body").text() });

  const origin = new URL(url).origin;
  const links = new Set<string>();
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const abs = new URL(href, url).href;
    if (abs.startsWith(origin)) links.add(abs);
  });

  for (const link of Array.from(links).slice(0, maxLinks)) {
    try {
      const h = await fetchHtml(link);
      const $$ = cheerio.load(h);
      const art2 = await extract(link).catch(() => null);
      const content = art2?.content ?? $$("body").text();
      pages.push({ url: link, content });
    } catch {}
  }
  return pages;
}
