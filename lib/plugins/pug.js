'use strict'
const fs = require('fs')
const path = require('path')
const pug = require('pug')
const caches = {}

module.exports = function (app, globalOptions = {}) {
  if (app.context.render) throw new Error('app.context.render is exist!')
  const rootDir = globalOptions.root || process.cwd()
  app.context.render = async function (view, data = {}, options = {}) {
    const extension = options.extension || globalOptions.extension || 'pug'
    const filename = path.join(rootDir, [view, extension].join('.'))
    const context = options.context || globalOptions.context || this
    if (!caches[filename]) {
      const buffer = await new Promise((resolve, reject) => {
        fs.readFile(filename, (err, data) => {
          if (err) return reject(err)
          else return resolve(data)
        })
      })
      caches[filename] = pug.compile(buffer, {
        debug: options.debug || globalOptions.debug,
        filename: filename,
        compileDebug: options.compileDebug || globalOptions.compileDebug
      })
    }
    return caches[filename].call(context, data)
  }
}