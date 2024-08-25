import { parse } from "https://deno.land/x/xml@5.4.13/mod.ts";
import { ensureDir } from "https://deno.land/std@0.224.0/fs/ensure_dir.ts";
import { join, basename } from "https://deno.land/std@0.224.0/path/mod.ts"

const rssUrl = "https://zenn.dev/codehex/feed";
const outputDir = './src/content/zenn'

interface FeedItem {
  title: string;
  pubDatetime: string;
  link: string;
}

async function fetchRSSFeed(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
  }
  return await response.text();
}

function parseXML(xml: string): FeedItem[] {
  const result = parse(xml);
  const items = result.rss.channel.item;
  return items.map((item: any) => ({
    title: item.title,
    pubDatetime: convertToISO8601(item.pubDate),
    link: item.link,
  }));
}

function convertToISO8601(pubDate: string): string {
  const date = new Date(pubDate);
  return date.toISOString();
}

async function writeItemToFile(item: FeedItem, outputDir: string): Promise<void> {
  const fileName = basename(item.link) + ".json";
  const filePath = join(outputDir, fileName);
  await Deno.writeTextFile(filePath, JSON.stringify(item));
}

async function processItems(items: FeedItem[]): Promise<void> {
  await ensureDir(outputDir);

  for (const item of items) {
    await writeItemToFile(item, outputDir);
  }
}

async function main() {
  try {
    const xmlContent = await fetchRSSFeed(rssUrl);
    const items = parseXML(xmlContent);
    await processItems(items)
    console.log(`Feed successfully updated and saved to ${outputDir}`);
  } catch (error) {
    console.error('Error processing feed:', error);
  }
}

await main();