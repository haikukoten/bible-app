import { getArticle } from "@/lib/contentful";
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server"; // Import NextRequest type

export async function GET(request: NextRequest) { // Add NextRequest type here
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug");

  if (!secret || !slug) {
    return new Response("Missing parameters", { status: 400 });
  }

  if (secret !== process.env.CONTENTFUL_PREVIEW_SECRET) {
    return new Response("Invalid token", { status: 401 });
  }

  const article = await getArticle(slug);

  if (!article) {
    return new Response("Article not found", { status: 404 });
  }

  draftMode().enable();
  redirect(`/blog/${article.slug}`);
}
