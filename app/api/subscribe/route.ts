import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();
    const csvLine = `${timestamp},${email}\n`;
    const filePath = path.join(process.cwd(), "subscriptions.csv");

    // Append to file (creates the file if it doesn't exist)
    fs.appendFileSync(filePath, csvLine, "utf8");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving subscription:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
