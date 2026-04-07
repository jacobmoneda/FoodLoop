import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { supabase } from "../../../lib/supabase";

export async function POST(request: NextRequest) {
  try {
    // await auth()
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    //Check existing user
    const { data: existingUser, error: existingUserError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .maybeSingle();

    if (existingUserError) {
      console.error("Error checking user existence:", existingUserError);
      return NextResponse.json({ error: "Failed to verify user" }, { status: 500 });
    }

    if (existingUser) {
      return NextResponse.json({ message: "User already exists" });
    }

    // await clerkClient()
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    //Insert user
    const { error } = await supabase.from("users").insert({
      clerk_id: userId,
      email: user.emailAddresses?.[0]?.emailAddress ?? null,
      first_name: user.firstName ?? null,
      last_name: user.lastName ?? null,
    });

    if (error) {
      console.error("Error creating user:", error);
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }

    return NextResponse.json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}