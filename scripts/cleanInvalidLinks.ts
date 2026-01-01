import fs from 'fs';
import path from 'path';

// Paths to content directories
const VESTI_DIR = 'src/content/vesti';
const TURNIRI_DIR = 'src/content/turniri';

interface ContentItem {
  type: string;
  value?: string;
  url?: string;
  alt?: string;
  filename?: string;
  note?: string;
  originalUrl?: string;
}

interface ContentData {
  title: string;
  date?: string;
  date_formatted?: string | null;
  url?: string;
  content: ContentItem[];
}

// Check if a link is external (starts with http:// or https://)
function isExternalLink(value: string): boolean {
  return value.startsWith('http://') || value.startsWith('https://');
}

// Check if it's a link to the old website that should be removed
function isOldSiteLink(value: string): boolean {
  return value.includes('kkkaradjordjevo.com');
}

// Check if it's an image link
function isImageLink(value: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.JPG', '.JPEG', '.PNG', '.GIF'];
  return imageExtensions.some(ext => value.toLowerCase().endsWith(ext));
}

// Check if image file exists locally
function imageFileExists(item: ContentItem): boolean {
  // If it's an image type item
  if (item.type === 'image') {
    // Check if it has a url property that starts with /images/
    if ('url' in item && typeof item.url === 'string' && item.url.startsWith('/images/')) {
      const imagePath = path.join('public', item.url);
      return fs.existsSync(imagePath);
    }
    // If it doesn't have a valid local URL, it's invalid
    return false;
  }
  return true;
}

// Process a single JSON file
function processFile(filePath: string): { cleaned: boolean; removed: number } {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data: ContentData = JSON.parse(fileContent);

    const originalLength = data.content.length;
    let removedCount = 0;

    // Filter out invalid content items
    data.content = data.content.filter((item) => {
      // Remove gallery_link items (we use the new system)
      if (item.type === 'gallery_link') {
        removedCount++;
        return false;
      }

      // For image type items, check if the local file exists
      if (item.type === 'image') {
        if (!imageFileExists(item)) {
          removedCount++;
          return false;
        }
        return true;
      }

      // Keep all non-link items
      if (item.type !== 'link') {
        return true;
      }

      // For link items, skip if no value
      if (!item.value) {
        return true;
      }

      // Check if it's an external link
      if (isExternalLink(item.value)) {
        // Remove old site links
        if (isOldSiteLink(item.value)) {
          removedCount++;
          return false;
        }

        // Remove image links
        if (isImageLink(item.value)) {
          removedCount++;
          return false;
        }
      }

      // Keep all other items
      return true;
    });

    // Only write if changes were made
    if (removedCount > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 4) + '\n', 'utf-8');
      return { cleaned: true, removed: removedCount };
    }

    return { cleaned: false, removed: 0 };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return { cleaned: false, removed: 0 };
  }
}

// Process all files in a directory
function processDirectory(dirPath: string): { totalFiles: number; cleanedFiles: number; totalRemoved: number } {
  const files = fs.readdirSync(dirPath);
  let totalFiles = 0;
  let cleanedFiles = 0;
  let totalRemoved = 0;

  for (const file of files) {
    if (!file.endsWith('.json')) continue;

    const filePath = path.join(dirPath, file);
    totalFiles++;

    const result = processFile(filePath);
    if (result.cleaned) {
      cleanedFiles++;
      totalRemoved += result.removed;
      console.log(`✓ ${file}: Removed ${result.removed} invalid link(s)`);
    }
  }

  return { totalFiles, cleanedFiles, totalRemoved };
}

// Main function
function main() {
  console.log('🧹 Starting cleanup of invalid links...\n');

  console.log('📰 Processing vesti...');
  const vestiResult = processDirectory(VESTI_DIR);
  console.log(`\n📊 Vesti: ${vestiResult.cleanedFiles}/${vestiResult.totalFiles} files cleaned, ${vestiResult.totalRemoved} links removed\n`);

  console.log('🏆 Processing turniri...');
  const turniriResult = processDirectory(TURNIRI_DIR);
  console.log(`\n📊 Turniri: ${turniriResult.cleanedFiles}/${turniriResult.totalFiles} files cleaned, ${turniriResult.totalRemoved} links removed\n`);

  const totalCleaned = vestiResult.cleanedFiles + turniriResult.cleanedFiles;
  const totalRemoved = vestiResult.totalRemoved + turniriResult.totalRemoved;

  console.log(`\n✅ Done! Total: ${totalCleaned} files cleaned, ${totalRemoved} invalid links removed`);
}

main();
