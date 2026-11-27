/** Windows Desktop bridge. AIO owns the workbench and its window lifecycle. */
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { dirname, extname, win32 } from 'node:path'
import { fileURLToPath } from 'node:url'
import { route, launchHeader } from './shared.js'

export const name = 'aio-workbench'
export const inject = ['webServer', 'connection']

const bundledExecutable = fileURLToPath(new URL('./resources/win32-x64/AIO_2.0.2_x64-system-language-portable.exe', import.meta.url))
const bundledSha256 = 'eaef58a6bf75347899315869008a26aa4e314befa567bd9c6f917c3ace83986c'

const environmentKeys = new Set([
  'allusersprofile', 'appdata', 'commonprogramfiles', 'commonprogramfiles(x86)', 'commonprogramw6432',
  'comspec', 'homedrive', 'homepath', 'localappdata', 'os', 'path', 'pathext', 'programdata',
  'programfiles', 'programfiles(x86)', 'programw6432', 'public', 'systemdrive', 'systemroot',
  'temp', 'tmp', 'username', 'userprofile', 'windir', 'aio_claude_binary', 'aio_codex_binary',
])

async function checksumMatches(executable) {
  const hash = createHash('sha256')
  for await (const chunk of createReadStream(executable)) hash.update(chunk)
  return hash.digest('hex') === bundledSha256
}

function launch(executable) {
  const env = Object.fromEntries(Object.entries(process.env)
    .filter(([key]) => environmentKeys.has(key.toLowerCase())))
  return new Promise((resolve, reject) => {
    const child = spawn(executable, [], {
      cwd: dirname(executable), detached: true, stdio: 'ignore', env,
    })
    child.once('error', reject)
    child.once('spawn', () => {
      child.unref()
      resolve()
    })
  })
}

/** Mount the authenticated launch action for Windows Electron Hosts. */
export function apply(ctx) {
  if (process.platform !== 'win32' || process.arch !== 'x64' || !process.versions.electron) return
  const override = process.env.AIO_TAURI_EXECUTABLE
  const executable = override ?? bundledExecutable

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: route,
    async handler(req, res) {
      const respond = status => {
        res.statusCode = status
        res.setHeader('cache-control', 'no-store')
        res.end()
      }
      const rejection = ctx.connection.requestRejection(req)
      if (rejection !== undefined) return respond(rejection)
      if (req.method !== 'POST') {
        res.setHeader('allow', 'POST')
        return respond(405)
      }
      if (req.headers[launchHeader] !== '1') return respond(400)
      if (!win32.isAbsolute(executable) || extname(executable).toLowerCase() !== '.exe'
        || !(await stat(executable).catch(() => undefined))?.isFile()) return respond(404)
      try {
        if (override === undefined && !await checksumMatches(executable)) return respond(422)
        await launch(executable)
      } catch (error) {
        ctx.logger('aio-workbench').warn('Windows could not start AIO: %s', String(error))
        return respond(500)
      }
      return respond(204)
    },
  }), 'AIO workbench launch')
}
