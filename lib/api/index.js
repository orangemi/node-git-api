'use strict'
const config = require('config')
const Router = require('koa-router')
const koaBody = require('koa-body')

const apiRouter = module.exports = new Router()
const RepoAPI = require('./repo')
const BranchAPI = require('./branch')
const commitAPI = require('./commit')
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
