import { existsSync, mkdirSync, writeFileSync, rmSync, readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'

const platform = process.platform
let arch = process.arch
if (process.argv.slice(2).length !== 0) {
  arch = process.argv.slice(2)[0].replace('--', '')
}

function getBindingName() {
  switch (platform) {
    case 'win32':
      if (arch === 'x64') return 'sysproxy.win32-x64-msvc.node'
      if (arch === 'arm64') return 'sysproxy.win32-arm64-msvc.node'
      break
    case 'darwin':
      if (arch === 'x64') return 'sysproxy.darwin-x64.node'
      if (arch === 'arm64') return 'sysproxy.darwin-arm64.node'
      break
    case 'linux':
      if (arch === 'x64') return 'sysproxy.linux-x64-gnu.node'
      if (arch === 'arm64') return 'sysproxy.linux-arm64-gnu.node'
      break
  }
  return null
}

function getNpmPackageName() {
  switch (platform) {
    case 'win32':
      return `@mihomo-party/sysproxy-win32-${arch}-msvc`
    case 'darwin':
      return `@mihomo-party/sysproxy-darwin-${arch}`
    case 'linux':
      return `@mihomo-party/sysproxy-linux-${arch}-gnu`
  }
  return null
}

// Download and extract sysproxy native module to extra/sidecar
async function resolveSysproxyNative() {
  const bindingName = getBindingName()
  const pkgName = getNpmPackageName()

  if (!bindingName || !pkgName) {
    console.log(`[WARN]: Unsupported platform for sysproxy native: ${platform}-${arch}`)
    return
  }

  const sidecarDir = join(process.cwd(), 'extra', 'sidecar')
  const targetPath = join(sidecarDir, bindingName)

  // Check if already exists
  if (existsSync(targetPath)) {
    console.log(`[INFO]: ${bindingName} already exists, skipping...`)
    return
  }

  console.log(`[INFO]: Downloading ${pkgName} to extract ${bindingName}...`)

  // Create temp directory and download package
  const tempDir = join(process.cwd(), 'node_modules', '.temp', 'sysproxy-native')
  mkdirSync(tempDir, { recursive: true })
  mkdirSync(sidecarDir, { recursive: true })

  try {
    // Use npm pack to download the package
    execSync(`npm pack ${pkgName} --pack-destination ${tempDir}`, { stdio: 'pipe' })

    // Find the downloaded tgz file
    const files = readdirSync(tempDir)
    const tgzFile = files.find((f) => f.endsWith('.tgz'))
    if (!tgzFile) {
      throw new Error('Failed to download package')
    }

    // Extract the .node file
    const tgzPath = join(tempDir, tgzFile)
    execSync(`tar -xzf "${tgzPath}" -C "${tempDir}"`, { stdio: 'pipe' })

    // Copy the .node file to extra/sidecar
    const nodeFile = join(tempDir, 'package', bindingName)
    if (existsSync(nodeFile)) {
      const content = readFileSync(nodeFile)
      writeFileSync(targetPath, content)
      console.log(`[INFO]: ${bindingName} extracted to extra/sidecar/`)
    } else {
      throw new Error(`${bindingName} not found in package`)
    }
  } finally {
    // Clean up temp directory
    rmSync(tempDir, { recursive: true, force: true })
  }
}

resolveSysproxyNative()
