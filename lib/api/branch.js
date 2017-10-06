'use strict'
const { Reference, Branch } = require('nodegit')
const BranchAPI = module.exports = {}

BranchAPI.list = async (ctx) => {
  const { repo } = ctx.request
  const references = await repo.getReferences(Reference.TYPE.LISTALL)
  const branches = references.filter(r => r.isBranch())
  const branchNames = await Promise.all(branches.map(branch => Branch.name(branch)))
  const commits = await Promise.all(branches.map(branch => repo.getReferenceCommit(branch)))
  ctx.body = branches.map((branch, i) => ({
    isTag: !!branch.isTag(),
    isBranch: !!branch.isBranch(),
    isHead: !!branch.isHead(),
    // name: branch.name(),
    name: branchNames[i],
    updated: commits[i].date().toISOString(),
    commit: commits[i].sha(),
    message: commits[i].message()
  }))
}

BranchAPI.detail = async (ctx) => {
  const { branch, commit } = ctx.request
  const branchName = await Branch.name(branch)
  ctx.body = {
    isTag: !!branch.isTag(),
    isBranch: !!branch.isBranch(),
    isHead: !!branch.isHead(),

    name: branchName,
    updated: commit.date().toISOString(),
    commit: commit.sha(),
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
