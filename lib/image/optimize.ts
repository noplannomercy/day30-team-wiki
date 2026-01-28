import sharp from 'sharp'

interface OptimizeOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
}

const DEFAULT_OPTIONS: OptimizeOptions = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 85,
}

export async function optimizeImage(
  buffer: Buffer,
  mimeType: string,
  options: OptimizeOptions = {}
): Promise<{ buffer: Buffer; size: number; optimized: boolean }> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const originalSize = buffer.length

  // Only optimize if >1MB (1048576 bytes)
  if (originalSize < 1048576) {
    return {
      buffer,
      size: originalSize,
      optimized: false,
    }
  }

  try {
    let image = sharp(buffer)

    // Get metadata to check dimensions
    const metadata = await image.metadata()

    // Resize if exceeds max dimensions
    if (
      metadata.width &&
      metadata.height &&
      (metadata.width > opts.maxWidth! || metadata.height > opts.maxHeight!)
    ) {
      image = image.resize(opts.maxWidth, opts.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
    }

    // Optimize based on mime type
    let optimized: Buffer
    if (mimeType === 'image/png') {
      optimized = await image
        .png({
          quality: opts.quality,
          compressionLevel: 9,
        })
        .toBuffer()
    } else if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
      optimized = await image
        .jpeg({
          quality: opts.quality,
          progressive: true,
        })
        .toBuffer()
    } else if (mimeType === 'image/gif') {
      // GIF optimization is limited, just resize
      optimized = await image.toBuffer()
    } else {
      // Fallback for other formats
      optimized = await image
        .jpeg({
          quality: opts.quality,
        })
        .toBuffer()
    }

    const optimizedSize = optimized.length

    // Only return optimized if it's actually smaller
    if (optimizedSize < originalSize) {
      return {
        buffer: optimized,
        size: optimizedSize,
        optimized: true,
      }
    }

    return {
      buffer,
      size: originalSize,
      optimized: false,
    }
  } catch (error) {
    console.error('Image optimization failed:', error)
    // Return original if optimization fails
    return {
      buffer,
      size: originalSize,
      optimized: false,
    }
  }
}

export function validateImageType(mimeType: string): boolean {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif']
  return allowedTypes.includes(mimeType.toLowerCase())
}

export function getImageExtension(mimeType: string): string {
  switch (mimeType.toLowerCase()) {
    case 'image/png':
      return 'png'
    case 'image/jpeg':
    case 'image/jpg':
      return 'jpg'
    case 'image/gif':
      return 'gif'
    default:
      return 'jpg'
  }
}
