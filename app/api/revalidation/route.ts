import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { NextRequest } from "next/server"; // Import NextRequest type

export async function POST(request: NextRequest) { // Add NextRequest type here
  const requestHeaders = new Headers(request.headers);
  const secret = requestHeaders.get("x-vercel-reval-key");

  if (secret !== process.env.CONTENTFUL_REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  revalidateTag("articles");

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
