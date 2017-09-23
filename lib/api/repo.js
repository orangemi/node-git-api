'use strict'
const fs = require('fs')
const path = require('path')
const util = require('util')
const config = require('config')
const { Repository } = require('nodegit')

const fsReaddir = util.promisify(fs.readdir)

const RepoAPI = module.exports = {}
RepoAPI.create = async (ctx) => {
  const { body } = ctx.request
  const { name } = body
  const repopath = path.resolve(config.REPO_BASE_PATH, name)
  await Repository.init(repopath, 1)
  ctx.body = {}
}

RepoAPI.repoMiddleware = async (ctx, next) => {
  let { name } = ctx.params
  let repopath = path.resolve(config.REPO_BASE_PATH, name)
  ctx.request.repo = await Repository.open(repopath)
  return next()
}

RepoAPI.list = async (ctx) => {
  let repopath = path.resolve(config.REPO_BASE_PATH)
  // let repos = await new Promise(resolve => fs.readdir(repopath, resolve))
  let repos = await fsReaddir(repopath)
  ctx.body = repos.filter(name => {
    return !name.startsWith('.')
  })
}

RepoAPI.detail = async (ctx) => {
  let { name } = ctx.params
  let repopath = path.resolve(config.REPO_BASE_PATH, name)
  let repo = await Repository.open(repopath)
  this.body = repo
}
