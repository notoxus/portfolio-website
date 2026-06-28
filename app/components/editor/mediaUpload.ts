export const MAX_MEDIA_FILE_SIZE = 4 * 1024 * 1024

export type UploadedMedia = {
  url: string
  previewUrl?: string
  kind: 'image' | 'video'
}

/** Uploads one media file through the blog upload API. */
export async function uploadMediaFile(file: File): Promise<UploadedMedia> {
  if (file.size > MAX_MEDIA_FILE_SIZE) {
    throw new Error('File must be 4 MB or smaller')
  }

  const body = new FormData()
  body.append('file', file)

  const response = await fetch('/api/upload', { method: 'POST', body })
  const result = await response.json()

  if (!response.ok) throw new Error(result.error ?? 'Upload failed')
  return result
}
