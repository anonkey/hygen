import debug from 'debug'
import resolve from './ops'
import { RunnerConfig, RenderedAction, ActionResult } from './types'

const log = debug('hygen:execute')
const logData = debug('hygen:execute:data')

const execute = async (
  renderedActions: RenderedAction[],
  args: any,
  config: RunnerConfig,
) => {
  const { logger } = config
  const results = []
  if (renderedActions.some((a) => a.attributes.message)) {
    logger.colorful(`${args.action}:\n`)
  }
  log({ renderedActions })

  for (const action of renderedActions) {
    log(`Action ${action ? action.file : 'unknown'}`)

    logData({ action, args, config })
    const { message } = action.attributes

    const ops = resolve(action.attributes)
    logData({ ops })
    for (const op of ops) {
      results.push(await op(action, args, config))
    }

    if (message) {
      logger.colorful(`${message}\n`)
    }
  }

  return results as ActionResult[]
}

export default execute
