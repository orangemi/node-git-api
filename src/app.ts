'use strict'
import * as Koa from 'koa'
import * as session from 'koa-session'
import * as config from 'config'

import logger from './service/logger'
import router from './service/router'

const app = new Koa()
app.use(logger())

app.use(session({signed: false}, app))
app.use(router.routes())

app.listen(config.PORT, () => {
  console.log(`start to listen ${config.PORT} ...`)
})
