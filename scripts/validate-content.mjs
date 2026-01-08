#!/usr/bin/env node

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = dirname(__dirname);

// ANSI color codes
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function validateFrontmatter(filePath, content, type) {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    throw new Error('No frontmatter found');
  }

  const frontmatter = frontmatterMatch[1];
  const errors = [];

  // Common validations
  if (!frontmatter.includes('title:')) {
    errors.push('Missing title field');
  }
  
  if (!frontmatter.includes('draft:')) {
    errors.push('Missing draft field');
  }

  // Type-specific validations
  if (type === 'projects') {
    const requiredFields = ['type:', 'year:', 'summary:', 'stack:'];
    requiredFields.forEach(field => {
      if (!frontmatter.includes(field)) {
        errors.push(`Missing ${field.slice(0, -1)} field`);
      }
    });

    // Validate project type
    if (frontmatter.includes('type:')) {
      const typeMatch = frontmatter.match(/type:\s*["']?(creative|technical)["']?/);
      if (!typeMatch) {
        errors.push('Invalid project type (must be "creative" or "technical")');
      }
    }

    // Validate year
    if (frontmatter.includes('year:')) {
      const yearMatch = frontmatter.match(/year:\s*(\d+)/);
      if (yearMatch) {
        const year = parseInt(yearMatch[1]);
        const currentYear = new Date().getFullYear();
        if (year < 2005 || year > currentYear) {
          errors.push(`Invalid year: ${year} (must be between 2005 and ${currentYear})`);
        }
      }
    }
  }

  if (type === 'blog') {
    const requiredFields = ['date:', 'summary:'];
    requiredFields.forEach(field => {
      if (!frontmatter.includes(field)) {
        errors.push(`Missing ${field.slice(0, -1)} field`);
      }
    });
  }

  return errors;
}

async function validateContentDirectory(contentType) {
  const contentDir = join(projectRoot, 'src', 'content', contentType);
  
  try {
    const files = await readdir(contentDir);
    const markdownFiles = files.filter(file => file.endsWith('.md'));
    
    log(`\n📁 Validating ${contentType} (${markdownFiles.length} files)`, 'blue');
    
    let totalErrors = 0;
    
    for (const file of markdownFiles) {
      const filePath = join(contentDir, file);
      const content = await readFile(filePath, 'utf-8');
      
      try {
        const errors = await validateFrontmatter(filePath, content, contentType);
        
        if (errors.length === 0) {
          log(`  ✅ ${file}`, 'green');
        } else {
          log(`  ❌ ${file}`, 'red');
          errors.forEach(error => {
            log(`    • ${error}`, 'red');
          });
          totalErrors += errors.length;
        }
      } catch (error) {
        log(`  ❌ ${file}: ${error.message}`, 'red');
        totalErrors++;
      }
    }
    
    return { files: markdownFiles.length, errors: totalErrors };
  } catch (error) {
    log(`  ❌ Could not read ${contentType} directory: ${error.message}`, 'red');
    return { files: 0, errors: 1 };
  }
}

async function main() {
  log('🔍 Content Validation Script', 'bold');
  log('Checking frontmatter and required fields...\n');
  
  const results = await Promise.all([
    validateContentDirectory('projects'),
    validateContentDirectory('blog')
  ]);
  
  const totalFiles = results.reduce((sum, result) => sum + result.files, 0);
  const totalErrors = results.reduce((sum, result) => sum + result.errors, 0);
  
  log(`\n📊 Summary`, 'bold');
  log(`Total files: ${totalFiles}`);
  log(`Total errors: ${totalErrors}`, totalErrors > 0 ? 'red' : 'green');
  
  if (totalErrors === 0) {
    log('\n🎉 All content validation passed!', 'green');
    process.exit(0);
  } else {
    log('\n💥 Content validation failed. Please fix the errors above.', 'red');
    process.exit(1);
  }
}

main().catch(error => {
  log(`💥 Script error: ${error.message}`, 'red');
  process.exit(1);
});
