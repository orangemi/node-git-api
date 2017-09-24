const pkg = require('./package.json')
const sneaky = require('sneaky')
sneaky('imxiaomi', function () {
  this.description = 'Deploy to test environment'
  this.version = pkg.version
  this.user = 'git'
  this.host = 'imxiaomi.com'
  this.path = '/projects/node-git'
  this.overwrite = true
  this.nochdir = true
  this.filter = [
    '+ lib**',
    '+ config',
    '+ config/default.yml',
    '+ package.json',
    '+ yarn.lock',
    '+ n.lock',
    '- **'
  ].join('\n')
  this.after = ([
    'yarn --production'
  ].join(' && '))
})
