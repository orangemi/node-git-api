'use strict'
const path = require('path')
const config = require('config')
const Router = require('koa-router')
const mount = require('koa-mount')
const file = require('koa-static')
const send = require('koa-send')

const apiRouter = require('./api')
const passport = require('./passport')

const rootPath = path.resolve(__dirname, '../node_modules/node-git-web/dist')

const router = module.exports = new Router()
router.use(async (ctx, next) => {
  try {
    await next()
  } catch (e) {
    ctx.status = e.status > 0 ? e.status : 500
    ctx.body = e.message
    if (ctx.status === 401) return ctx.redirect('/auth/github')
    if (ctx.status >= 500) console.error(e)
    if (ctx.status >= 500 && config.ENV !== 'development') {
      ctx.body = 'Internal Server Error'
    }
  }
})

router.use(passport.initialize())
router.use(passport.session())

router.get('/auth/github', passport.authenticate('github'))
router.get('/auth/github/callback', passport.authenticate('github', {
  successRedirect: '/',
  failureRedirect: '/auth/github'
}))

router.use((ctx, next) => {
  if (!ctx.session.passport) ctx.throw(401)
  if (!ctx.session.passport.user) ctx.throw(401)
  return next()
})

router.use('/api', apiRouter.routes())

if (config.ENV !== 'development') {
  router.use('/build', mount('/build', file(rootPath)))
  router.all('*', async (ctx) => {
    await send(ctx, '/', {root: rootPath + '/index.html'})
  })
} else {
  const { request } = require('urllib')
  router.use('/build', async function (ctx) {
    const resp = await request('http://localhost:5011' + ctx.path, {streaming: true})
    ctx.set(resp.headers)
    ctx.body = resp.res
  })
  router.all('*', async (ctx) => {
    const resp = await request('http://localhost:5011', {streaming: true})
    ctx.set(resp.headers)
    ctx.body = resp.res
  })
}
