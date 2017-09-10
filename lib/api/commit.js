'use strict'
const { Repository, Tree } = require('nodegit')
const BranchAPI = module.exports = {}

BranchAPI.list = async (ctx) => {
  const { repo } = ctx.request
  const branches = await repo.getReferenceNames(3)
  ctx.body = branches
}

BranchAPI.listTree = async (ctx) => {
  const { repo, branch } = ctx.request
  const { path } = ctx.params
  const commit = await repo.getReferenceCommit(branch)
  let tree = await commit.getTree()
  let entry
  if (path) {
    entry = await tree.getEntry(path)
    if (entry.isTree()) {
      tree = await entry.getTree()
    }
  }
  if (entry && entry.isFile()) {
    // TODO to show single file
    ctx.body = entry.toString()
    const blob = await entry.getBlob()
    ctx.body = blob.rawcontent()
    ctx.body = blob.toString()
  } else {
    ctx.body = tree.entries().map(treeEntry => ({
      isFile: treeEntry.isFile(),
      isDirectory: treeEntry.isDirectory(),
      isTree: treeEntry.isTree(),
      name: treeEntry.name(),
      path: treeEntry.path()
    }))
  }
}