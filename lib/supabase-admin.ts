import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase admin environment variables:", {
    hasUrl: !!supabaseUrl,
    hasServiceKey: !!supabaseServiceKey,
  })
}

// Admin client with service role key for bucket operations
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          "X-Client-Info": "supabase-js-admin",
        },
      },
    })
  : null

// Test admin client if available
if (supabaseAdmin) {
  supabaseAdmin.storage
    .listBuckets()
    .then(({ data, error }) => {
      if (error) {
        console.error("Supabase admin client test failed:", error)
      } else {
        console.log(
          "Supabase admin client test successful, buckets:",
          data?.map((b) => b.name),
        )
      }
    })
    .catch((err) => {
      console.error("Supabase admin client connection error:", err)
    })
}
