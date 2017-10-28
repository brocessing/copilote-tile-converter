'use strict'

const fs = require('fs-extra')
const path = require('path')
const minimist = require('minimist')
const minimistOpts = {
  boolean: ['help', 'version', 'pretty'],
  string: ['input', 'output'],
  alias: {
    help: ['h'],
    input: ['i'],
    output: ['o'],
    pretty: ['p'],
    version: ['v'],
  }
}

const argv = minimist(process.argv.slice(2), minimistOpts)

if (argv.help) {
  console.log(fs.readFileSync(path.join(__dirname, '..', 'usage.txt'), 'utf-8'))
  process.exit(0)
}

if (argv.version) {
  const pckg = require(path.join(__dirname, '..', '..', 'package.json'))
  console.log(pckg.version)
  process.exit(0)
}

if (!argv.input || !~argv.input.indexOf('.png')) {
  console.error('You must specify a valid input file. \nType "copilote-tile-converter --help" to see usage.\n')
  process.exit(1)
}

const args = {}
Object.keys(minimistOpts.alias).forEach(key => {
  if (
  argv.hasOwnProperty(key) !== undefined && typeof argv[key] !== 'undefined'
  ) {
    args[key] = argv[key]
  }
})

module.exports = args
