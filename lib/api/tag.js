'use strict'
const nodegit = require('nodegit')
const { Tag, Commit } = nodegit // require('nodegit')
const TagAPI = module.exports = {}

TagAPI.list = async (ctx) => {
  const { repo } = ctx.request
  const tags = await Tag.list(repo)
  const refs = await Promise.all(tags.map(tag => repo.getReference(tag)))
  const oids = await Promise.all(refs.map(ref => ref.peel(nodegit.Object.TYPE.COMMIT)))
  const commits = await Promise.all(oids.map(oid => Commit.lookup(repo, oid)))
  ctx.body = refs.map((ref, i) => ({
    isTag: !!ref.isTag(),
    isBranch: !!ref.isBranch(),
    isHead: !!ref.isHead(),
    name: tags[i],
    updated: commits[i].date().toISOString(),
    commit: commits[i].sha(),
    message: commits[i].message()
  }))
}

TagAPI.detail = async (ctx) => {
  const { commit } = ctx.request
  const { tag } = ctx.params
  ctx.body = {
    name: tag,
    updated: commit.date().toISOString(),
    commit: commit.sha(),
    message: commit.message()
  }
}

TagAPI.tagMiddleware = async (ctx, next) => {
  const { repo } = ctx.request
  const { tag } = ctx.params
  try {
    ctx.request.tag = await repo.getReference(tag)
  } catch (e) {
    ctx.throw(404, 'no tag')
  }
  const oid = await ctx.request.tag.peel(nodegit.Object.TYPE.COMMIT)
  ctx.request.commit = await Commit.lookup(repo, oid)
  return next()
}

TagAPI.listCommits = async (ctx) => {
  ctx.throw(500, 'not done')
}
