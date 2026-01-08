import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const projectRoot = path.resolve(__dirname, '..');
const creativeImagesDir = path.join(projectRoot, 'public', 'images', 'projects', 'creative');
const projectsContentDir = path.join(projectRoot, 'src', 'content', 'projects');

// Helper function to get all image files from a directory
function getImageFiles(dir) {
  try {
    const files = fs.readdirSync(dir);
    return files
      .filter(file => /\.(png|jpg|jpeg|gif|webp)$/i.test(file))
      .filter(file => file !== 'cover.png' && file !== 'cover.jpg' && file !== 'cover.jpeg')
      .sort();
  } catch (error) {
    console.warn(`Could not read directory ${dir}:`, error.message);
    return [];
  }
}

// Helper function to parse frontmatter
function parseFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!frontmatterMatch) {
    throw new Error('No frontmatter found');
  }
  
  const frontmatter = frontmatterMatch[1];
  const body = frontmatterMatch[2];
  
  return { frontmatter, body };
}

// Helper function to extract existing gallery from frontmatter
function extractGallery(frontmatter) {
  const galleryMatch = frontmatter.match(/gallery:\s*\n((?:\s*- src:[\s\S]*?(?=\n\w|$))*)/);
  if (!galleryMatch) return [];
  
  const galleryText = galleryMatch[1];
  const items = [];
  const itemMatches = galleryText.matchAll(/- src: ["']?([^"'\n]+)["']?\s*\n\s*alt: ["']?([^"'\n]+)["']?(?:\s*\n\s*caption: ["']?([^"'\n]+)["']?)?/g);
  
  for (const match of itemMatches) {
    items.push({
      src: match[1],
      alt: match[2],
      caption: match[3] || undefined
    });
  }
  
  return items;
}

// Helper function to generate gallery YAML
function generateGalleryYaml(images, projectTitle, projectPath) {
  if (images.length === 0) return '';
  
  const galleryItems = images.map(image => {
    const imagePath = `/images/projects/creative/${projectPath}/${image}`;
    const altText = `${projectTitle} - ${image.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')}`;
    
    return `  - src: "${imagePath}"
    alt: "${altText}"`;
  }).join('\n');
  
  return `gallery:
${galleryItems}`;
}

// Helper function to update frontmatter with new gallery
function updateFrontmatter(frontmatter, newGallery) {
  // Remove existing gallery if present
  let updatedFrontmatter = frontmatter.replace(/gallery:\s*\n((?:\s*- src:[\s\S]*?(?=\n\w|$))*)/, '').trim();
  
  // Add new gallery at the end
  if (newGallery) {
    updatedFrontmatter += '\n' + newGallery;
  }
  
  return updatedFrontmatter;
}

// Main function
async function updateCreativeGalleries() {
  console.log('🎨 Starting creative gallery update...\n');
  
  // Get all creative project directories
  const creativeProjects = fs.readdirSync(creativeImagesDir)
    .filter(item => {
      const itemPath = path.join(creativeImagesDir, item);
      return fs.statSync(itemPath).isDirectory();
    });
  
  let updatedCount = 0;
  let processedCount = 0;
  
  for (const projectDir of creativeProjects) {
    const projectPath = path.join(creativeImagesDir, projectDir);
    const mdFilePath = path.join(projectsContentDir, `${projectDir}.md`);
    
    console.log(`📁 Processing: ${projectDir}`);
    
    // Check if MD file exists
    if (!fs.existsSync(mdFilePath)) {
      console.log(`   ⚠️  No MD file found for ${projectDir}`);
      continue;
    }
    
    // Get available images
    const availableImages = getImageFiles(projectPath);
    console.log(`   📸 Found ${availableImages.length} images: ${availableImages.join(', ')}`);
    
    if (availableImages.length === 0) {
      console.log(`   ⚠️  No gallery images found for ${projectDir}`);
      processedCount++;
      continue;
    }
    
    // Read and parse MD file
    const mdContent = fs.readFileSync(mdFilePath, 'utf-8');
    const { frontmatter, body } = parseFrontmatter(mdContent);
    
    // Extract project title
    const titleMatch = frontmatter.match(/title:\s*["']?([^"'\n]+)["']?/);
    const projectTitle = titleMatch ? titleMatch[1] : projectDir;
    
    // Extract existing gallery
    const existingGallery = extractGallery(frontmatter);
    const existingImagePaths = existingGallery.map(item => 
      path.basename(item.src)
    );
    
    console.log(`   📋 Current gallery: ${existingImagePaths.length} images`);
    
    // Find missing images
    const missingImages = availableImages.filter(img => !existingImagePaths.includes(img));
    
    if (missingImages.length === 0) {
      console.log(`   ✅ Gallery is already complete\n`);
      processedCount++;
      continue;
    }
    
    console.log(`   🔄 Adding ${missingImages.length} missing images: ${missingImages.join(', ')}`);
    
    // Generate new gallery with all images
    const newGallery = generateGalleryYaml(availableImages, projectTitle, projectDir);
    
    // Update frontmatter
    const updatedFrontmatter = updateFrontmatter(frontmatter, newGallery);
    
    // Write updated content
    const updatedContent = `---\n${updatedFrontmatter}\n---\n${body}`;
    fs.writeFileSync(mdFilePath, updatedContent, 'utf-8');
    
    console.log(`   ✅ Updated ${projectDir}.md\n`);
    updatedCount++;
    processedCount++;
  }
  
  console.log(`\n🎉 Update complete!`);
  console.log(`📊 Processed: ${processedCount} projects`);
  console.log(`✨ Updated: ${updatedCount} projects`);
  console.log(`⚡ No changes needed: ${processedCount - updatedCount} projects`);
}

// Run the script
updateCreativeGalleries().catch(console.error);
