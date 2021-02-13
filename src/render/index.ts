import path from 'path'
import walk from 'ignore-walk'
import { RunnerConfig, RenderedAction } from '../types'
import renderFiles from './renderFiles'

const ignores = [
  'prompt.js',
  'index.js',
  '.hygenignore',
  '.DS_Store',
  '.Spotlight-V100',
  '.Trashes',
  'ehthumbs.db',
  'Thumbs.db',
]

async function getFiles(dir) {
  const files = walk
    .sync({ path: dir, ignoreFiles: ['.hygenignore'] })
    .map((f) => path.join(dir, f))
  return files
}

const filterFiles = (files: string[], args, config) => {
  const filteredFiles = files
    .sort((a, b) => a.localeCompare(b)) // TODO: add a test to verify this sort
    .filter(
      (f) =>
        ![...ignores, ...(config.ignores || [])].find((ig) => f.endsWith(ig)),
    ) // TODO: add a
  // test for ignoring prompt.js and index.js

  return args.subaction
    ? filteredFiles.filter((file) =>
        file.replace(args.actionfolder, '').match(args.subaction),
      )
    : filteredFiles
}

const render = async (
  args: any,
  config: RunnerConfig,
): Promise<RenderedAction[]> => {
  const files = await getFiles(args.actionfolder)
  const filteredFiles = filterFiles(files, args, config)

  return renderFiles(filteredFiles, args, config)
}

export default render
