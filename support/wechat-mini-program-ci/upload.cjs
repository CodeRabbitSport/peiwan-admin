'use strict'

const fs = require('node:fs')
const path = require('node:path')

function parseArgs(argv) {
  const result = {}
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index]
    const value = argv[index + 1]
    if (!key?.startsWith('--') || value === undefined) {
      throw new Error(`Invalid argument: ${key || ''}`)
    }
    result[key.slice(2)] = value
  }
  return result
}

function requireValue(args, key) {
  const value = args[key]
  if (!value) {
    throw new Error(`Missing required argument: --${key}`)
  }
  return value
}

function exitWithMessage(stream, message, code) {
  stream.write(`${message}\n`, () => process.exit(code))
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const appid = requireValue(args, 'appid')
  const projectPath = path.resolve(requireValue(args, 'project-path'))
  const privateKeyPath = path.resolve(requireValue(args, 'private-key-path'))
  const version = requireValue(args, 'version')
  const desc = requireValue(args, 'description')
  const robot = Number.parseInt(args.robot || '1', 10)

  if (!fs.existsSync(path.join(projectPath, 'project.config.json'))) {
    throw new Error('project.config.json does not exist in project path')
  }
  if (!fs.existsSync(privateKeyPath)) {
    throw new Error('Private key file does not exist')
  }
  if (!Number.isInteger(robot) || robot < 1 || robot > 30) {
    throw new Error('Robot must be an integer between 1 and 30')
  }

  let ci
  try {
    ci = require('miniprogram-ci')
  }
  catch (error) {
    throw new Error(`miniprogram-ci is not installed in ${__dirname}: ${error.message}`)
  }

  const project = new ci.Project({
    appid,
    type: 'miniProgram',
    projectPath,
    privateKeyPath,
  })
  const result = await ci.upload({
    project,
    version,
    desc,
    robot,
    setting: {
      es6: true,
      es7: true,
      minify: true,
      codeProtect: false,
      autoPrefixWXSS: true,
    },
  })
  exitWithMessage(process.stdout, JSON.stringify({ success: true, result }), 0)
}

main().catch((error) => {
  exitWithMessage(process.stderr, error?.stack || error?.message || String(error), 1)
})
