/** Adds AIO to the session menu and reports launch outcomes in the shell. */
window.__ModuleLoader__.load({
  id: 'dsh-aio-workbench',
  factory(require) {
    const { createElement, useSyncExternalStore } = require('react')
    const { createSnapshotStore } = require('@deepseek-ai/dsh-client-store')
    const { MenuItemButton, Toast } = require('@deepseek-ai/dsh-client-ui-primitives')

    const route = 'aio-workbench/open'
    const workspaceHeader = 'x-aio-workspace'
    const namespace = 'aio-workbench'
    const menu = 'sidebar.workspaces.session.menu.item'
    const overlay = 'shell.overlay'
    const en = {
      open: 'Open workspace in AIO',
      started: 'Sent workspace to AIO',
      missing: 'Install AIO Tauri to open this workspace',
      directory: 'The workspace directory is unavailable on this PC',
      failed: 'Could not open the workspace in AIO. Try again',
    }
    const zh = {
      open: '在 AIO 中打开工作区',
      started: '已将工作区发送给 AIO',
      missing: '请安装 AIO Tauri 后打开此工作区',
      directory: '此电脑上无法访问工作区目录',
      failed: '无法在 AIO 中打开工作区，请重试',
    }

    /** Register the session action only in the Windows Desktop renderer. */
    function apply(ctx) {
      if (location.protocol !== 'dsh-app:' || !navigator.userAgent.includes('Windows')) return
      ctx.effect(() => ctx.locale.register(namespace, { en, zh }), 'AIO workbench translations')
      const notice = createSnapshotStore(null)
      let pending = false
      let sequence = 0
      async function open(workspace) {
        if (pending) return
        pending = true
        let message = 'failed'
        try {
          const response = await fetch(route, {
            method: 'POST', headers: { [workspaceHeader]: encodeURIComponent(workspace) },
          })
          if (response.status === 204) message = 'started'
          if (response.status === 404) message = 'missing'
          if (response.status === 422) message = 'directory'
        } catch (_error) {
          // A failed request uses the same feedback as a failed launch.
        } finally {
          pending = false
          notice.set({ message, sequence: ++sequence })
        }
      }

      const sessions = ctx.sessions.list
      ctx.slots.inject(menu, () => ctx.slots.register({ name: menu, id: namespace, locale: namespace, order: 250 },
        function OpenInAio({ sessionId, useMenuOpenState, t }) {
          const [, closeMenu] = useMenuOpenState()
          const readWorkspace = () => sessions.getSnapshot().byId[sessionId]?.cwd
          const workspace = useSyncExternalStore(sessions.subscribe, readWorkspace)
          if (!workspace || !/^[a-z]:[\\/]/i.test(workspace)) return null
          return createElement(MenuItemButton, { onSelect: () => {
            closeMenu(false)
            void open(workspace)
          } }, t('open'))
        }))

      ctx.slots.inject(overlay, () => ctx.slots.register({ name: overlay, id: namespace, locale: namespace },
        function AioNotice({ t }) {
          const current = useSyncExternalStore(notice.subscribe, notice.getSnapshot)
          if (!current) return null
          return createElement(Toast, {
            key: current.sequence,
            text: t(current.message),
            tone: current.message === 'started' ? 'success' : undefined,
            onDone: () => { if (notice.getSnapshot() === current) notice.set(null) },
          })
        }))
    }

    return { name: 'aio-workbench-client', inject: ['slots', 'locale', 'sessions'], apply }
  },
})
