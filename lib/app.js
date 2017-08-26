'use strict'
const config = require('config')
const Koa = require('koa')
const app = new Koa()

const router = require('./router')
app.use(router.routes())
app.listen(config.PORT, () => {
  console.log(`start to listen ${config.PORT} ...`)
})