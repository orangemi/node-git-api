'use strict'
const { Branch } = require('nodegit')
const BranchAPI = module.exports = {}

BranchAPI.list = async (ctx) => {
  const { repo } = ctx.request
  const branches = await repo.getReferences(3)
  // const branches = await Reference.list(repo)
  const branchNames = await Promise.all(branches.map(branch => Branch.name(branch)))
  const commits = await Promise.all(branches.map(branch => repo.getReferenceCommit(branch)))
  ctx.body = branches.map((branch, i) => ({
    isTag: !!branch.isTag(),
    isBranch: !!branch.isBranch(),
    isHead: !!branch.isHead(),
    // name: branch.name(),
    name: branchNames[i],
    updated: commits[i].date().toISOString(),
    sha: commits[i].sha(),
    message: commits[i].message()
  }))
}

BranchAPI.detail = async (ctx) => {
  const { commit } = ctx.request
  const { branch } = ctx.params
  ctx.body = {
    name: branch,
    updated: commit.date().toISOString(),
    sha: commit.sha(),
    message: commit.message()
  }
}

BranchAPI.branchMiddleware = async (ctx, next) => {
  const { repo } = ctx.request
  const { branch } = ctx.params
  try {
    ctx.request.branch = await repo.getBranch(branch)
  } catch (e) {
    ctx.throw(404, 'no branch')
  }
  ctx.request.commit = await repo.getReferenceCommit(branch)
  return next()
}

BranchAPI.listCommits = async (ctx) => {
  ctx.throw(500, 'not done')
}
