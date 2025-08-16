import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables:", {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
  })
  throw new Error("Missing Supabase environment variables")
}

console.log("Creating Supabase client with:", {
  url: supabaseUrl,
  keyLength: supabaseKey.length,
})

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: {
      "X-Client-Info": "supabase-js-web",
    },
  },
})

// Test the client connection
supabase.storage
  .listBuckets()
  .then(({ data, error }) => {
    if (error) {
      console.error("Supabase client test failed:", error)
    } else {
      console.log(
        "Supabase client test successful, buckets:",
        data?.map((b) => b.name),
      )
    }
  })
  .catch((err) => {
    console.error("Supabase client connection error:", err)
  })

// Client-side Supabase client (singleton pattern)
let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  }
  return supabaseClient
}
