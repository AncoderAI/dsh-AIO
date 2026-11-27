---
description: "从 DeepSeek Harness Desktop 的会话菜单把本地工作区交给 AIO Tauri 工作台。"
kind: "package-bundle"
---

# AIO 工作台插件

这个插件适用于 Windows 上的 DeepSeek Harness Desktop 0.2.1-rc.2 和 AIO Tauri 2.0.2。它在 Harness 会话的 `…` 菜单中增加「在 AIO 中打开工作区」。AIO 在独立窗口中打开该目录，项目、会话和运行时设置由 AIO 管理。

## 安装

先安装 AIO 的 Tauri 版，并启动一次 Harness Desktop 以初始化 `desktop` profile。在 Harness 的插件管理界面按本地路径安装此仓库的 `plugin` 目录。以下命令从交付仓库根目录执行。也可以退出 Harness 后，用 Desktop 自带的 `dsh` 命令安装。

```powershell
$pluginDir = (Resolve-Path .\plugin).Path
dsh plugin --profile desktop add "file:$pluginDir"
```

从源码运行 Desktop 时，在同一个 PowerShell 中设置 `DSH_HOME` 为开发版正在使用的目录，并在 Harness 源码仓库根目录用 `pnpm dsh` 执行相同的 `plugin` 命令，保留上一步解析的 `$pluginDir`。默认开发目录是 `apps/desktop/.desktop-build/development/home`。

## 使用

启动 Harness Desktop。在左侧选择具有本机工作区的任意会话，打开该会话的 `…` 菜单，选择「在 AIO 中打开工作区」。插件默认使用 `%LOCALAPPDATA%\AIO\ancoder-tauri-spike.exe`。自定义安装位置可在启动 Harness 前设置环境变量 `AIO_TAURI_EXECUTABLE`，值为 AIO Tauri 可执行文件的绝对路径。

AIO 启动由 Windows 接受后，Harness 显示「已将工作区发送给 AIO」。AIO 在首次启动或收到后续请求时通过 `--open-folder` 打开项目。菜单项适用于具有 Windows 盘符工作区路径的会话。目录需要能在本机访问。

## 卸载

在插件管理界面卸载「AIO 工作台」，或退出 Desktop 后执行 `dsh plugin --profile desktop remove dsh-aio-workbench`。AIO 应用及其数据由 AIO 自己管理。
