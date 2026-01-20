#!/usr/bin/env node
import { spawn } from 'child_process'

// Parse arguments
const args = process.argv.slice(2)
const webkitIndex = args.indexOf('--webkit')
const firefoxIndex = args.indexOf('--firefox')

// Replace --webkit or --firefox with --project <browser>
if (webkitIndex !== -1) {
  args.splice(webkitIndex, 1, '--project', 'webkit')
} else if (firefoxIndex !== -1) {
  args.splice(firefoxIndex, 1, '--project', 'firefox')
} else {
  // Default to chromium if no browser flag
  args.unshift('--project', 'chromium')
}

// Run playwright with modified args
const playwright = spawn('npx', ['playwright', 'test', ...args], {
  env: process.env,
  stdio: 'inherit',
})

playwright.on('close', (code) => {
  process.exit(code)
})
