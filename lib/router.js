'use strict'
const config = require('config')
const Router = require('koa-router')

// ---- api router ---
const apiRouter = new Router()
const RepoAPI = require('./api/repo')
apiRouter.use(async (ctx, next) => {
  try {
    await next()
  } catch (e) {
    ctx.status = e.status || 500
    ctx.body = {
      error: e.message,
      stack: e.stack
    }

    if (ctx.status >= 500) console.error(e)
    if (ctx.status >= 500 && config.ENV !== 'development') {
      ctx.body.error = 'Internal Server Error'
      delete ctx.body.stack
    }
  }
})
apiRouter.get('/repos', RepoAPI.list)
apiRouter.post('/repos/:name', RepoAPI.create)
apiRouter.all('*', async (ctx) => {
  ctx.throw(404, 'not implement')
})

// ---- main router ---
const router = module.exports = new Router()
router.use(async (ctx, next) => {
  try {
    await next()
  } catch (e) {
    ctx.status = e.status || 500
    ctx.body = e.message
    if (ctx.status >= 500) console.error(e)
    if (ctx.status >= 500 && config.ENV !== 'development') {
      ctx.body = 'Internal Server Error'
    }
  }
})
router.use('/api', apiRouter.routes())
router.all('*', async function (ctx) {
  ctx.throw(404, 'not implement')
})
