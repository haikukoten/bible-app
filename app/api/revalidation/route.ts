import { NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const secret = requestHeaders.get("x-vercel-reval-key");

  if (secret !== process.env.CONTENTFUL_REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  revalidateTag("articles");
  revalidatePath("/api/sitemap");

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
