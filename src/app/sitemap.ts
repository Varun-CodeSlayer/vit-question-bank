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
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/syllabus`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  try {
    const { data: courses } = await supabase
      .from("courses")
      .select("course_code");

    if (courses && courses.length > 0) {
      const courseRoutes: MetadataRoute.Sitemap = courses
        .filter((c) => Boolean(c.course_code))
        .map((c) => ({
          url: `${baseUrl}/practice/${encodeURIComponent(c.course_code)}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        }));

      return [...staticRoutes, ...courseRoutes];
    }
  } catch (error) {
    console.warn("Failed to fetch courses for sitemap:", error);
  }

  return staticRoutes;
}

