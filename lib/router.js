'use strict'
const config = require('config')
const Router = require('koa-router')
const koaBody = require('koa-body')

// ---- api router ---
const apiRouter = new Router()
const RepoAPI = require('./api/repo')
const BranchAPI = require('./api/branch')
const commitAPI = require('./api/commit')
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
// apiRouter.post('/repos/:name', RepoAPI.create)
apiRouter.post('/repos', koaBody(), RepoAPI.create)
apiRouter.get('/repos/:name', RepoAPI.detail)
apiRouter.get('/repos/:name/branches', RepoAPI.repoMiddleware, BranchAPI.list)
apiRouter.get('/repos/:name/branches/:branch', RepoAPI.repoMiddleware, BranchAPI.branchMiddleware, BranchAPI.detail)
apiRouter.get('/repos/:name/branches/:branch/commits', RepoAPI.repoMiddleware, BranchAPI.branchMiddleware, commitAPI.listHistory)
apiRouter.get('/repos/:name/branches/:branch/:actionType(tree|blob)/:path*', RepoAPI.repoMiddleware, BranchAPI.branchMiddleware, commitAPI.listTree)
apiRouter.get('/repos/:name/commits/:commit/:actionType(tree|blob)/:path*', RepoAPI.repoMiddleware, commitAPI.commitMiddleware, commitAPI.listTree)
apiRouter.get('/repos/:name/commits/:commit/commits', RepoAPI.repoMiddleware, commitAPI.commitMiddleware, commitAPI.listHistory)
apiRouter.all('*', async (ctx) => {
  ctx.throw(404, 'not implement')
})

// ---- main router ---
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
