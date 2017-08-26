'use strict'
const fs = require('fs')
const path = require('path')
const util = require('util')
const config = require('config')
const { Repository } = require('nodegit')

const fsReaddir = util.promisify(fs.readdir)

const RepoAPI = module.exports = {}
RepoAPI.create = async function (ctx) {
  let name = ctx.params.name
  let repopath = path.resolve(config.REPO_BASE_PATH, name)
  let repository = await Repository.init(repopath, 1)
  ctx.body = {}
}

RepoAPI.list = async function (ctx) {
  let repopath = path.resolve(config.REPO_BASE_PATH)
  // let repos = await new Promise(resolve => fs.readdir(repopath, resolve))
  let repos = await fsReaddir(repopath)
  ctx.body = repos
}