import { basename, extname, join, resolve } from "https://deno.land/std@0.224.0/path/mod.ts";
import { ensureDir } from "https://deno.land/std@0.224.0/fs/mod.ts";
import { parse } from "https://deno.land/std@0.224.0/flags/mod.ts";

/**
 * Split text file function (by character count)
 */
async function splitTextFile(
  filePath: string,
  outputDir: string,
  chunkSize: number = 1000,
): Promise<void> {
  const fileContent = await Deno.readTextFile(filePath);

  let index = 0;
  let partNumber = 1;
  while (index < fileContent.length) {
    const chunk = fileContent.slice(index, index + chunkSize);
    index += chunkSize;

    const baseName = basename(filePath, extname(filePath));
    const chunkFileName = `${baseName}_part_${partNumber++}.txt`;
    const outputFilePath = join(outputDir, chunkFileName);

    await Deno.writeTextFile(outputFilePath, chunk);
    console.log(`Generated split file: ${outputFilePath}`);
  }
}

/**
 * Generate random combination files function
 */
async function generateRandomFiles(
  filePath: string,
  outputDir: string,
  randomCount: number,
  randomLines: number,
): Promise<void> {
  const fileContent = await Deno.readTextFile(filePath);
  const lines = fileContent.split(/\r?\n/);
  const baseName = basename(filePath, extname(filePath));

  for (let i = 1; i <= randomCount; i++) {
    const selectedLines: string[] = [];
    for (let j = 0; j < randomLines; j++) {
      const randomIndex = Math.floor(Math.random() * lines.length);
      selectedLines.push(lines[randomIndex]!);
    }
    const randomContent = selectedLines.join("\n");
    const randomFileName = `${baseName}_random_${i}.txt`;
    const outputFilePath = join(outputDir, randomFileName);

    await Deno.writeTextFile(outputFilePath, randomContent);
    console.log(`Generated random combination file: ${outputFilePath}`);
  }
}

async function main() {
  const args = parse(Deno.args, {
    string: ["input", "output"],
    alias: {
      i: "input",
      o: "output",
      c: "chunkSize",
      r: "randomCount",
      l: "randomLines",
      h: "help",
    },
    default: {
      output: "output",
      chunkSize: 1000,
      randomCount: 0,
      randomLines: 10,
    },
  });

  if (args["h"] || args["help"] || !args.input) {
    console.log(`
Usage: deno run --allow-read --allow-write main.ts [options]

Options:
  -i, --input <dir>         Input directory path (required)
  -o, --output <dir>        Output directory path (default: output)
  -c, --chunkSize <size>    Split chunk size in characters (default: 1000)
  -r, --randomCount <num>   Number of random combinations per file (default: 0)
  -l, --randomLines <num>   Number of lines per random combination (default: 10)
  -h, --help               Show this help message
    `);
    Deno.exit(args.input ? 0 : 1);
  }

  const inputDir = resolve(args.input as string);
  const outputDir = resolve(args.output as string);
  const chunkSize = Number(args.chunkSize) || 1000;
  const randomCount = Number(args.randomCount) || 0;
  const randomLines = Number(args.randomLines) || 10;

  console.log("Input directory:", inputDir);
  console.log("Output directory:", outputDir);
  console.log("Split chunk size:", chunkSize);
  console.log("Random file count:", randomCount);
  console.log("Random lines per file:", randomLines);

  // Create output directory
  await ensureDir(outputDir);
  console.log("Ensured output directory exists:", outputDir);

  // Read all .txt files from input directory
  const txtFiles: string[] = [];

  try {
    for await (const dirEntry of Deno.readDir(inputDir)) {
      if (dirEntry.isFile && extname(dirEntry.name).toLowerCase() === ".txt") {
        txtFiles.push(dirEntry.name);
      }
    }
  } catch (err) {
    console.error(`Error reading input directory: ${(err as Error).message}`);
    Deno.exit(1);
  }

  if (txtFiles.length === 0) {
    console.log("No .txt files found in input directory");
    return;
  }

  // Process each .txt file
  for (const txtFile of txtFiles) {
    const filePath = join(inputDir, txtFile);
    console.log(`Processing file: ${filePath}`);

    try {
      // Split file
      await splitTextFile(filePath, outputDir, chunkSize);

      // Generate random combinations if needed
      if (randomCount > 0) {
        await generateRandomFiles(
          filePath,
          outputDir,
          randomCount,
          randomLines,
        );
      }
    } catch (err) {
      console.error(
        `Error processing file ${filePath}: ${(err as Error).message}`,
      );
    }
  }

  console.log("All files processed successfully!");
}

if (import.meta.main) {
  main();
}
