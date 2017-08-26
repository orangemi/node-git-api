'use strict'
import * as path from 'path'
import * as config from 'config'
import * as Router from 'koa-router'
// import * as mount from 'koa-mount'
import * as file from 'koa-static'

import apiRouter from '../api'
import passport from '../passport'
import render from './render'

const staticFilePath = path.resolve(__dirname, '../../resources')
const router = new Router()
export default router
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
  router.get('/build*', file(staticFilePath))
  router.all('*', render(true))
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
