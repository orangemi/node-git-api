'use strict'
import * as path from 'path'
import * as fs from 'mz/fs'
import * as config from 'config'
import { Middleware } from 'koa'
import { Repo } from 'nodejs-git/src'

import repoBll from '../bll/repo'

const createRepo: Middleware = async (ctx) => {
  const { body } = ctx.request
  const { name } = body
  const repopath = path.resolve(config.REPO_PATH, name)
  ctx.body = {}
}

const repoMiddleware: Middleware = async (ctx, next) => {
  const { name } = ctx.params
  const repopath = path.resolve(config.REPO_PATH, name)
  const repo = new Repo(repopath)
  ctx.repo = repo
  return next()
}

const repoList: Middleware = async (ctx) => {
  const repopath = path.resolve(config.REPO_PATH)
  const repos = await fs.readdir(repopath)
  ctx.body = repos.filter(name => !name.startsWith('.'))
}

const repoDetail = async (ctx) => {
  const { name } = ctx.params
  ctx.body = repoBll.display(name, <Repo>ctx.repo)
}

export default {
  create: createRepo,
  middleware: repoMiddleware,
  list: repoList,
  detail: repoDetail,
}
