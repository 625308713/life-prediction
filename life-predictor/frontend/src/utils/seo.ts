type SeoOptions = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  robots?: string;
  type?: "website" | "article";
};

function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return new URL(path, window.location.origin).toString();
}

function upsertMeta(
  selector: string,
  attributes: Record<string, string>,
  content: string
) {
  let meta = document.querySelector<HTMLMetaElement>(selector);
  if (!meta) {
    meta = document.createElement("meta");
    Object.entries(attributes).forEach(([key, value]) => {
      meta?.setAttribute(key, value);
    });
    document.head.appendChild(meta);
  }
  meta.content = content;
}

function upsertCanonical(href: string) {
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = href;
}

export function setPageSeo({
  title,
  description,
  path,
  image = "/og-lifescore.svg",
  robots = "index, follow",
  type = "website",
}: SeoOptions) {
  const canonicalUrl = absoluteUrl(path || window.location.pathname);
  const imageUrl = absoluteUrl(image);

  document.title = title;
  upsertCanonical(canonicalUrl);

  upsertMeta('meta[name="description"]', { name: "description" }, description);
  upsertMeta('meta[name="robots"]', { name: "robots" }, robots);
  upsertMeta('meta[property="og:site_name"]', { property: "og:site_name" }, "LifeScore");
  upsertMeta('meta[property="og:type"]', { property: "og:type" }, type);
  upsertMeta('meta[property="og:title"]', { property: "og:title" }, title);
  upsertMeta(
    'meta[property="og:description"]',
    { property: "og:description" },
    description
  );
  upsertMeta('meta[property="og:url"]', { property: "og:url" }, canonicalUrl);
  upsertMeta('meta[property="og:image"]', { property: "og:image" }, imageUrl);
  upsertMeta('meta[name="twitter:card"]', { name: "twitter:card" }, "summary_large_image");
  upsertMeta('meta[name="twitter:title"]', { name: "twitter:title" }, title);
  upsertMeta(
    'meta[name="twitter:description"]',
    { name: "twitter:description" },
    description
  );
  upsertMeta('meta[name="twitter:image"]', { name: "twitter:image" }, imageUrl);
}
