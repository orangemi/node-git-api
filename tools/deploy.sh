#/bin/bash
set -e

ssh -p 22 git@imxiaomi.com "cd ~/ && mkdir -p /projects/node-git/"

rsync -az \
  --delete-after \
  --force \
  --filter="+ lib**" \
  --filter="+ config" \
  --filter="+ config/default.yml" \
  --filter="+ package.json" \
  --filter="+ yarn.lock" \
  --filter="+ n.lock" \
  --filter="- **" ./ -e "ssh -p 22" git@imxiaomi.com:/projects/node-git

ssh -p 22 git@imxiaomi.com "cd /projects/node-git && npm i --production"