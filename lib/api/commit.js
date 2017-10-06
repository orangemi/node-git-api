'use strict'
// const { Revwalk } = require('nodegit')
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
    commit: commit.sha(),
    author: commit.author().toString(),
    message: commit.message()
  }))
}

commitAPI.listTree = async (ctx) => {
  const { repo, commit } = ctx.request
  const { path, actionType } = ctx.params
  const rootTree = await commit.getTree()
  let entry
  if (path) {
    try {
      entry = await rootTree.getEntry(path)
    } catch (e) {
      ctx.throw(404, 'no file or directory')
    }
  }

  if (entry && entry.isFile()) {
    if (actionType === 'blob') {
      const blob = await entry.getBlob()
      ctx.body = blob.toString()
      // TODO: add header content-type
    } else {
      ctx.body = await renderEntry(entry, repo, commit)
    }
  } else {
    const tree = entry ? await entry.getTree() : rootTree
    const entries = tree.entries()
    ctx.body = await Promise.all(entries.map(entry => renderEntry(entry, repo, commit)))
  }
}

async function renderEntry (entry, repo, commit) {
  const walker = repo.createRevWalk()
  walker.push(commit.sha())
  const lastCommits = await walker.fileHistoryWalk(entry.path(), 1)
  const blob = entry.isFile() ? await entry.getBlob() : null
  return {
    isFile: entry.isFile(),
    isDirectory: entry.isDirectory(),
    isTree: entry.isTree(),
    name: entry.name(),
    path: entry.path().replace(/\\/g, '/'),
    filemode: entry.filemode(),
    sha: entry.sha(),
    size: entry.isFile() && blob ? blob.rawsize() : 0,
    lastCommit: lastCommits[0].commit.sha(),
    lastUpdated: lastCommits[0].commit.date().toISOString()
  }
}
