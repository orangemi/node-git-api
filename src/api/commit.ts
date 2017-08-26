'use strict'
import { Middleware } from 'koa'
import { Repo, CommitResult, TreeNode } from 'nodejs-git/src'

const commitMiddleware: Middleware = async (ctx, next) => {
  const repo: Repo = ctx.repo
  const { commit } = ctx.params
  const commitResult = await repo.loadCommit(commit)
  ctx.commit = commitResult
  return next()
}

const commitDetail: Middleware = async (ctx) => {
  const commit: CommitResult = ctx.commit
  ctx.body = commit
}

const listTree: Middleware = async (ctx) => {
  const repo: Repo = ctx.repo
  const commit: CommitResult = ctx.commit
  const filepath: string = ctx.params.path || ''
  const filepathWithSlash = '/' + filepath

  let nodes: Array<TreeNode> = []
  for (let directory of filepathWithSlash.split('/')) {
    if (directory === '') {
      const tree = await repo.loadTree(commit.tree, {loadAll: true})
      nodes = tree.nodes
    } else {
      const treeNode = nodes.filter(node => node.name === directory)[0]
      if (!treeNode) ctx.throw(404, 'tree not found')
      if (!(treeNode.mode & 0x4000)) ctx.throw(400, 'filepath is not a directory')
      const tree = await repo.loadTree(treeNode.hash, {loadAll: true})
      nodes = tree.nodes
    }
  }

  ctx.body = await Promise.all(nodes.map(async (node) => {
    const isFile = !!(node.mode & 0x8000)
    const result = {
      isFile,
      mode: node.mode,
      name: node.name,
      size: 0,
      lastCommit: null,
    }
    if (isFile) {
      const blob = await repo.loadBlob(node.hash)
      result.size = blob.length
      blob.stream.destroy()
    }

    const fileFullPath = (filepath + '/' + node.name).replace(/^\//, '')
    let current = commit
    while (current.parent.length) {
      current = await repo.loadCommit(current.parent[0])
      const diffs = await repo.diffTree(current.tree, commit.tree)
      const diff = diffs.filter(diff => diff.path.indexOf(fileFullPath) === 0)[0]
      if (diff) break
    }
    result.lastCommit = current

    return result
  }))
}

const blobFile: Middleware = async (ctx) => {
  const repo: Repo = ctx.repo
  const commit: CommitResult = ctx.commit
  const filepath: string = ctx.params.path || ''
  const directoryPath = ('/' + filepath).replace(/\/[^/]+$/, '')
  const filename = filepath.replace(/^.*\//, '')

  let nodes: Array<TreeNode> = []
  for (let directory of directoryPath.split('/')) {
    if (directory === '') {
      const tree = await repo.loadTree(commit.tree, {loadAll: true})
      nodes = tree.nodes
    } else {
      const treeNode = nodes.filter(node => node.name === directory)[0]
      if (!treeNode) ctx.throw(404, 'tree not found')
      if (!(treeNode.mode & 0x4000)) ctx.throw(400, 'filepath is not a directory')
      const tree = await repo.loadTree(treeNode.hash, {loadAll: true})
      nodes = tree.nodes
    }
  }
  const fileNode = nodes.filter(node => node.name === filename)[0]
  if (!fileNode) ctx.throw(404, 'file not found')
  const blob = await repo.loadBlob(fileNode.hash)
  ctx.set('content-length', blob.length.toString())
  ctx.body = blob.stream
}

const history: Middleware = async (ctx) => {
  const limit: number = ctx.query.limit || 50
  const repo: Repo = ctx.repo
  const commit: CommitResult = ctx.commit
  const result = [commit]
  let current = commit
  let parentCount = 0
  while (parentCount < limit && current.parent.length) {
    current = await repo.loadCommit(current.parent[0])
    result.push(current)
  }

  ctx.body = result
}

export default {
  listTree: listTree,
  middleware: commitMiddleware,
  detail: commitDetail,
  blobFile: blobFile,
  history: history,
}
