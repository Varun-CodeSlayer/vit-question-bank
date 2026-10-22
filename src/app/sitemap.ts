import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://vit-question-bank-lovat.vercel.app";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/practice`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/papers`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/syllabus`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  try {
    const [coursesRes, papersRes] = await Promise.all([
      supabase.from("courses").select("course_code"),
      supabase.from("papers").select("paper_id"),
    ]);

    const courseRoutes: MetadataRoute.Sitemap = (coursesRes.data || [])
      .filter((c) => Boolean(c.course_code))
      .map((c) => ({
        url: `${baseUrl}/practice/${encodeURIComponent(c.course_code)}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      }));

    const paperRoutes: MetadataRoute.Sitemap = (papersRes.data || [])
      .filter((p) => Boolean(p.paper_id))
      .map((p) => ({
        url: `${baseUrl}/papers/${encodeURIComponent(p.paper_id)}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      }));

    return [...staticRoutes, ...courseRoutes, ...paperRoutes];
  } catch (error) {
    console.warn("Failed to fetch dynamic routes for sitemap:", error);
  }

  return staticRoutes;
}
