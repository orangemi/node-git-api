import * as config from 'config'
import { Repo } from 'libgit/lib'

function display (name: string, repo?: Repo) {
  return {
    name: name,
    sshUrl: config.SSH_HOST + '/' + name
  }
}

export default {
  display,
}