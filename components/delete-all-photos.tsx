"use client"

import { useState } from "react"
import { Trash2, Loader2, AlertTriangle } from "lucide-react"

interface DeleteAllPhotosProps {
  photoCount: number
}

export function DeleteAllPhotos({ photoCount }: DeleteAllPhotosProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string>("")

  const handleDeleteAll = async () => {
    setDeleting(true)
    setError("")

    try {
      const response = await fetch("/api/delete-all-photos", {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        // Success - refresh the page to show empty gallery
        window.location.reload()
      } else {
        setError(data.error || "Failed to delete photos")
        setDeleting(false)
      }
    } catch (error) {
      console.error("Failed to delete all photos:", error)
      setError("Network error - please try again")
      setDeleting(false)
    }
  }

  const resetModal = () => {
    setIsOpen(false)
    setError("")
    setDeleting(false)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 rounded-lg text-red-400 hover:text-red-300 font-inter text-sm transition-all duration-300"
      >
        <Trash2 className="w-4 h-4" />
        Delete All
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-900/20 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-inter text-xl text-white">Delete All Photos</h3>
                <p className="font-inter text-sm text-zinc-400">This action cannot be undone</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-700 rounded-lg">
                <p className="text-red-400 font-inter text-sm">{error}</p>
              </div>
            )}

            <div className="mb-6">
              <p className="text-zinc-300 font-inter mb-4">
                Are you sure you want to delete all <span className="font-semibold text-white">{photoCount}</span>{" "}
                photos? This will permanently remove all photos from your portfolio.
              </p>
              <div className="bg-red-900/10 border border-red-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="font-inter text-sm font-medium text-red-400">Warning</span>
                </div>
                <p className="text-red-300 font-inter text-sm">
                  This action is irreversible. All photos will be permanently deleted from storage.
                </p>
              </div>
            </div>

            {deleting ? (
              <div className="flex items-center justify-center gap-3 py-4">
                <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
                <span className="text-red-400 font-inter">Deleting all photos...</span>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={resetModal}
                  className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-inter py-3 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAll}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-inter py-3 px-4 rounded-lg transition-colors"
                >
                  Delete All Photos
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
