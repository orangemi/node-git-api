'use strict'
const { Branch } = require('nodegit')
const BranchAPI = module.exports = {}

BranchAPI.list = async (ctx) => {
  const { repo } = ctx.request
  const branches = await repo.getReferences(3)
  ctx.body = branches
  ctx.body = await Promise.all(branches.map(branch => Branch.name(branch)))
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

BranchAPI.listTree = async (ctx) => {
  const { repo } = ctx.request
  const commit = await repo.getMasterCommit()
  console.log(commit)
  const tree = await commit.getTree()
  console.log(tree)
  ctx.body = tree
}