# NOTICE

AncoderWork 是 [GooeyPi](https://github.com/am-will/gooey-pi) 的衍生作品。

- 上游：`am-will/gooey-pi`，MIT License，Copyright (c) 2026 GooeyPi contributors
- fork 基点：`v1.1.11-6-g6f40736`（2026-08-16）
- 本仓库保留上游完整 git 历史与 `LICENSE` 原文，以履行 MIT 的署名义务。

AncoderWork 对上游的修改包括但不限于：收敛为 OMP 单后端、移除 Pi 与 Prime Agent 支持、
重做视觉与信息架构、以技能（Skill）为核心重构能力管理界面。这些修改同样以 MIT 发布。

`assets/omp-skills/skills/` 下随应用分发的技能包（`poteto-mode` 路由技能、23 条
`principle-*` 原子技能、`architect` / `arena` / `swarm` / `how` / `interrogate` /
`no-comments` / `show-me-your-work` / `technical-writing` / `unslop` / `figure-it-out`，
以及 `assets/omp-skills/agents/` 下的两个子代理定义）改编自
[cursor/plugins](https://github.com/cursor/plugins) 仓库中的 **pstack** 插件：

- 上游：`cursor/plugins`，MIT License，pstack 作者 Lauren Tan（poteto）
- 改编基点：`9bd4a8289f1c3fe870d518051772762a78b66ea0`（2026-09-09）
- 改编内容以 MIT 发布；具体改动与理由见 [`docs/pstack-port.md`](docs/pstack-port.md)。

本项目驱动的智能体运行时 [oh-my-pi (omp)](https://github.com/can1357/oh-my-pi)
为独立项目（MIT License，Copyright 2025 Mario Zechner，2025–2026 Can Bölük），
由用户自行安装或由本应用从其官方 Releases 下载，不包含在本仓库源码中。

界面视觉参考了 [DeepSeek Harness Desktop](https://github.com/anywhere-labs/deepseek-harness-desktop)
的公开界面预览，仅作设计语言参考，未使用其源代码。
