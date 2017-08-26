'use strict'
import { Middleware } from 'koa'
import { Repo, CommitResult } from 'nodejs-git/src'

const branchMiddleware: Middleware = async (ctx, next) => {
  const repo: Repo = ctx.repo
  const { branch } = ctx.params
  const commit = await repo.loadBranch(branch)
  ctx.commit = commit
  return next()
}

const branchList: Middleware = async (ctx) => {
  const repo: Repo = ctx.repo
  const branches = await repo.listBranches()
  ctx.body = branches
}

const branchDetail: Middleware = async (ctx) => {
  const { name } = ctx.params
  const commit: CommitResult = ctx.commit
  ctx.body = commit
}

export default {
  // create: createRepo,
  middleware: branchMiddleware,
  list: branchList,
  detail: branchDetail,
}
