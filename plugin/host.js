/** Windows Desktop bridge. AIO owns the workbench and its window lifecycle. */
import { spawn } from 'node:child_process'
import { stat } from 'node:fs/promises'
import { dirname, extname, join } from 'node:path'
import { route, launchHeader } from './shared.js'

export const name = 'aio-workbench'
export const inject = ['webServer', 'connection']

const environmentKeys = new Set([
  'allusersprofile', 'appdata', 'commonprogramfiles', 'commonprogramfiles(x86)', 'commonprogramw6432',
  'comspec', 'homedrive', 'homepath', 'localappdata', 'os', 'path', 'pathext', 'programdata',
  'programfiles', 'programfiles(x86)', 'programw6432', 'public', 'systemdrive', 'systemroot',
  'temp', 'tmp', 'username', 'userprofile', 'windir', 'aio_claude_binary', 'aio_codex_binary',
])

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
  if (process.platform !== 'win32' || !process.versions.electron) return
  const appData = process.env.LOCALAPPDATA
  const executable = process.env.AIO_TAURI_EXECUTABLE
    ?? (appData && join(appData, 'AIO', 'ancoder-tauri-spike.exe'))

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
      if (!executable || !/^[a-z]:[\\/]/i.test(executable) || extname(executable).toLowerCase() !== '.exe'
        || !(await stat(executable).catch(() => undefined))?.isFile()) return respond(404)
      try {
        await launch(executable)
      } catch (error) {
        ctx.logger('aio-workbench').warn('Windows could not start AIO: %s', String(error))
        return respond(500)
      }
      return respond(204)
    },
  }), 'AIO workbench launch')
}
