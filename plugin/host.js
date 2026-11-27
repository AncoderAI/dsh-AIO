/** Windows Desktop bridge for AIO Tauri's Explorer folder entry point. */
import { spawn } from 'node:child_process'
import { stat } from 'node:fs/promises'
import { dirname, extname, join } from 'node:path'
import { route, workspaceHeader } from './shared.js'

export const name = 'aio-workbench'
export const inject = ['webServer', 'connection']

const localPath = /^[a-z]:[\\/]/i
const environmentKeys = new Set([
  'allusersprofile', 'appdata', 'commonprogramfiles', 'commonprogramfiles(x86)', 'commonprogramw6432',
  'comspec', 'homedrive', 'homepath', 'localappdata', 'os', 'path', 'pathext', 'programdata',
  'programfiles', 'programfiles(x86)', 'programw6432', 'public', 'systemdrive', 'systemroot',
  'temp', 'tmp', 'username', 'userprofile', 'windir', 'aio_claude_binary', 'aio_codex_binary',
])

function launch(executable, workspace) {
  const env = Object.fromEntries(Object.entries(process.env)
    .filter(([key]) => environmentKeys.has(key.toLowerCase())))
  return new Promise((resolve, reject) => {
    const child = spawn(executable, ['--open-folder', workspace], {
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
      const encoded = req.headers[workspaceHeader]
      if (typeof encoded !== 'string' || encoded.length > 8192) return respond(400)
      let workspace
      try {
        workspace = decodeURIComponent(encoded)
      } catch (_error) {
        return respond(400)
      }
      if (!localPath.test(workspace) || workspace.includes('\0')) return respond(400)
      if (!(await stat(workspace, { throwIfNoEntry: false }).catch(() => undefined))?.isDirectory()) return respond(422)
      if (!executable || !localPath.test(executable) || extname(executable).toLowerCase() !== '.exe'
        || !(await stat(executable, { throwIfNoEntry: false }).catch(() => undefined))?.isFile()) return respond(404)
      try {
        await launch(executable, workspace)
      } catch (error) {
        ctx.logger('aio-workbench').warn('Windows could not start AIO: %s', String(error))
        return respond(500)
      }
      return respond(204)
    },
  }), 'AIO workbench launch')
}
