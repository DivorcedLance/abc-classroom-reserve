import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseAnonClient } from "@/lib/supabase"
import { loginSchema } from "@/lib/validations"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    // const supabase = createServerSupabaseClient()
    const supabase = createServerSupabaseAnonClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Supabase login error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single()

    if (profileError) {
      console.error("Profile fetch error:", profileError)
      return NextResponse.json({ error: "Error al obtener el perfil del usuario" }, { status: 400 })
    }

    return NextResponse.json({
      user: profile,
      session: data.session,
    })
  } catch (error) {
    console.error("Login route error:", error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
