import {resolve as _resolve} from 'path';
import {createReadStream} from 'fs';
import {readFile, writeFile} from 'fs/promises';
import {createHash} from 'crypto';
import StreamZip from 'node-stream-zip';
import minimist from 'minimist';

const HASH_FUNCTION = 'sha512';

/**
 * Returns manifest from zipped archive
 *
 * @param {string} filePath path to the zip file
 * @return {object} manifest object
 */
async function getManifest(filePath) {
  // eslint-disable-next-line new-cap -- mandated by the external dependency
  const zip = new StreamZip.async({file: filePath});

  const manifestData = await zip.entryData('manifest.json');
  const manifestJson = JSON.parse(manifestData.toString());

  await zip.close();

  return manifestJson;
}

/**
 * Parses object from the JSON file
 *
 * @param {string} filePath JSON file path
 * @return {object} object from the JSON file
 */
async function parseJsonFile(filePath) {
  const file = await readFile(filePath);
  return JSON.parse(file);
}

/**
 * Calculates hash for the file
 * @param {string} filePath path to the file to generate the hash for
 * @return {Promise<string>} file hash
 */
function calculateFileHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash(HASH_FUNCTION);
    const fileStream = createReadStream(filePath);

    fileStream.on('error', (error) => reject(error));
    fileStream.on('data', (dataChunk) => hash.update(dataChunk));
    fileStream.on('end', () => resolve(hash.digest('hex')));
  });
}

/**
 * Generates new update manifest
 * @param {string} extensionUpdateLink external link to the updated extension
 * file
 * @param {string} existingUpdateManifestPath path to the existing update
 * manifest
 * @param {string} extensionFilePath path to the new extension file
 * @param {string} newUpdateManifestPath path to the new update manifest
 */
async function generateUpdateManifest(extensionUpdateLink,
    existingUpdateManifestPath, extensionFilePath, newUpdateManifestPath) {
  const existingUpdateManifest =
   await parseJsonFile(existingUpdateManifestPath);

  const manifest = await getManifest(_resolve(extensionFilePath));

  const applicationId = manifest.browser_specific_settings.gecko.id;
  const version = manifest.version;

  const applicationEntry = existingUpdateManifest.addons[applicationId];
  const applicationUpdates = applicationEntry.updates;
  const updateForCurrentVersionAlreadyExists = applicationUpdates.some(
      (update) => version === update.version);
  if (updateForCurrentVersionAlreadyExists) {
    throw new Error(`Update entry for version '${version}' already exists`);
  }

  const extensionFileHash =
   await calculateFileHash(_resolve(extensionFilePath));

  applicationUpdates.push({
    version: version,
    update_link: extensionUpdateLink,
    update_hash: `${HASH_FUNCTION}:${extensionFileHash}`,
    browser_specific_settings: {
      gecko: {
        strict_min_version:
         manifest.browser_specific_settings.gecko.strict_min_version,
      },
    },
  });

  const updatedManifestJson = JSON.stringify(existingUpdateManifest, null, 2);
  await writeFile(newUpdateManifestPath, updatedManifestJson);
}

const args = minimist(process.argv.slice(2));
generateUpdateManifest(args.updateLink, _resolve(args.existingUpdateManifest),
    args.extensionFilePath, _resolve(args.newUpdateManifestPath));
