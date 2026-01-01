import fs from 'fs';
import path from 'path';

export interface ImageReference {
  contentType: 'vesti' | 'turniri';
  contentFile: string;
  blockIndex: number;
  imagePath: string;
  imageField: 'url' | 'filename' | 'value';
  exists: boolean;
}

/**
 * Validates an image block from content JSON and checks if the referenced image exists
 *
 * @param block - Content block to validate
 * @param contentType - Type of content ('vesti' or 'turniri')
 * @param contentFile - Filename of the content file
 * @param blockIndex - Index of this block in the content array
 * @param publicDir - Path to the public directory
 * @returns ImageReference object if block is an image, null otherwise
 */
export function validateImageBlock(
  block: any,
  contentType: 'vesti' | 'turniri',
  contentFile: string,
  blockIndex: number,
  publicDir: string
): ImageReference | null {
  if (block.type !== 'image') return null;

  // Determine image path and which field contains it
  let imagePath = '';
  let imageField: 'url' | 'filename' | 'value' = 'url';

  if (block.url) {
    imagePath = block.url;
    imageField = 'url';
  } else if (block.filename) {
    // Construct path from filename
    imagePath = `/images/${contentType}/${block.filename}`;
    imageField = 'filename';
  } else if (block.value && typeof block.value === 'string' && !block.value.startsWith('http')) {
    imagePath = block.value;
    imageField = 'value';
  } else {
    // External URL or invalid, skip validation
    return null;
  }

  // Skip external URLs
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return null;
  }

  // Check if file exists
  const fullPath = path.join(publicDir, imagePath);
  const exists = fs.existsSync(fullPath);

  return {
    contentType,
    contentFile,
    blockIndex,
    imagePath,
    imageField,
    exists,
  };
}

/**
 * Validates all image blocks in a content file
 *
 * @param filePath - Path to the content JSON file
 * @param publicDir - Path to the public directory
 * @returns Array of ImageReference objects
 */
export function validateContentFile(
  filePath: string,
  publicDir: string
): ImageReference[] {
  const contentType = filePath.includes('/vesti/') || filePath.includes('\\vesti\\')
    ? 'vesti'
    : 'turniri';

  const contentFile = path.basename(filePath);
  const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  if (!content.content || !Array.isArray(content.content)) {
    return [];
  }

  const references: ImageReference[] = [];

  for (let i = 0; i < content.content.length; i++) {
    const block = content.content[i];
    const ref = validateImageBlock(block, contentType, contentFile, i, publicDir);

    if (ref) {
      references.push(ref);
    }
  }

  return references;
}
