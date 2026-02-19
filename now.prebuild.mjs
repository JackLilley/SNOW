import { servicenowFrontEndPlugins, rollup, glob } from '@servicenow/isomorphic-rollup'

export default async ({ rootDir, config, fs, path, logger, registerExplicitId }) => {
  const clientDir = path.join(rootDir, config.clientDir)
  const htmlFilePattern = path.join(clientDir, '**', '*.html')
  const htmlFiles = await glob(htmlFilePattern, { fs })
  if (!htmlFiles.length) {
    logger.warn(`No HTML files found in ${clientDir}, skipping UI build.`)
    return
  }

  const staticContentDir = path.join(rootDir, config.staticContentDir)
  fs.rmSync(staticContentDir, { recursive: true, force: true })

  const hasModuleScript = htmlFiles.some((file) => {
    const content = fs.readFileSync(file, 'utf-8')
    return /<script[^>]+type\s*=\s*["']module["'][^>]*src\s*=/i.test(content)
  })

  if (!hasModuleScript) {
    logger.info('No module script entry points found — copying HTML files directly.')
    fs.mkdirSync(staticContentDir, { recursive: true })
    for (const file of htmlFiles) {
      const rel = path.relative(clientDir, file)
      const dest = path.join(staticContentDir, rel)
      fs.mkdirSync(path.dirname(dest), { recursive: true })
      fs.copyFileSync(file, dest)
      const stat = fs.statSync(dest)
      logger.info(`Copied asset: ${rel} (${stat.size} bytes)`)
    }
    return
  }

  const rollupBundle = await rollup({
    fs,
    input: htmlFilePattern,
    plugins: servicenowFrontEndPlugins({ scope: config.scope, rootDir: clientDir, registerExplicitId }),
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
