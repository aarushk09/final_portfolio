"use client"

import { useState } from "react"
import { Settings, CheckCircle, AlertCircle, Loader2, ExternalLink, Copy } from "lucide-react"

export function StorageSetup() {
  const [isOpen, setIsOpen] = useState(false)
  const [setting, setSetting] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    details?: string
    needsManualSetup?: boolean
  } | null>(null)
  const [showInstructions, setShowInstructions] = useState(false)
  const [copiedStep, setCopiedStep] = useState<number | null>(null)

  const setupStorage = async () => {
    setSetting(true)
    setResult(null)

    try {
      const response = await fetch("/api/setup-storage", {
        method: "POST",
      })

      const data = await response.json()
      setResult(data)

      if (data.needsManualSetup) {
        setShowInstructions(true)
      }
    } catch (error) {
      setResult({
        success: false,
        message: "Network error",
        details: error instanceof Error ? error.message : "Unknown error",
        needsManualSetup: true,
      })
      setShowInstructions(true)
    } finally {
      setSetting(false)
    }
  }

  const copyToClipboard = (text: string, stepNumber: number) => {
    navigator.clipboard.writeText(text)
    setCopiedStep(stepNumber)
    setTimeout(() => setCopiedStep(null), 2000)
  }

  const resetModal = () => {
    setIsOpen(false)
    setResult(null)
    setSetting(false)
    setShowInstructions(false)
    setCopiedStep(null)
  }

  const manualSteps = [
    {
      title: "Go to Supabase Dashboard",
      description: "Open your Supabase project dashboard",
      action: "Visit Dashboard",
      link: "https://supabase.com/dashboard",
    },
    {
      title: "Navigate to Storage",
      description: "Click on 'Storage' in the left sidebar, then 'Buckets'",
    },
    {
      title: "Create New Bucket",
      description: "Click 'New bucket' button",
    },
    {
      title: "Configure Bucket",
      description: "Set these exact settings:",
      details: [
        { label: "Name", value: "portfolio-photos", copyable: true },
        { label: "Public bucket", value: "✅ Enabled" },
        { label: "File size limit", value: "10 MB" },
        { label: "Allowed MIME types", value: "image/jpeg, image/png, image/webp, image/gif", copyable: true },
      ],
    },
    {
      title: "Create Bucket",
      description: "Click 'Create bucket' to finish setup",
    },
    {
      title: "Verify Setup",
      description: "Try uploading a photo to test the configuration",
    },
  ]

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
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-900/20 rounded-full">
                <Settings className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-inter text-xl text-white">Setup Supabase Storage</h3>
                <p className="font-inter text-sm text-zinc-400">Configure storage bucket for photos</p>
              </div>
            </div>

            {!result && !setting && !showInstructions && (
              <div className="space-y-4">
                <div className="bg-blue-900/10 border border-blue-800/50 rounded-lg p-4">
                  <h4 className="font-inter text-blue-400 font-medium mb-2">Automatic Setup:</h4>
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
                      <h4 className="font-inter text-yellow-400 font-medium mb-1">Requirements:</h4>
                      <p className="text-yellow-300 font-inter text-sm mb-2">
                        Automatic setup requires the service role key. If it fails, we'll show manual setup
                        instructions.
                      </p>
                      <p className="text-yellow-300 font-inter text-xs">
                        Environment variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={setupStorage}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-inter py-3 px-4 rounded-lg transition-colors"
                  >
                    Try Automatic Setup
                  </button>
                  <button
                    onClick={() => setShowInstructions(true)}
                    className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-inter py-3 px-4 rounded-lg transition-colors"
                  >
                    Manual Setup
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

            {result && !showInstructions && (
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
                      {result.success ? "Success!" : "Automatic Setup Failed"}
                    </h4>
                  </div>
                  <p className={`font-inter text-sm mb-2 ${result.success ? "text-green-300" : "text-red-300"}`}>
                    {result.message}
                  </p>
                  {result.details && <p className="text-zinc-400 font-inter text-xs">{result.details}</p>}
                </div>

                <div className="flex gap-3">
                  {!result.success && (
                    <>
                      <button
                        onClick={setupStorage}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-inter py-3 px-4 rounded-lg transition-colors"
                      >
                        Try Again
                      </button>
                      <button
                        onClick={() => setShowInstructions(true)}
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-inter py-3 px-4 rounded-lg transition-colors"
                      >
                        Manual Setup
                      </button>
                    </>
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

            {showInstructions && (
              <div className="space-y-6">
                <div className="bg-orange-900/20 border border-orange-700 rounded-lg p-4">
                  <h4 className="font-inter text-orange-400 font-medium mb-2">📋 Manual Setup Instructions</h4>
                  <p className="text-orange-300 font-inter text-sm">
                    Follow these steps to manually create the storage bucket in Supabase:
                  </p>
                </div>

                <div className="space-y-4">
                  {manualSteps.map((step, index) => (
                    <div key={index} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-inter text-white font-medium mb-1">{step.title}</h5>
                          <p className="text-zinc-300 font-inter text-sm mb-2">{step.description}</p>

                          {step.link && (
                            <a
                              href={step.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-inter text-sm underline"
                            >
                              {step.action}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}

                          {step.details && (
                            <div className="mt-3 space-y-2">
                              {step.details.map((detail, detailIndex) => (
                                <div
                                  key={detailIndex}
                                  className="flex items-center justify-between bg-zinc-900 p-2 rounded"
                                >
                                  <div className="flex-1">
                                    <span className="text-zinc-400 font-inter text-xs">{detail.label}:</span>
                                    <span className="text-white font-inter text-sm ml-2">{detail.value}</span>
                                  </div>
                                  {detail.copyable && (
                                    <button
                                      onClick={() => copyToClipboard(detail.value, detailIndex)}
                                      className="p-1 hover:bg-zinc-700 rounded transition-colors"
                                    >
                                      {copiedStep === detailIndex ? (
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                      ) : (
                                        <Copy className="w-4 h-4 text-zinc-400" />
                                      )}
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <h4 className="font-inter text-green-400 font-medium">After Setup</h4>
                  </div>
                  <p className="text-green-300 font-inter text-sm">
                    Once you've created the bucket, try uploading photos. They should work immediately!
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={resetModal}
                    className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-inter py-3 px-4 rounded-lg transition-colors"
                  >
                    Close
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
