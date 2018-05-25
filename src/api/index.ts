'use strict'
import * as config from 'config'
import * as Router from 'koa-router'
import * as koaBody from 'koa-body'
import { Context } from 'koa'

import RepoAPI from './repo'
import BranchAPI from './branch'
import commitAPI from './commit'
// import * as TagAPI from './tag'

const apiRouter = new Router()

apiRouter.use(async (ctx: Context, next) => {
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
apiRouter.post('/repos', koaBody(), RepoAPI.create)
apiRouter.get('/repos/:name', RepoAPI.middleware, RepoAPI.detail)
// apiRouter.get('/repos/:name/tags', RepoAPI.middleware, TagAPI.list)
// apiRouter.get('/repos/:name/tags/:tag(.*)', RepoAPI.middleware, TagAPI.tagMiddleware, TagAPI.detail)
apiRouter.get('/repos/:name/branches', RepoAPI.middleware, BranchAPI.list)
apiRouter.get('/repos/:name/branches/:branch(.*)', RepoAPI.middleware, BranchAPI.middleware, BranchAPI.detail)
apiRouter.get('/repos/:name/commits/:commit', RepoAPI.middleware, commitAPI.middleware, commitAPI.detail)
apiRouter.get('/repos/:name/commits/:commit/tree/:path*', RepoAPI.middleware, commitAPI.middleware, commitAPI.listTree)
apiRouter.get('/repos/:name/commits/:commit/blob/:path*', RepoAPI.middleware, commitAPI.middleware, commitAPI.blobFile)
apiRouter.get('/repos/:name/commits/:commit/commits', RepoAPI.middleware, commitAPI.middleware, commitAPI.history)
apiRouter.all('*', async (ctx) => {
  ctx.throw(404, 'not implement')
})

export default apiRouter
