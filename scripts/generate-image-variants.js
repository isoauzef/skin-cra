#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const fsPromises = require('fs/promises');
const sharp = require('sharp');

const SOURCE_DIRS = [
  path.resolve(__dirname, '../public/assets/img'),
  path.resolve(__dirname, '../public/uploads'),
];

const SUPPORTED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg']);

const createdFiles = [];
const failedFiles = [];

sharp.cache(false);

const pathExists = async (targetPath) => {
  try {
    await fsPromises.access(targetPath);
    return true;
  } catch (_error) {
    return false;
  }
};

const processImage = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    return;
  }

  const basePath = filePath.slice(0, filePath.length - ext.length);
  const avifPath = `${basePath}.avif`;
  const webpPath = `${basePath}.webp`;

  const image = sharp(filePath);

  if (!fs.existsSync(avifPath)) {
    try {
      await image.clone().avif({ quality: 60, effort: 4 }).toFile(avifPath);
      createdFiles.push(avifPath);
    } catch (error) {
      failedFiles.push({ file: filePath, variant: avifPath, message: error.message });
    }
  }

  if (!fs.existsSync(webpPath)) {
    try {
      await image.clone().webp({ quality: 80 }).toFile(webpPath);
      createdFiles.push(webpPath);
    } catch (error) {
      failedFiles.push({ file: filePath, variant: webpPath, message: error.message });
    }
  }
};

const walkDirectory = async (dirPath) => {
  const entries = await fsPromises.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      await walkDirectory(fullPath);
    } else {
      await processImage(fullPath);
    }
  }
};

const main = async () => {
  for (const dirPath of SOURCE_DIRS) {
    if (await pathExists(dirPath)) {
      await walkDirectory(dirPath);
    }
  }

  for (const created of createdFiles) {
    const relativePath = path.relative(process.cwd(), created);
    console.log(`Generated ${relativePath}`);
  }

  if (failedFiles.length > 0) {
    console.warn('Some image variants failed to generate:');
    for (const failure of failedFiles) {
      const relativeSource = path.relative(process.cwd(), failure.file);
      const relativeVariant = path.relative(process.cwd(), failure.variant);
      console.warn(`  ${relativeVariant} (from ${relativeSource}): ${failure.message}`);
    }
    process.exitCode = 1;
  }
};

main().catch((error) => {
  console.error('Failed to generate image variants:', error);
  process.exitCode = 1;
});
