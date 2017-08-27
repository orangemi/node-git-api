'use strict'
const config = require('config')
const Koa = require('koa')
const app = new Koa()

const router = require('./router')
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  console.log(ctx.ip, ctx.method, ctx.url, ctx.status, Date.now() - start)
})
app.use(router.routes())
app.listen(config.PORT, () => {
  console.log(`start to listen ${config.PORT} ...`)
})