"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, Check, Loader2, AlertCircle } from "lucide-react"

interface UploadResult {
  file: File
  success: boolean
  url?: string
  error?: string
}

export function PhotoUpload() {
  const [isOpen, setIsOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([])
  const [currentUpload, setCurrentUpload] = useState<string>("")
  const [error, setError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const validFiles = Array.from(files).filter(
      (file) => file.type.startsWith("image/") && file.size <= 10 * 1024 * 1024, // 10MB limit
    )

    if (validFiles.length === 0) {
      setError("Please select valid image files under 10MB")
      return
    }

    if (validFiles.length > 0) {
      uploadFiles(validFiles)
    }
  }

  const uploadFiles = async (files: File[]) => {
    setUploading(true)
    setError("")
    setUploadResults([])

    const results: UploadResult[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setCurrentUpload(`Uploading ${file.name} (${i + 1}/${files.length})`)

      try {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/upload-photo", {
          method: "POST",
          body: formData,
        })

        const data = await response.json()

        if (response.ok) {
          results.push({
            file,
            success: true,
            url: data.url,
          })
        } else {
          results.push({
            file,
            success: false,
            error: data.error || "Upload failed",
          })
        }
      } catch (error) {
        results.push({
          file,
          success: false,
          error: error instanceof Error ? error.message : "Upload failed",
        })
      }

      // Small delay to prevent overwhelming the server
      if (i < files.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }

    setUploadResults(results)
    setUploading(false)
    setCurrentUpload("")

    // Auto-close and refresh if all uploads were successful
    const successfulUploads = results.filter((r) => r.success)
    if (successfulUploads.length === results.length && results.length > 0) {
      setTimeout(() => {
        setIsOpen(false)
        setUploadResults([])
        window.location.reload()
      }, 2000)
    }
  }

  const createImagePreview = (file: File): string => {
    return URL.createObjectURL(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const resetModal = () => {
    setIsOpen(false)
    setError("")
    setUploadResults([])
    setUploading(false)
    setCurrentUpload("")
  }

  const retryFailedUploads = () => {
    const failedFiles = uploadResults.filter((r) => !r.success).map((r) => r.file)
    if (failedFiles.length > 0) {
      uploadFiles(failedFiles)
    }
  }

  const successfulUploads = uploadResults.filter((r) => r.success)
  const failedUploads = uploadResults.filter((r) => !r.success)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-inter text-sm transition-all duration-300"
      >
        <Upload className="w-4 h-4" />
        Upload Photos
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-inter text-xl text-white">Upload Photos</h3>
              <button onClick={resetModal} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-700 rounded-lg">
                <p className="text-red-400 font-inter text-sm">{error}</p>
              </div>
            )}

            {/* Upload Area */}
            {!uploading && uploadResults.length === 0 && (
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  isDragging ? "border-green-500 bg-green-500/10" : "border-zinc-600 hover:border-zinc-500"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
                <p className="text-zinc-300 font-inter mb-2">Drag and drop photos here, or click to select</p>
                <p className="text-zinc-500 font-crimson-text text-sm">Supports JPG, PNG, WebP up to 10MB each</p>
              </div>
            )}

            {/* Upload Progress */}
            {uploading && (
              <div className="flex flex-col items-center gap-4 py-8">
                <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
                <p className="text-zinc-300 font-inter">{currentUpload}</p>
              </div>
            )}

            {/* Upload Results */}
            {uploadResults.length > 0 && !uploading && (
              <div className="space-y-6">
                {/* Success Summary */}
                {successfulUploads.length > 0 && (
                  <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <h4 className="font-inter text-green-400 font-medium">
                        {successfulUploads.length} photo{successfulUploads.length > 1 ? "s" : ""} uploaded successfully!
                      </h4>
                    </div>
                  </div>
                )}

                {/* Failed Uploads */}
                {failedUploads.length > 0 && (
                  <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <h4 className="font-inter text-red-400 font-medium">
                        {failedUploads.length} photo{failedUploads.length > 1 ? "s" : ""} failed to upload:
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {failedUploads.map((result, index) => (
                        <div key={index} className="bg-zinc-800 rounded-lg p-3">
                          <div className="aspect-square bg-zinc-700 rounded-lg mb-2 overflow-hidden">
                            <img
                              src={createImagePreview(result.file) || "/placeholder.svg"}
                              alt={result.file.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-zinc-300 font-inter text-xs truncate mb-1">{result.file.name}</p>
                          <p className="text-red-400 font-inter text-xs">{result.error}</p>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={retryFailedUploads}
                      className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-inter py-2 px-4 rounded-lg transition-colors"
                    >
                      Retry Failed Uploads
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {successfulUploads.length > 0 && failedUploads.length === 0 && (
                    <div className="flex-1 text-center">
                      <p className="text-green-400 font-inter text-sm mb-2">All photos uploaded successfully!</p>
                      <p className="text-zinc-400 font-inter text-xs">Refreshing page...</p>
                    </div>
                  )}
                  <button
                    onClick={resetModal}
                    className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-inter py-3 px-4 rounded-lg transition-colors"
                  >
                    {successfulUploads.length > 0 ? "Done" : "Close"}
                  </button>
                </div>
              </div>
            )}

            {/* Initial Buttons */}
            {!uploading && uploadResults.length === 0 && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-inter py-3 px-4 rounded-lg transition-colors"
                >
                  Choose Files
                </button>
                <button
                  onClick={resetModal}
                  className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-inter py-3 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>
        </div>
      )}
    </>
  )
}
