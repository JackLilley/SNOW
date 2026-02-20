import { servicenowFrontEndPlugins, rollup, glob } from '@servicenow/isomorphic-rollup'

export default async ({ rootDir, config, fs, path, logger }) => {
  const clientDir = path.join(rootDir, config.clientDir)

  let htmlFiles = []
  try {
    const htmlFilePattern = path.join(clientDir, '**', '*.html')
    htmlFiles = await glob(htmlFilePattern, { fs })
  } catch (e) {
    // clientDir may not exist
  }

  if (!htmlFiles.length) {
    logger.info('No client HTML entry points found, skipping Rollup prebuild.')
    return
  }

  const staticContentDir = path.join(rootDir, config.staticContentDir)
  fs.rmSync(staticContentDir, { recursive: true, force: true })

  const rollupBundle = await rollup({
    fs,
    input: path.join(clientDir, '**', '*.html'),
    plugins: servicenowFrontEndPlugins({ scope: config.scope, rootDir: clientDir }),
  })
  const rollupOutput = await rollupBundle.write({
    dir: staticContentDir,
    sourcemap: true,
  })
  rollupOutput.output.forEach((file) => {
    if (file.type === 'asset') {
      logger.info(`Bundled asset: ${file.fileName} (${file.source.length} bytes)`)
    } else if (file.type === 'chunk') {
      logger.info(`Bundled chunk: ${file.fileName} (${file.code.length} bytes)`)
    }
  })
}
