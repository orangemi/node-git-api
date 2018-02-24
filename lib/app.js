'use strict'
const Koa = require('koa')
const config = require('config')
const session = require('koa-session')

const router = require('./router')

const app = new Koa()
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  console.log(ctx.ip, ctx.method, ctx.url, ctx.status, Date.now() - start)
})
app.use(session({signed: false}, app))
app.use(router.routes())

app.listen(config.PORT, () => {
  console.log(`start to listen ${config.PORT} ...`)
})
