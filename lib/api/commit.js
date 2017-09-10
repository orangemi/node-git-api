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

commitAPI.listHistory = async (ctx) => {
  // const { limit } = ctx.query
  const { commit } = ctx.request
  const history = commit.history()
  history.start()
  const commits = []
  history.on('commit', commit => commits.push(commit))
  await new Promise(resolve => history.on('end', resolve))
  ctx.body = commits.map(commit => ({
    time: commit.date().toISOString(),
    sha: commit.sha(),
    author: commit.author().toString(),
    message: commit.message()
  }))
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
        filemode: entry.filemode(),
        sha: entry.sha(),
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
      filemode: treeEntry.filemode(),
      sha: treeEntry.sha(),
      size: treeEntry.isFile() ? blobs[i].rawsize() : 0
    }))
  }
}
