"use client"

import { useState } from "react"
import { Settings, CheckCircle, AlertCircle, Loader2, ExternalLink } from "lucide-react"

export function StorageSetup() {
  const [isOpen, setIsOpen] = useState(false)
  const [setting, setSetting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; details?: string } | null>(null)

  const setupStorage = async () => {
    setSetting(true)
    setResult(null)

    try {
      const response = await fetch("/api/setup-storage", {
        method: "POST",
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: "Network error",
        details: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setSetting(false)
    }
  }

  const resetModal = () => {
    setIsOpen(false)
    setResult(null)
    setSetting(false)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/50 rounded-lg text-blue-400 hover:text-blue-300 font-inter text-sm transition-all duration-300"
      >
        <Settings className="w-4 h-4" />
        Setup Storage
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-900/20 rounded-full">
                <Settings className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-inter text-xl text-white">Setup Supabase Storage</h3>
                <p className="font-inter text-sm text-zinc-400">Configure storage bucket for photos</p>
              </div>
            </div>

            {!result && !setting && (
              <div className="space-y-4">
                <div className="bg-blue-900/10 border border-blue-800/50 rounded-lg p-4">
                  <h4 className="font-inter text-blue-400 font-medium mb-2">What this does:</h4>
                  <ul className="text-blue-300 font-inter text-sm space-y-1">
                    <li>• Creates "portfolio-photos" storage bucket</li>
                    <li>• Configures public access for images</li>
                    <li>• Sets up file type and size limits</li>
                    <li>• Tests upload functionality</li>
                  </ul>
                </div>

                <div className="bg-yellow-900/10 border border-yellow-800/50 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-inter text-yellow-400 font-medium mb-1">Prerequisites:</h4>
                      <p className="text-yellow-300 font-inter text-sm">
                        Make sure your Supabase environment variables are configured in Vercel.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={setupStorage}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-inter py-3 px-4 rounded-lg transition-colors"
                  >
                    Setup Storage
                  </button>
                  <button
                    onClick={resetModal}
                    className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-inter py-3 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {setting && (
              <div className="flex flex-col items-center gap-4 py-8">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="text-zinc-300 font-inter">Setting up storage...</p>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                <div
                  className={`border rounded-lg p-4 ${
                    result.success ? "bg-green-900/20 border-green-700" : "bg-red-900/20 border-red-700"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    <h4 className={`font-inter font-medium ${result.success ? "text-green-400" : "text-red-400"}`}>
                      {result.success ? "Success!" : "Setup Failed"}
                    </h4>
                  </div>
                  <p className={`font-inter text-sm mb-2 ${result.success ? "text-green-300" : "text-red-300"}`}>
                    {result.message}
                  </p>
                  {result.details && <p className="text-zinc-400 font-inter text-xs">{result.details}</p>}
                </div>

                {!result.success && (
                  <div className="bg-orange-900/20 border border-orange-700 rounded-lg p-4">
                    <h4 className="font-inter text-orange-400 font-medium mb-2">Manual Setup:</h4>
                    <ol className="text-orange-300 font-inter text-sm space-y-1 mb-3">
                      <li>1. Go to your Supabase dashboard</li>
                      <li>2. Navigate to Storage section</li>
                      <li>3. Create a new bucket named "portfolio-photos"</li>
                      <li>4. Make the bucket public</li>
                      <li>5. Set file size limit to 10MB</li>
                    </ol>
                    <a
                      href="https://supabase.com/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 font-inter text-sm underline"
                    >
                      Open Supabase Dashboard
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                <div className="flex gap-3">
                  {!result.success && (
                    <button
                      onClick={setupStorage}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-inter py-3 px-4 rounded-lg transition-colors"
                    >
                      Try Again
                    </button>
                  )}
                  <button
                    onClick={resetModal}
                    className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-inter py-3 px-4 rounded-lg transition-colors"
                  >
                    {result.success ? "Done" : "Close"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
