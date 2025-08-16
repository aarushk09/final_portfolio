"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, Check, Loader2, AlertCircle, ExternalLink } from "lucide-react"

interface Photo {
  id: string
  url: string
  uploadedAt: string
}

interface UploadResult {
  file: File
  success: boolean
  url?: string
  error?: string
  isDuplicate?: boolean
  isServiceError?: boolean
}

interface PhotoUploadProps {
  existingPhotos?: Photo[]
}

export function PhotoUpload({ existingPhotos = [] }: PhotoUploadProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([])
  const [currentUpload, setCurrentUpload] = useState<string>("")
  const [error, setError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Extract unique identifier from filename
  const extractPhotoId = (filename: string): string => {
    // Remove extension first
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "")

    // Common patterns for photo IDs:
    // IMG_1234, DSC_5678, 20240115_123456, PXL_20240115_123456789, etc.
    const patterns = [
      /^(IMG_\d+)/i, // IMG_1234
      /^(DSC_\d+)/i, // DSC_5678
      /^(PXL_\d+_\d+)/i, // PXL_20240115_123456789
      /^(\d{8}_\d+)/, // 20240115_123456
      /^(\d{4}-\d{2}-\d{2}_\d+)/, // 2024-01-15_123456
      /^([A-Z]{2,4}\d+)/i, // DCIM1234, etc.
      /^(\d+)/, // Just numbers: 1234567890
    ]

    for (const pattern of patterns) {
      const match = nameWithoutExt.match(pattern)
      if (match) {
        return match[1].toUpperCase()
      }
    }

    // If no pattern matches, use the full filename without extension as ID
    return nameWithoutExt.toUpperCase()
  }

  // Check for duplicates by comparing photo IDs
  const checkForDuplicates = async (
    files: File[],
  ): Promise<{ file: File; photoId: string; isDuplicate: boolean }[]> => {
    const fileIds = files.map((file) => ({
      file,
      photoId: extractPhotoId(file.name),
      isDuplicate: false,
    }))

    // Get existing photo IDs from the server
    try {
      const response = await fetch("/api/photo-ids")
      const data = await response.json()
      const existingIds = new Set(data.photoIds || [])

      console.log("Existing photo IDs:", Array.from(existingIds))
      console.log(
        "New file IDs:",
        fileIds.map((f) => f.photoId),
      )

      // Mark duplicates
      fileIds.forEach((item) => {
        item.isDuplicate = existingIds.has(item.photoId)
        if (item.isDuplicate) {
          console.log(`Duplicate detected: ${item.file.name} (ID: ${item.photoId})`)
        }
      })
    } catch (error) {
      console.error("Failed to fetch existing photo IDs:", error)
      // If we can't fetch IDs, proceed without duplicate checking
    }

    return fileIds
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const validFiles = Array.from(files).filter(
      (file) => file.type.startsWith("image/") && file.size <= 10 * 1024 * 1024, // 10MB limit for Supabase
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

    try {
      // First, check for duplicates
      setCurrentUpload("Checking for duplicate photo IDs...")
      const fileIds = await checkForDuplicates(files)

      const results: UploadResult[] = []

      // Separate duplicates from new files
      const newFiles = fileIds.filter((item) => !item.isDuplicate)
      const duplicateFiles = fileIds.filter((item) => item.isDuplicate)

      // Add duplicate results immediately
      duplicateFiles.forEach((item) => {
        results.push({
          file: item.file,
          success: false,
          isDuplicate: true,
          error: `Photo ID "${item.photoId}" already exists`,
        })
      })

      // Upload new files in parallel batches of 3
      if (newFiles.length > 0) {
        const batchSize = 3
        for (let i = 0; i < newFiles.length; i += batchSize) {
          const batch = newFiles.slice(i, i + batchSize)

          const batchPromises = batch.map(async (item, batchIndex) => {
            const fileIndex = i + batchIndex + 1
            setCurrentUpload(`Uploading ${item.file.name} (${fileIndex}/${newFiles.length})`)

            try {
              const formData = new FormData()
              formData.append("file", item.file)
              formData.append("photoId", item.photoId) // Send photo ID with file

              const response = await fetch("/api/upload-photo", {
                method: "POST",
                body: formData,
              })

              const data = await response.json()

              if (response.ok) {
                return {
                  file: item.file,
                  success: true,
                  url: data.url,
                }
              } else {
                return {
                  file: item.file,
                  success: false,
                  error: data.error || "Upload failed",
                  isServiceError: data.isServiceError || false,
                }
              }
            } catch (error) {
              return {
                file: item.file,
                success: false,
                error: error instanceof Error ? error.message : "Upload failed",
              }
            }
          })

          const batchResults = await Promise.allSettled(batchPromises)
          const batchUploadResults = batchResults.map((result) =>
            result.status === "fulfilled"
              ? result.value
              : { file: batch[0].file, success: false, error: "Unknown error" },
          )

          results.push(...batchUploadResults)

          // Update results progressively
          setUploadResults([...results])

          // Small delay between batches
          if (i + batchSize < newFiles.length) {
            await new Promise((resolve) => setTimeout(resolve, 100))
          }
        }
      } else {
        // Only duplicates found
        setUploadResults(results)
      }

      setUploading(false)
      setCurrentUpload("")

      // Auto-close and refresh if all uploads were successful
      const successfulUploads = results.filter((r) => r.success)
      if (successfulUploads.length > 0 && results.filter((r) => !r.success && !r.isDuplicate).length === 0) {
        setTimeout(() => {
          setIsOpen(false)
          setUploadResults([])
          window.location.reload()
        }, 2000)
      }
    } catch (error) {
      setError("Failed to process files: " + (error instanceof Error ? error.message : "Unknown error"))
      setUploading(false)
      setCurrentUpload("")
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
    const failedFiles = uploadResults.filter((r) => !r.success && !r.isDuplicate).map((r) => r.file)
    if (failedFiles.length > 0) {
      uploadFiles(failedFiles)
    }
  }

  const successfulUploads = uploadResults.filter((r) => r.success)
  const failedUploads = uploadResults.filter((r) => !r.success && !r.isDuplicate)
  const duplicateUploads = uploadResults.filter((r) => r.isDuplicate)
  const serviceErrors = uploadResults.filter((r) => r.isServiceError)

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

            {/* Service Error Alert */}
            {serviceErrors.length > 0 && (
              <div className="mb-4 p-4 bg-orange-900/20 border border-orange-700 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-inter text-orange-400 font-medium mb-2">Storage Service Issue</h4>
                    <p className="text-orange-300 font-inter text-sm mb-3">
                      There's an issue with the storage service. Please check your Supabase setup:
                    </p>
                    <ul className="text-orange-300 font-inter text-sm space-y-1 mb-3 ml-4">
                      <li>• Verify environment variables are set</li>
                      <li>• Check Supabase project status</li>
                      <li>• Ensure storage bucket exists</li>
                    </ul>
                    <a
                      href="https://supabase.com/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 font-inter text-sm underline"
                    >
                      Check Supabase Dashboard
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
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
                <p className="text-zinc-600 font-inter text-xs mt-2">
                  Photos with duplicate IDs (IMG_1234, DSC_5678, etc.) will be automatically skipped
                </p>
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

                {/* Duplicate Summary */}
                {duplicateUploads.length > 0 && (
                  <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                      <h4 className="font-inter text-yellow-400 font-medium">
                        {duplicateUploads.length} photo{duplicateUploads.length > 1 ? "s" : ""} with duplicate IDs
                        skipped:
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {duplicateUploads.map((result, index) => (
                        <div key={index} className="bg-zinc-800 rounded-lg p-3">
                          <div className="aspect-square bg-zinc-700 rounded-lg mb-2 overflow-hidden">
                            <img
                              src={createImagePreview(result.file) || "/placeholder.svg"}
                              alt={result.file.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-zinc-300 font-inter text-xs truncate mb-1">{result.file.name}</p>
                          <p className="text-yellow-400 font-inter text-xs">{result.error}</p>
                        </div>
                      ))}
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

                    {serviceErrors.length === 0 && (
                      <button
                        onClick={retryFailedUploads}
                        className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-inter py-2 px-4 rounded-lg transition-colors"
                      >
                        Retry Failed Uploads
                      </button>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {successfulUploads.length > 0 && failedUploads.length === 0 && (
                    <div className="flex-1 text-center">
                      <p className="text-green-400 font-inter text-sm mb-2">All photos processed!</p>
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
