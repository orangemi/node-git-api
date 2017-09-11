'use strict'
const path = require('path')
const config = require('config')
const Koa = require('koa')
const mount = require('koa-mount')
const koaStatic = require('koa-static')
const { request } = require('urllib')
const app = new Koa()

const router = require('./router')
const pug = require('./plugins/pug')
pug(app, {root: 'views'})
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  console.log(ctx.ip, ctx.method, ctx.url, ctx.status, Date.now() - start)
})
app.use(router.routes())

if (config.ENV !== 'development') {
  const assets = require('node-git-web/dist/assets.json')
  app.use(mount('/build', koaStatic(path.resolve(__dirname, '../node_modules/node-git-web/dist'))))
  app.use(async (ctx) => {
    ctx.body = await ctx.render('index', {assets: assets})
  })
} else {
  // -- page build: proxy to 5011
  router.use('/build', async function (ctx) {
    const resp = await request('http://localhost:5011' + ctx.url, {streaming: true})
    ctx.set(resp.headers)
    ctx.body = resp.res
  })

  // -- page render: proxy to 5011
  router.all('*', async function (ctx) {
    const resp = await request('http://localhost:5011', {streaming: true})
    ctx.set(resp.headers)
    ctx.body = resp.res
  })
}

app.listen(config.PORT, () => {
  console.log(`start to listen ${config.PORT} ...`)
})
