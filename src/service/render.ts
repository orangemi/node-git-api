import * as path from 'path'
import * as fs from 'mz/fs'
import * as config from 'config'
import { Middleware } from "koa"
import * as pug from 'pug'

const devAssets = {
  main: {
    js: '/build/main.bundle.js',
    css: '/build/main.bundle.css'
  },
  vendor: {
    js: '/build/vendor.bundle.js',
    css: '/build/vendor.bundle.css'
  }
}

export default function renderIndex (dev = false) {
  const middleware: Middleware = async (ctx) => {
    ctx.set('content-type', 'text/html')

    const file = await fs.readFile(path.resolve(__dirname, '../../resources/views/index.pug'), {encoding: 'utf-8'})
    const assetsString = await fs.readFile(path.resolve(__dirname, '../../resources/build/assets.json'), {encoding: 'utf-8'})
    const assets = JSON.parse(assetsString)
    const assets2 = config.ENV === 'development' ? devAssets : assets
    const complier = pug.compile(file)
    const body = complier({
      config: {
        GA: config.GA || 'UA-9463504-8'
      },
      assets: assets2
    })
  
    ctx.body = body
  }
  return middleware
}