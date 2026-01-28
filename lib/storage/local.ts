import fs from 'fs/promises'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR)
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true })
  }
}

export async function saveFile(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  await ensureUploadDir()

  const filePath = path.join(UPLOAD_DIR, fileName)
  await fs.writeFile(filePath, buffer)

  // Return public URL
  return `/uploads/${fileName}`
}

export async function deleteFile(fileName: string): Promise<void> {
  const filePath = path.join(UPLOAD_DIR, fileName)
  try {
    await fs.unlink(filePath)
  } catch (error) {
    console.error('Failed to delete file:', error)
  }
}

export function generateFileName(originalName: string, extension: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  const sanitized = originalName.replace(/[^a-zA-Z0-9]/g, '_')
  return `${timestamp}_${random}_${sanitized}.${extension}`
}
