import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { compare } from "bcryptjs";

export async function GET() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: "diretor@cepi.edu.br" },
    });

    if (!user) {
      return NextResponse.json({ status: "USER_NOT_FOUND" });
    }

    const passwordOk = await compare("Admin@123", user.passwordHash);

    return NextResponse.json({
      status: "OK",
      email: user.email,
      role: user.role,
      active: user.active,
      passwordHash_prefix: user.passwordHash.substring(0, 20),
      password_valid: passwordOk,
      db_env: process.env.VERCEL ? "vercel" : "local",
    });
  } catch (e: any) {
    return NextResponse.json({ status: "ERROR", message: e.message, stack: e.stack?.substring(0, 500) }, { status: 500 });
  }
}
