import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import { buildGalleryData } from '../src/utils/buildGalleryData.js';
import { getTopMatches } from '../src/utils/fuzzyMatchEvents.js';
import type { ContentGalleryLinksData, ContentGalleryLink } from '../src/types/contentLinks.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
};

interface ContentFile {
  type: 'vesti' | 'turniri';
  id: string;
  filePath: string;
  data: any;
}

function loadContentFiles(projectRoot: string): ContentFile[] {
  const vestiDir = path.join(projectRoot, 'src', 'content', 'vesti');
  const turniriDir = path.join(projectRoot, 'src', 'content', 'turniri');

  const files: ContentFile[] = [];

  // Load vesti
  const vestiFiles = fs.readdirSync(vestiDir).filter(f => f.endsWith('.json'));
  for (const file of vestiFiles) {
    const filePath = path.join(vestiDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    files.push({
      type: 'vesti',
      id: path.basename(file, '.json'),
      filePath,
      data
    });
  }

  // Load turniri
  const turniriFiles = fs.readdirSync(turniriDir).filter(f => f.endsWith('.json'));
  for (const file of turniriFiles) {
    const filePath = path.join(turniriDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    files.push({
      type: 'turniri',
      id: path.basename(file, '.json'),
      filePath,
      data
    });
  }

  return files;
}

function loadExistingLinks(projectRoot: string): ContentGalleryLinksData {
  const linksPath = path.join(projectRoot, 'src', 'data', 'contentGalleryLinks.json');

  if (fs.existsSync(linksPath)) {
    return JSON.parse(fs.readFileSync(linksPath, 'utf-8'));
  }

  return {
    version: '1.0',
    lastUpdated: new Date().toISOString(),
    links: []
  };
}

function saveLinks(projectRoot: string, linksData: ContentGalleryLinksData): void {
  const linksPath = path.join(projectRoot, 'src', 'data', 'contentGalleryLinks.json');
  linksData.lastUpdated = new Date().toISOString();
  fs.writeFileSync(linksPath, JSON.stringify(linksData, null, 2), 'utf-8');
}

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function linkContent(): Promise<void> {
  const projectRoot = path.resolve(__dirname, '..');
  const args = process.argv.slice(2);
  const autoMode = args.includes('--auto') || args.includes('-a');
  const autoThreshold = 70;

  console.log(`${colors.bold}${colors.cyan}📸 Content to Gallery Linking Tool${colors.reset}\n`);
  if (autoMode) {
    console.log(`${colors.yellow}🤖 AUTO MODE: Automatski povezivanje sa score > ${autoThreshold}${colors.reset}\n`);
  }
  console.log(`${colors.gray}═══════════════════════════════════════════════════════${colors.reset}\n`);

  // Load data
  console.log('📂 Učitavanje podataka...\n');
  const galleryData = buildGalleryData();
  const contentFiles = loadContentFiles(projectRoot);
  const linksData = loadExistingLinks(projectRoot);

  const existingLinksMap = new Map(
    linksData.links.map(link => [`${link.contentType}:${link.contentId}`, link])
  );

  console.log(`${colors.green}✓${colors.reset} Pronađeno ${colors.bold}${contentFiles.length}${colors.reset} fajlova sa sadržajem`);
  console.log(`${colors.green}✓${colors.reset} Pronađeno ${colors.bold}${galleryData.totalEvents}${colors.reset} galerija događaja`);
  console.log(`${colors.green}✓${colors.reset} Učitano ${colors.bold}${linksData.links.length}${colors.reset} postojećih linkova\n`);

  console.log(`${colors.gray}═══════════════════════════════════════════════════════${colors.reset}\n`);

  let processedCount = 0;
  let linkedCount = 0;
  let skippedCount = 0;

  const allEvents = galleryData.periods.flatMap(p => p.events);

  for (const content of contentFiles) {
    const key = `${content.type}:${content.id}`;
    const existingLink = existingLinksMap.get(key);

    // Skip if already linked
    if (existingLink) {
      console.log(`${colors.gray}⏭  ${content.id} - već povezano${colors.reset}`);
      skippedCount++;
      continue;
    }

    processedCount++;
    console.log(`\n${colors.bold}[${processedCount}/${contentFiles.length - linksData.links.length}] ${content.type.toUpperCase()}: ${content.id}${colors.reset}`);
    console.log(`${colors.cyan}Naslov:${colors.reset} ${content.data.title}`);
    console.log(`${colors.cyan}Datum:${colors.reset} ${content.data.date || 'Nema datuma'}\n`);

    // Get top matches
    const matches = getTopMatches(
      content.data.title,
      content.data.date,
      allEvents,
      3
    );

    if (matches.length === 0) {
      console.log(`${colors.yellow}⚠  Nema pronađenih podudaranja${colors.reset}`);
      if (!autoMode) {
        console.log(`${colors.gray}Pritisnite Enter za nastavak...${colors.reset}`);
        await prompt('');
      }
      skippedCount++;
      continue;
    }

    // Display matches
    console.log(`${colors.bold}Top podudaranja:${colors.reset}\n`);
    matches.forEach((match, idx) => {
      const scoreColor = match.score >= 70 ? colors.green : match.score >= 50 ? colors.yellow : colors.red;
      console.log(`${colors.bold}[${idx + 1}]${colors.reset} ${scoreColor}Score: ${match.score.toFixed(0)}${colors.reset} - ${match.galleryEvent.title} (${match.galleryEvent.year})`);
      console.log(`    ${colors.gray}${match.reasons.join(', ')}${colors.reset}\n`);
    });

    let selectedEvent = null;
    let matchType: 'auto' | 'manual' = 'auto';
    let confidence = 0;

    // AUTO MODE: Automatically link if top match score > threshold
    if (autoMode) {
      const topMatch = matches[0];
      if (topMatch.score >= autoThreshold) {
        selectedEvent = topMatch.galleryEvent;
        matchType = 'auto';
        confidence = topMatch.score / 100;
        console.log(`${colors.green}🤖 AUTO: Prihvaćeno (score ${topMatch.score.toFixed(0)})${colors.reset}\n`);
      } else {
        console.log(`${colors.yellow}⏭  AUTO: Preskočeno (score ${topMatch.score.toFixed(0)} < ${autoThreshold})${colors.reset}\n`);
        skippedCount++;
        continue;
      }
    } else {
      // MANUAL MODE: Ask user
      console.log(`${colors.gray}Akcije:${colors.reset}`);
      console.log(`  ${colors.green}[1-3]${colors.reset} Prihvati podudaranje`);
      console.log(`  ${colors.yellow}[s]${colors.reset}   Preskoči`);
      console.log(`  ${colors.blue}[m]${colors.reset}   Manuelni unos (unesite ID galerije)`);
      console.log(`  ${colors.red}[q]${colors.reset}   Sačuvaj i izađi\n`);

      const answer = await prompt(`${colors.bold}Vaš izbor:${colors.reset} `);

      if (answer === 'q') {
        console.log(`\n${colors.yellow}💾 Čuvanje i izlazak...${colors.reset}\n`);
        saveLinks(projectRoot, linksData);
        break;
      }

      if (answer === 's') {
        console.log(`${colors.gray}⏭  Preskočeno${colors.reset}`);
        skippedCount++;
        continue;
      }

      if (answer === 'm') {
        const manualId = await prompt(`${colors.blue}Unesite ID galerije:${colors.reset} `);
        selectedEvent = allEvents.find(e => e.id === manualId);

        if (!selectedEvent) {
          console.log(`${colors.red}❌ Galerija sa ID "${manualId}" nije pronađena${colors.reset}`);
          skippedCount++;
          continue;
        }

        matchType = 'manual';
        confidence = 1.0;
      } else {
        const matchIndex = parseInt(answer);
        if (matchIndex >= 1 && matchIndex <= matches.length) {
          selectedEvent = matches[matchIndex - 1].galleryEvent;
          matchType = 'auto';
          confidence = matches[matchIndex - 1].score / 100;
        } else {
          console.log(`${colors.red}❌ Nevažeći izbor${colors.reset}`);
          skippedCount++;
          continue;
        }
      }
    }

    if (selectedEvent) {
      const newLink: ContentGalleryLink = {
        contentType: content.type,
        contentId: content.id,
        galleryEventId: selectedEvent.id,
        matchType,
        confidence,
        confirmedAt: new Date().toISOString()
      };

      linksData.links.push(newLink);
      existingLinksMap.set(key, newLink);

      console.log(`${colors.green}✓ Povezano:${colors.reset} ${content.id} → ${selectedEvent.title}\n`);
      linkedCount++;

      // Auto-save every 5 links
      if (linkedCount % 5 === 0) {
        saveLinks(projectRoot, linksData);
        console.log(`${colors.gray}💾 Auto-save: ${linkedCount} linkova sačuvano${colors.reset}\n`);
      }
    }
  }

  // Final save
  saveLinks(projectRoot, linksData);

  console.log(`\n${colors.gray}═══════════════════════════════════════════════════════${colors.reset}\n`);
  console.log(`${colors.bold}📊 Rezime:${colors.reset}\n`);
  console.log(`  Ukupno fajlova:        ${contentFiles.length}`);
  console.log(`  ${colors.green}Povezano (novo):       ${linkedCount}${colors.reset}`);
  console.log(`  ${colors.gray}Već povezano:          ${skippedCount - (contentFiles.length - processedCount - linkedCount)}${colors.reset}`);
  console.log(`  ${colors.yellow}Preskočeno:            ${skippedCount}${colors.reset}`);
  console.log(`  ${colors.cyan}Ukupno linkova:        ${linksData.links.length}${colors.reset}\n`);

  console.log(`${colors.green}✓ Podaci sačuvani u: src/data/contentGalleryLinks.json${colors.reset}\n`);
}

// Run the tool
linkContent()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(`${colors.red}❌ Greška:${colors.reset}`, error);
    process.exit(1);
  });
