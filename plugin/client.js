/** Adds a single launcher to the Windows Desktop sidebar. */
window.__ModuleLoader__.load({
  id: 'dsh-aio-workbench',
  factory(require) {
    const { createElement, useRef, useState } = require('react')
    const { Button, Tooltip } = require('@deepseek-ai/dsh-client-ui-primitives')
    const slot = 'sidebar.footer.action'
    const namespace = 'aio-workbench'
    const en = {
      open: 'Open AIO workbench',
      missing: 'AIO executable is missing. Check the plugin installation',
      corrupt: 'AIO verification failed. Reinstall the plugin',
      failed: 'Could not open AIO. Try again',
    }
    const zh = {
      open: '打开 AIO 工作台',
      missing: '找不到 AIO 程序，请检查插件安装',
      corrupt: 'AIO 文件校验失败，请重新安装插件',
      failed: '无法打开 AIO，请重试',
    }

    function AioLauncher({ t }) {
      const pending = useRef(false)
      const [error, setError] = useState(null)
      async function open() {
        if (pending.current) return
        pending.current = true
        setError(null)
        try {
          const response = await fetch('aio-workbench/open', {
            method: 'POST', headers: { 'x-aio-launch': '1' },
          })
          if (response.status !== 204) setError(response.status === 404 ? 'missing' : response.status === 422 ? 'corrupt' : 'failed')
        } catch (_error) {
          setError('failed')
        } finally {
          pending.current = false
        }
      }
      const label = t(error ?? 'open')
      return createElement(Tooltip, { label, portal: true },
        createElement(Button, {
          size: 'sm',
          variant: error ? 'outline' : 'ghost',
          'aria-label': label,
          'aria-live': 'polite',
          onClick: open,
        }, error ? 'AIO !' : 'AIO'))
    }

    /** Enable the launcher only in the native Windows renderer. */
    function apply(ctx) {
      if (location.protocol !== 'dsh-app:' || !navigator.userAgent.includes('Windows')) return
      ctx.effect(() => ctx.locale.register(namespace, { en, zh }), 'AIO workbench translations')
      ctx.slots.inject(slot, () => ctx.slots.register({
        name: slot, id: namespace, locale: namespace,
      }, AioLauncher))
    }

    return { name: 'aio-workbench-client', inject: ['slots', 'locale'], apply }
  },
})
