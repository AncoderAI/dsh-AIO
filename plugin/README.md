---
description: "从 DeepSeek Harness Desktop 侧栏打开独立的 AIO Tauri 工作台。"
kind: "package-bundle"
---

# AIO 工作台插件

适用于 Windows 上的 DeepSeek Harness Desktop 0.2.1-rc.2 和 AIO Tauri 2.0.2。安装后，Harness 侧栏底部提供一个「AIO」按钮。点击后，AIO 在独立窗口中打开或将已运行的工作台切到前台。对话、项目、终端、设置及弹窗都在 AIO 窗口内操作。

## 安装

先安装 AIO Tauri，再启动一次 Harness Desktop 以初始化 `desktop` profile。在 Harness 的插件管理界面按本地路径安装此仓库的 `plugin` 目录并启用，然后重启 Harness Desktop 加载侧栏按钮。也可以退出 Harness 后，从交付仓库根目录使用 Desktop 自带的 `dsh` 命令。

```powershell
$pluginDir = (Resolve-Path .\plugin).Path
dsh plugin --profile desktop add "file:$pluginDir"
```

从源码运行 Desktop 时，在同一个 PowerShell 中将 `DSH_HOME` 设置为开发版正在使用的目录，并在 Harness 源码仓库根目录用 `pnpm dsh` 执行相同的 `plugin` 命令。默认开发目录是 `apps/desktop/.desktop-build/development/home`。

## 使用

展开 Harness 左侧栏，然后点击底部的「AIO」，然后在 AIO 窗口内选择项目、运行时并开始对话。按钮也可在没有打开 Harness 会话时使用。关闭 AIO 后，再次点击「AIO」即可打开它。

插件默认使用 `%LOCALAPPDATA%\AIO\ancoder-tauri-spike.exe`。自定义安装位置可在启动 Harness 前将环境变量 `AIO_TAURI_EXECUTABLE` 设为 AIO Tauri 可执行文件的绝对路径。按钮出现感叹号时，将鼠标移到按钮上或用键盘聚焦，查看失败原因。

## 升级和卸载

从 0.1.0 升级时，先在 Harness 的插件管理界面卸载旧版，再安装并启用新版。启动入口由会话菜单移到侧栏。卸载插件只移除 Harness 的入口，AIO 的项目和会话由 AIO 管理。
