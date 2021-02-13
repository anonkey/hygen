import ejs from 'ejs'
import fs from 'fs-extra'
import fm from 'front-matter'
import debug from 'debug'
import path from 'path'
import { RunnerConfig, ExtendedAttributes } from '../types'
import context from '../context'

const log = debug('hygen:render')
const logAttrs = debug('hygen:render:attrs')
const logData = debug('hygen:render:data')

const renderTemplate = (tmpl, locals, config) => {
  logData('renderTemplate', {
    isTplString: typeof tmpl === 'string',
    tmpl,
    ctx: context(locals, config),
  })
  if (typeof tmpl === 'string') {
    logAttrs(ejs.render(tmpl, context(locals, config)))
  }
  return typeof tmpl === 'string'
    ? ejs.render(tmpl, context(locals, config))
    : tmpl
}

const readFiles = (files: string[]) => {
  log('read files')
  return Promise.all(
    files.map((file) => {
      log(`load file ${file} ------------------------------`)
      return fs.readFile(file).then((text) => ({ file, text: text.toString() }))
    }),
  )
}

const renderAttrs = (attributes, args, config) => {
  // BC => new usage of locals param;
  const { locals, ...otherAttrs } = attributes
  let renderedLocals = {}
  if (locals) {
    renderedLocals =
      typeof locals === 'string'
        ? renderTemplate(locals, args, config)
        : renderAttrs(locals, args, config)
  }
  logAttrs({ locals, renderedLocals })
  const renderedAttrs = Object.entries(otherAttrs).reduce(
    (attrs, [key, value]) => {
      // BC => parsed attrs integrated one by one not only at end
      const currentLocals = { ...renderedLocals, ...attrs, ...args }

      return {
        ...attrs,
        [key]: (typeof value === 'object' ? renderAttrs : renderTemplate)(
          value,
          currentLocals,
          config,
        ),
      }
    },
    {} as ExtendedAttributes,
  )

  return {
    ...renderedLocals,
    ...renderedAttrs,
  }
}

const renderFiles = async (files: any[], args: any, config: RunnerConfig) => {
  const fileDatas = await readFiles(files)
  const filesFrontmatted = fileDatas.map(({ file, text }) => ({
    file,
    ...fm(text, { allowUnsafe: true }),
  }))

  let renderedFiles = []
  const promises = filesFrontmatted.map(async ({ file, attributes, body }) => {
    log('START', `Render Attrs`)
    logData('START', 'attributes', { attributes })
    logData('START', 'args', { args })
    logData('START', 'config', { config })
    const renderedAttrs = renderAttrs(attributes, args, config)
    logData('STARTEND', { renderedAttrs })

    const {
      to: _to,
      from: _from,
      force: _force,
      unless_exists: _unless_exists,
      inject: _inject,
      after: _after,
      skip_if: _skip_if,
      sh: _sh,
      children,
      ...localAttrs
    } = renderedAttrs as ExtendedAttributes
    const locals = { ...localAttrs, ...args, attributes: renderedAttrs }
    log(`Render Template`)
    logData({
      file,
      body,
      locals,
      config,
    })
    if (children) {
      const renderedChildren = await renderFiles(
        Object.values(children).map((child: string) =>
          path.join(config.templates, child),
        ),
        locals,
        config,
      )

      renderedFiles = [...renderedFiles, ...renderedChildren]
    }

    const renderedAction = {
      file,
      attributes: renderedAttrs,
      body: renderTemplate(
        body,
        // semi BC undefined values could not be now (localAttrs)
        { ...localAttrs, ...args, attributes: renderedAttrs },
        config,
      ),
    }
    logData({
      renderedAction,
    })
    log('End render -----------------------------')
    renderedFiles.unshift(renderedAction)
    return renderedAction
  })
  await Promise.all(promises)
  // potential BC -> new filter to remove could be use to run shell scripts
  return renderedFiles
}

export default renderFiles
