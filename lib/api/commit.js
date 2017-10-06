'use strict'
// const { Revwalk } = require('nodegit')
const crypto = require('crypto')
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

commitAPI.detail = async (ctx) => {
  const { commit } = ctx.request
  ctx.body = renderCommit(commit)
}

commitAPI.listHistory = async (ctx) => {
  // const { limit } = ctx.query
  const { commit } = ctx.request
  const history = commit.history()
  history.start()
  const commits = []
  history.on('commit', commit => commits.push(commit))
  await new Promise(resolve => history.on('end', resolve))
  ctx.body = commits.map(renderCommit)
}

commitAPI.listTree = async (ctx) => {
  const { repo, commit } = ctx.request
  const { path } = ctx.params
  const rootTree = await commit.getTree()
  let entry
  try {
    if (path) entry = await rootTree.getEntry(path)
  } catch (e) {
    ctx.throw(404, 'no file or directory')
  }

  if (entry && entry.isFile()) {
    ctx.body = await renderEntry(entry, repo, commit)
  } else {
    const tree = entry ? await entry.getTree() : rootTree
    const entries = tree.entries()
    ctx.body = await Promise.all(entries.map(entry => renderEntry(entry, repo, commit)))
  }
}

commitAPI.blobFile = async (ctx) => {
  const { commit } = ctx.request
  const { path } = ctx.params
  const rootTree = await commit.getTree()
  let entry
  try {
    if (path) entry = await rootTree.getEntry(path)
  } catch (e) {
    ctx.throw(404, 'no file or directory')
  }
  if (!entry || !entry.isFile()) ctx.throw(400, 'entry not a file')
  const blob = await entry.getBlob()
  ctx.body = blob.toString()
  // TODO: change content-type
}

async function renderEntry (entry, repo, commit) {
  const walker = repo.createRevWalk()
  walker.push(commit.sha())
  const lastCommits = await walker.fileHistoryWalk(entry.path(), 1024 * 1024)
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
    lastCommit: lastCommits && lastCommits.length ? renderCommit(lastCommits[0].commit) : null
  }
}

function renderCommit (commit) {
  const email = commit.author().email()
  return {
    name: commit.sha(),
    email: email,
    avatarUrl: 'https://www.gravatar.com/avatar/' + md5(email) + '?s=80',
    author: commit.author().toString(),
    message: commit.message(),
    commit: commit.sha(),
    updated: commit.date().toISOString()
  }
}

function md5 (msg) {
  return crypto.createHash('md5').update(msg.toString()).digest('hex')
}