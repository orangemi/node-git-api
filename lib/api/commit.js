'use strict'
// const { Repository, Tree } = require('nodegit')
const commitAPI = module.exports = {}

commitAPI.commitMiddleware = async (ctx, next) => {
  const { repo } = ctx.request
  const { commit } = ctx.params
  try {
    ctx.request.commit = await repo.getCommit(commit)
    return next()
  } catch (e) {
    ctx.throw(404, 'no commit')
  }
}

commitAPI.listTree = async (ctx) => {
  const { commit } = ctx.request
  const { path, actionType } = ctx.params
  let tree = await commit.getTree()
  let entry
  if (path) {
    try {
      entry = await tree.getEntry(path)
    } catch (e) {
      ctx.throw(404, 'no file or directory')
    }
    if (entry.isTree()) tree = await entry.getTree()
  }
  if (entry && entry.isFile()) {
    const blob = await entry.getBlob()
    if (actionType === 'blob') {
      // TODO: add header content-type
      ctx.body = blob.toString()
    } else {
      ctx.body = {
        isFile: entry.isFile(),
        isDirectory: entry.isDirectory(),
        isTree: entry.isTree(),
        name: entry.name(),
        path: entry.path(),
        size: blob.rawsize()
      }
    }
  } else {
    let blobs = await Promise.all(tree.entries().map(treeEntry => {
      if (treeEntry.isFile()) return treeEntry.getBlob()
      return 0
    }))
    ctx.body = tree.entries().map((treeEntry, i) => ({
      isFile: treeEntry.isFile(),
      isDirectory: treeEntry.isDirectory(),
      isTree: treeEntry.isTree(),
      name: treeEntry.name(),
      path: treeEntry.path(),
      size: treeEntry.isFile() ? blobs[i].rawsize() : 0
    }))
  }
}
