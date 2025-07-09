import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { signupSchema } from "@/lib/validations"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, full_name } = signupSchema.parse(body)

    const supabase = createServerSupabaseClient()

    // Create user with admin API (requires service role)
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        full_name,
      },
      email_confirm: true, // Auto-confirm email for development
    })

    if (error) {
      console.error("Supabase signup error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // The trigger function should automatically create the profile
    // But let's verify it was created
    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single()

      if (profileError) {
        console.error("Profile creation/fetch error:", profileError)
        // Profile might not exist yet due to timing, that's okay
      }
    }

    return NextResponse.json({
      message: "Usuario registrado exitosamente. Puedes iniciar sesión ahora.",
      user: data.user,
    })
  } catch (error) {
    console.error("Signup route error:", error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
