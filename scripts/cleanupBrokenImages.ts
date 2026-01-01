import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateContentFile, type ImageReference } from './lib/imageValidator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CleanupOptions {
  dryRun: boolean;
  verbose: boolean;
}

interface CleanupReport {
  timestamp: string;
  options: CleanupOptions;
  summary: {
    totalFiles: number;
    modifiedFiles: number;
    brokenImages: number;
  };
  brokenReferences: ImageReference[];
  modifiedFiles: string[];
}

function parseArgs(): CleanupOptions {
  const args = process.argv.slice(2);
  return {
    dryRun: args.includes('--dry-run') || args.includes('-d'),
    verbose: args.includes('--verbose') || args.includes('-v'),
  };
}

function getAllContentFiles(projectRoot: string): string[] {
  const vestiDir = path.join(projectRoot, 'src', 'content', 'vesti');
  const turniriDir = path.join(projectRoot, 'src', 'content', 'turniri');

  const vestiFiles = fs.readdirSync(vestiDir)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(vestiDir, f));

  const turniriFiles = fs.readdirSync(turniriDir)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(turniriDir, f));

  return [...vestiFiles, ...turniriFiles];
}

function generateHTMLReport(report: CleanupReport, outputPath: string): void {
  const html = `<!DOCTYPE html>
<html lang="sr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Image Cleanup Report - ${report.timestamp}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      background: #f5f5f5;
    }
    h1 { color: #2c3e50; margin-bottom: 1rem; font-size: 2rem; }
    h2 { color: #34495e; margin: 2rem 0 1rem; font-size: 1.5rem; border-bottom: 2px solid #3498db; padding-bottom: 0.5rem; }
    .summary {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }
    .summary ul { list-style: none; }
    .summary li {
      padding: 0.5rem 0;
      border-bottom: 1px solid #ecf0f1;
      display: flex;
      justify-content: space-between;
    }
    .summary li:last-child { border-bottom: none; }
    .summary .label { font-weight: 600; color: #7f8c8d; }
    .summary .value { font-weight: 700; color: #2c3e50; font-size: 1.1rem; }
    table {
      width: 100%;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-collapse: collapse;
    }
    thead {
      background: #3498db;
      color: white;
    }
    th, td {
      padding: 1rem;
      text-align: left;
    }
    tbody tr:nth-child(even) { background: #f8f9fa; }
    tbody tr:hover { background: #e3f2fd; }
    .restore {
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 8px;
      padding: 1.5rem;
      margin-top: 2rem;
    }
    .restore h2 { color: #856404; border-bottom-color: #ffc107; }
    pre {
      background: #2c3e50;
      color: #ecf0f1;
      padding: 1rem;
      border-radius: 4px;
      overflow-x: auto;
      margin-top: 0.5rem;
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.875rem;
      font-weight: 600;
    }
    .badge-success { background: #d4edda; color: #155724; }
    .badge-warning { background: #fff3cd; color: #856404; }
    .badge-danger { background: #f8d7da; color: #721c24; }
    .modified-files {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .modified-files ul {
      list-style: none;
      max-height: 400px;
      overflow-y: auto;
    }
    .modified-files li {
      padding: 0.5rem;
      border-bottom: 1px solid #ecf0f1;
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <h1>🧹 Image Cleanup Report</h1>
  <p><strong>Generated:</strong> ${new Date(report.timestamp).toLocaleString('sr-RS')}</p>
  <p><strong>Mode:</strong> <span class="badge ${report.options.dryRun ? 'badge-warning' : 'badge-success'}">${report.options.dryRun ? 'Dry Run (No Changes Made)' : 'Live Run (Changes Applied)'}</span></p>

  <div class="summary">
    <h2>📊 Summary</h2>
    <ul>
      <li>
        <span class="label">Files scanned:</span>
        <span class="value">${report.summary.totalFiles}</span>
      </li>
      <li>
        <span class="label">Files modified:</span>
        <span class="value">${report.summary.modifiedFiles}</span>
      </li>
      <li>
        <span class="label">Broken images removed:</span>
        <span class="value badge-danger">${report.summary.brokenImages}</span>
      </li>
    </ul>
  </div>

  <h2>❌ Broken Image References</h2>
  ${report.brokenReferences.length > 0 ? `
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Content File</th>
        <th>Type</th>
        <th>Block Index</th>
        <th>Image Path</th>
      </tr>
    </thead>
    <tbody>
      ${report.brokenReferences.map((ref, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td><code>${ref.contentFile}</code></td>
        <td><span class="badge ${ref.contentType === 'vesti' ? 'badge-success' : 'badge-warning'}">${ref.contentType}</span></td>
        <td>${ref.blockIndex}</td>
        <td><code>${ref.imagePath}</code></td>
      </tr>
      `).join('')}
    </tbody>
  </table>
  ` : '<p>No broken image references found.</p>'}

  ${report.modifiedFiles.length > 0 ? `
  <div class="modified-files">
    <h2>📝 Modified Files</h2>
    <ul>
      ${report.modifiedFiles.map(file => `<li>${file}</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  ${!report.options.dryRun && report.modifiedFiles.length > 0 ? `
  <div class="restore">
    <h2>🔄 Restore Instructions</h2>
    <p>If you need to restore the original files, use the backup directory created during cleanup:</p>
    <pre>cp backups/cleanup-${report.timestamp.replace(/:/g, '-')}/*.json src/content/vesti/
cp backups/cleanup-${report.timestamp.replace(/:/g, '-')}/*.json src/content/turniri/</pre>
  </div>
  ` : ''}

</body>
</html>`;

  fs.writeFileSync(outputPath, html, 'utf-8');
}

async function cleanupBrokenImages(): Promise<CleanupReport> {
  const options = parseArgs();
  const projectRoot = path.resolve(__dirname, '..');
  const publicDir = path.join(projectRoot, 'public');
  const timestamp = new Date().toISOString();
  const backupDir = path.join(projectRoot, 'backups', `cleanup-${timestamp.replace(/:/g, '-').split('.')[0]}`);

  console.log('🧹 Image Cleanup Tool');
  console.log('====================\n');
  console.log(`Mode: ${options.dryRun ? '🔍 DRY RUN (no changes will be made)' : '✍️  LIVE RUN (files will be modified)'}`);
  console.log(`Verbose: ${options.verbose ? 'Yes' : 'No'}\n`);

  // Create backup directory if not dry run
  if (!options.dryRun) {
    fs.mkdirSync(backupDir, { recursive: true });
    console.log(`📁 Backup directory created: ${backupDir}\n`);
  }

  // Get all content files
  const allFiles = getAllContentFiles(projectRoot);
  console.log(`📂 Found ${allFiles.length} content files to scan\n`);

  const brokenReferences: ImageReference[] = [];
  const modifiedFiles: string[] = [];

  // Process each file
  for (const filePath of allFiles) {
    const references = validateContentFile(filePath, publicDir);
    const brokenInFile = references.filter(ref => !ref.exists);

    if (brokenInFile.length > 0) {
      brokenReferences.push(...brokenInFile);

      if (options.verbose) {
        console.log(`📄 ${path.basename(filePath)}`);
        brokenInFile.forEach(ref => {
          console.log(`   ❌ Block ${ref.blockIndex}: ${ref.imagePath}`);
        });
        console.log('');
      }

      // Remove broken image blocks
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const brokenIndices = new Set(brokenInFile.map(ref => ref.blockIndex));

      const newContent = {
        ...content,
        content: content.content.filter((_: any, idx: number) => !brokenIndices.has(idx))
      };

      // Backup and write
      if (!options.dryRun) {
        const backupPath = path.join(backupDir, path.basename(filePath));
        fs.copyFileSync(filePath, backupPath);
        fs.writeFileSync(filePath, JSON.stringify(newContent, null, 2) + '\n', 'utf-8');
      }

      modifiedFiles.push(path.relative(projectRoot, filePath));
    }
  }

  // Generate report
  const report: CleanupReport = {
    timestamp,
    options,
    summary: {
      totalFiles: allFiles.length,
      modifiedFiles: modifiedFiles.length,
      brokenImages: brokenReferences.length,
    },
    brokenReferences,
    modifiedFiles,
  };

  console.log('\n📊 Cleanup Summary');
  console.log('==================');
  console.log(`Files scanned:     ${report.summary.totalFiles}`);
  console.log(`Files modified:    ${report.summary.modifiedFiles}`);
  console.log(`Broken images:     ${report.summary.brokenImages}\n`);

  if (!options.dryRun && modifiedFiles.length > 0) {
    const reportJsonPath = path.join(backupDir, 'cleanup-report.json');
    const reportHtmlPath = path.join(backupDir, 'cleanup-report.html');

    fs.writeFileSync(reportJsonPath, JSON.stringify(report, null, 2), 'utf-8');
    generateHTMLReport(report, reportHtmlPath);

    console.log(`📄 JSON report: ${reportJsonPath}`);
    console.log(`🌐 HTML report: ${reportHtmlPath}\n`);
  } else if (options.dryRun && brokenReferences.length > 0) {
    console.log('💡 Run without --dry-run flag to apply changes\n');
  }

  if (brokenReferences.length === 0) {
    console.log('✅ No broken image references found!\n');
  }

  return report;
}

// Run the cleanup
cleanupBrokenImages()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  });
