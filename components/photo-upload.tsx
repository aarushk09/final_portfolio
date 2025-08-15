"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, Check, Loader2 } from "lucide-react"

export function PhotoUpload() {
  const [isOpen, setIsOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const validFiles = Array.from(files).filter(
      (file) => file.type.startsWith("image/") && file.size <= 10 * 1024 * 1024, // 10MB limit
    )

    if (validFiles.length > 0) {
      uploadFiles(validFiles)
    }
  }

  const uploadFiles = async (files: File[]) => {
    setUploading(true)
    const uploaded: string[] = []

    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/upload-photo", {
          method: "POST",
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          uploaded.push(data.url)
        }
      }

      setUploadedFiles((prev) => [...prev, ...uploaded])

      // Close modal after successful upload
      setTimeout(() => {
        setIsOpen(false)
        setUploadedFiles([])
      }, 2000)
    } catch (error) {
      console.error("Upload failed:", error)
    } finally {
      setUploading(false)
    }
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
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-inter text-xl text-white">Upload Photos</h3>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                isDragging ? "border-green-500 bg-green-500/10" : "border-zinc-600 hover:border-zinc-500"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
                  <p className="text-zinc-300 font-inter">Uploading photos...</p>
                </div>
              ) : uploadedFiles.length > 0 ? (
                <div className="flex flex-col items-center gap-4">
                  <Check className="w-8 h-8 text-green-500" />
                  <p className="text-green-400 font-inter">
                    {uploadedFiles.length} photo{uploadedFiles.length > 1 ? "s" : ""} uploaded successfully!
                  </p>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
                  <p className="text-zinc-300 font-inter mb-2">Drag and drop photos here, or click to select</p>
                  <p className="text-zinc-500 font-crimson-text text-sm">Supports JPG, PNG, WebP up to 10MB each</p>
                </>
              )}
            </div>

            {!uploading && uploadedFiles.length === 0 && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-inter py-3 px-4 rounded-lg transition-colors"
                >
                  Choose Files
                </button>
                <button
                  onClick={() => setIsOpen(false)}
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
