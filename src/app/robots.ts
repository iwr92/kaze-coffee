import type { MetadataRoute } from "next";
import { SITE_INDEXABLE, SITE_URL } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return SITE_INDEXABLE
    ? { rules: { userAgent: "*", allow: "/" }, sitemap: `${SITE_URL}/sitemap.xml`, host: SITE_URL }
    : { rules: { userAgent: "*", disallow: "/" } };
}
