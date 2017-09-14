'use strict'
const path = require('path')
const config = require('config')
const Router = require('koa-router')
const mount = require('koa-mount')
const file = require('koa-static')
const send = require('koa-send')
const { request } = require('urllib')

const apiRouter = require('./api')

const rootPath = path.resolve(__dirname, '../node_modules/node-git-web/dist')

const router = module.exports = new Router()
router.use(async (ctx, next) => {
  try {
    await next()
  } catch (e) {
    ctx.status = e.status > 0 ? e.status : 500
    ctx.body = e.message
    if (ctx.status >= 500) console.error(e)
    if (ctx.status >= 500 && config.ENV !== 'development') {
      ctx.body = 'Internal Server Error'
    }
  }
})
router.use('/api', apiRouter.routes())

if (config.ENV !== 'development') {
  router.use('/build', mount('/build', file(rootPath)))
  router.all('*', async (ctx) => {
    await send(ctx, '/', {root: rootPath + '/index.html'})
  })
} else {
  router.all('*', async function (ctx) {
    const resp = await request('http://localhost:5011', {streaming: true})
    ctx.set(resp.headers)
    ctx.body = resp.res
  })
}
