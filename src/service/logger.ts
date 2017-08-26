import { Middleware } from "koa"

export default function logger () {
  return <Middleware>async function (ctx, next) {
    const start = Date.now()
    await next()
    console.log(ctx.ip, ctx.method, ctx.url, ctx.status, Date.now() - start)
  }
}