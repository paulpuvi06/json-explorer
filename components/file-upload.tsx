"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onFileContent: (content: string) => void
}

export function FileUpload({ onFileContent }: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          onFileContent(content)
        }
        reader.readAsText(file)
      }
    },
    [onFileContent],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/json": [".json"],
      "text/plain": [".txt"],
    },
    multiple: false,
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
        "hover:border-primary/50 hover:bg-muted/50",
        isDragActive ? "border-primary bg-primary/5" : "border-border",
      )}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center gap-4">
        {isDragActive ? (
          <Upload className="h-12 w-12 text-primary animate-bounce" />
        ) : (
          <FileText className="h-12 w-12 text-muted-foreground" />
        )}

        <div>
          <p className="text-lg font-medium">{isDragActive ? "Drop your file here" : "Upload JSON file"}</p>
          <p className="text-sm text-muted-foreground mt-1">Drag and drop a JSON or text file, or click to browse</p>
        </div>
      </div>
    </div>
  )
}
