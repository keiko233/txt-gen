import * as fs from 'fs';
import * as path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

/**
 * Split text file function (by character count)
 * @param filePath Path to the original large text file
 * @param outputDir Output directory for split files
 * @param chunkSize Split chunk size (default 1000 characters, adjustable as needed)
 */
function splitTextFile(
  filePath: string,
  outputDir: string,
  chunkSize: number = 1000
): void {
  // Read file content (all at once; consider using streams for large files)
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  let index = 0;
  let partNumber = 1;
  while (index < fileContent.length) {
    const chunk = fileContent.slice(index, index + chunkSize);
    index += chunkSize;

    // Generate split file name, e.g. bigfile1_part_1.txt
    const baseName = path.basename(filePath, path.extname(filePath));
    const chunkFileName = `${baseName}_part_${partNumber++}.txt`;
    const outputFilePath = path.join(outputDir, chunkFileName);

    fs.writeFileSync(outputFilePath, chunk, 'utf-8');
    console.log(`Generated split file: ${outputFilePath}`);
  }
}

/**
 * Generate random combination files function (example: randomly select multiple lines to combine)
 * @param filePath Path to the original text file
 * @param outputDir Output directory
 * @param randomCount How many random versions to generate for each original file
 * @param randomLines How many lines to select for each random version
 */
function generateRandomFiles(
  filePath: string,
  outputDir: string,
  randomCount: number,
  randomLines: number
): void {
  // Read and split into lines
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split(/\r?\n/);

  // Original filename (without extension)
  const baseName = path.basename(filePath, path.extname(filePath));

  for (let i = 1; i <= randomCount; i++) {
    // Prepare array for randomly selected lines
    const selectedLines: string[] = [];
    for (let j = 0; j < randomLines; j++) {
      // Randomly select a line from lines array
      const randomIndex = Math.floor(Math.random() * lines.length);
      selectedLines.push(lines[randomIndex]);
    }
    // Combine into new text
    const randomContent = selectedLines.join('\n');

    // Filename example: bigfile1_random_1.txt
    const randomFileName = `${baseName}_random_${i}.txt`;
    const outputFilePath = path.join(outputDir, randomFileName);

    fs.writeFileSync(outputFilePath, randomContent, 'utf-8');
    console.log(`Generated random combination file: ${outputFilePath}`);
  }
}

async function main() {
  // Parse command line arguments using yargs
  const argv = yargs(hideBin(process.argv))
    .option('input', {
      alias: 'i',
      type: 'string',
      description: 'Input directory path',
      demandOption: true
    })
    .option('output', {
      alias: 'o',
      type: 'string',
      description: 'Output directory path',
      default: 'output',
    })
    .option('chunkSize', {
      alias: 'c',
      type: 'number',
      description: 'Split chunk size (in characters)',
      default: 1000
    })
    .option('randomCount', {
      alias: 'r',
      type: 'number',
      description: 'Number of random combinations to generate per file',
      default: 0
    })
    .option('randomLines', {
      alias: 'l',
      type: 'number',
      description: 'Number of lines to select for each random combination',
      default: 10
    })
    .help()
    .parseSync();

  const inputDir = path.resolve(argv.input);
  const outputDir = path.resolve(argv.output);
  const chunkSize = argv.chunkSize;
  const randomCount = argv.randomCount;
  const randomLines = argv.randomLines;

  console.log('Input directory:', inputDir);
  console.log('Output directory:', outputDir);
  console.log('Split chunk size:', chunkSize);
  console.log('Random file count:', randomCount);
  console.log('Random lines per file:', randomLines);

  // Create outputDir if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log('Created output directory:', outputDir);
  }

  // Read all files from inputDir and filter .txt files
  const files = fs.readdirSync(inputDir);
  const txtFiles = files.filter((file) => path.extname(file).toLowerCase() === '.txt');

  // Process each .txt file
  for (const txtFile of txtFiles) {
    const filePath = path.join(inputDir, txtFile);
    console.log(`Processing file: ${filePath}`);

    // 1) Split file
    splitTextFile(filePath, outputDir, chunkSize);

    // 2) Generate random combinations if randomCount > 0
    if (randomCount > 0) {
      generateRandomFiles(filePath, outputDir, randomCount, randomLines);
    }
  }

  console.log('All files processed successfully!');
}

main();