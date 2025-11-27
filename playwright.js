#!/usr/bin/env node
import { spawn } from 'child_process'

// Parse arguments
const args = process.argv.slice(2)
const webkitIndex = args.indexOf('--webkit')

// Replace --webkit with --project webkit
if (webkitIndex !== -1) {
  args.splice(webkitIndex, 1, '--project', 'webkit')
} else {
  // Default to chromium if no --webkit flag
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
