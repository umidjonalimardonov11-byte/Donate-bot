const FAMILIES = [
  ['Mobile Legends', /^(?:mobile\s+legends(?:\s*:\s*bang\s*bang|\s+bang\s*bang)?|mlbb)(?=$|\s|[-:(])/i],
  ['PUBG Mobile', /^(?:pubg\s+mobile|pubgm)(?=$|\s|[-:(])/i],
  ['Free Fire', /^free\s+fire(?:\s+max)?(?=$|\s|[-:(])/i],
  ['Honor of Kings', /^honor\s+of\s+kings(?=$|\s|[-:(])/i],
  ['Genshin Impact', /^genshin\s+impact(?=$|\s|[-:(])/i],
  ['Call of Duty Mobile', /^call\s+of\s+duty\s*(?::\s*)?mobile(?=$|\s|[-:(])/i],
  ['Honkai: Star Rail', /^honkai\s*:?\s*star\s+rail(?=$|\s|[-:(])/i],
  ['Clash of Clans', /^clash\s+of\s+clans(?=$|\s|[-:(])/i],
  ['Clash Royale', /^clash\s+royale(?=$|\s|[-:(])/i],
  ['Brawl Stars', /^brawl\s+stars(?=$|\s|[-:(])/i],
  ['Roblox', /^roblox(?=$|\s|[-:(])/i],
  ['Valorant', /^valorant(?=$|\s|[-:(])/i],
];
const REGION = /^(?:(?:global|worldwide|international|indonesia|indonesian|malaysia|singapore|philippines|brazil|turkey|russia|europe|usa|united states|vietnam|thailand|taiwan|hong kong|japan|korea|india|cambodia|myanmar|bangladesh|pakistan|mena|sea|cis|latam|na|eu|ru|id|br|tr|ph|sg|my|us|vn|th|tw|hk|jp|kr|in|bd|mm|kh|pk|all|other|region|server|servers|regions|only|except|excluding|exclusive|official|direct|top[ -]?up|diamonds|uc|instant|fast|slow|normal|discount|promo|special|double|bonus|weekly|monthly|pass|subscription|pack|packs|package|packages|[a-z]{2})\b|[\s,./&+()\[\]:–—-]|\d)+$/i;
const OTHER = /telegram|stars|premium|steam|gift|card|spotify|netflix|discord|apple|itunes|google play|chatgpt|youtube|xbox|playstation|psn|nitro|wallet|voucher|подар|карт/i;

export function identifyGame(item) {
  const name = String(item.name || item.slug || '').replace(/\s+/g, ' ').trim();
  const kind = item.kind || (OTHER.test(name) ? 'other' : 'game');
  if (kind === 'other') {
    // Regional Steam wallets (Steam Wallet (US), (TR) ...) live inside one Steam card.
    const steam = name.match(/^steam(?:\s+wallet)?(?:\s*(?:\(([^)]+)\)|[-–—:]\s*(.+)))?$/i);
    if (steam) return { key: 'other:steam', name: 'Steam', region: (steam[1] || steam[2] || 'Global').trim(), kind };
    return { key: `other:${item.slug}`, name, region: name, kind };
  }
  for (const [title, pattern] of FAMILIES) {
    const match = name.match(pattern);
    if (!match) continue;
    const suffix = name.slice(match[0].length).replace(/^[\s\-–—:([\]]+|[\s)\]]+$/g, '').trim();
    // Unknown subtitles (e.g. Adventure) are separate games, not regions.
    if (suffix && !REGION.test(suffix)) continue;
    return { key: `game:${title.toLowerCase()}`, name: title, region: suffix || 'Global', kind };
  }
  // Group an unfamiliar game only when its suffix is a recognized region.
  const match = name.match(/^(.+?)\s*(?:\(([^)]+)\)|\[([^\]]+)\]|\s[-–—:]\s(.+))$/);
  if (match && REGION.test(match[2] || match[3] || match[4] || '')) {
    const title = match[1].trim();
    return { key: `game:${title.toLowerCase()}`, name: title, region: match[2] || match[3] || match[4], kind };
  }
  return { key: `game:${name.toLowerCase()}`, name, region: name, kind };
}

export function groupGames(items) {
  const groups = new Map();
  for (const item of items) {
    if (!item?.slug) continue;
    const family = identifyGame(item);
    let group = groups.get(family.key);
    if (!group) {
      group = { ...item, name: family.name, kind: family.kind, variants: [], orders: 0 };
      groups.set(family.key, group);
    }
    if (group.variants.some((v) => v.slug === item.slug)) continue;
    group.variants.push({ ...item, region: family.region });
    group.image ||= item.image;
    group.top ||= item.top;
    group.orders += Number(item.orders) || 0;
  }
  for (const group of groups.values()) {
    const labels = group.variants.map((v) => v.region.toLowerCase());
    for (const variant of group.variants) {
      if (labels.filter((label) => label === variant.region.toLowerCase()).length > 1) variant.region += ` · ${variant.slug}`;
    }
  }
  return [...groups.values()];
}
