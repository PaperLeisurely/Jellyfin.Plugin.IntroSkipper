# Intro Skipper

<div align="center">
    <p>
        <img alt="Plugin Banner" src="https://raw.githubusercontent.com/intro-skipper/intro-skipper/12.0/images/logo.png" />
    </p>
    <p>
        分析电视剧集音频，检测并跳过片头（Intro）。
    </p>

[![CodeQL](https://github.com/intro-skipper/intro-skipper/actions/workflows/codeql.yml/badge.svg)](https://github.com/intro-skipper/intro-skipper/actions/workflows/codeql.yml)
<a href="https://github.com/intro-skipper/intro-skipper/releases">
<img alt="Total GitHub Downloads" src="https://img.shields.io/github/downloads/intro-skipper/intro-skipper/total?label=github%20downloads"/>
</a>
<br />
<p align="center">
  <a href="https://discord.gg/AYZ7RJ3BuA"><img src="https://invidget.switchblade.xyz/AYZ7RJ3BuA"></a>
</p>
</div>

> ## 中文汉化分支说明（localization/zh-CN）
> 本分支基于上游 `12.0` 分支（对应 **Jellyfin 12.0 / .NET 10 / net10.0**），对**配置页 UI 做了全量中文汉化**：
> - 在 `IntroSkipper/Configuration/introskipper.js` 收录了汉化后的配置页脚本，覆盖 **9 个页签**：常规（General）、分析（Analysis）、检测（Detection）、黑帧（Black Frame）、章节（Chapters）、FFmpeg、时间戳与片段编辑器（Timestamps / Segment Editor）、工具（Tools）、信息（Information），并把校验、排除列表、确认框、aria 等**通用文案一并译为中文**；
> - 汉化只替换用户可见文案，**代码结构、id、value 键、URL、正则、样式均未改动**；
> - 说明：官方发行版中的 `introskipper.js` 由 `web/` 源码构建生成且被 `.gitignore` 忽略，因此本分支采用“**强制收录汉化产物**”的方式把中文文件提交进 `Configuration/`，便于直接构建/嵌入中文 UI；官方流程会在构建时重新生成该文件并覆盖它，如需保持汉化请沿用本文件或同步修改 `web/` 源码。
> 本文件为仓库 README 的中文翻译版；英文原版见 `README.md`。除上述汉化内容外，本分支未改动其它代码/功能。

## 源地址（适用于所有 Jellyfin 版本）
> [!NOTE]
> 若添加源后列表里没有出现插件：
> * 请确认正在使用最新的 Jellyfin 版本
> * 无缓存刷新插件页（Windows/Linux 用 `CTRL + F5`，macOS 用 `SHIFT + CMD + R`）

```
https://intro-skipper.org/manifest.json
```
**重要：该地址会根据访问它的 Jellyfin 版本返回对应的清单。
<br />
在浏览器中直接访问不会返回清单（因为浏览器没有携带 Jellyfin 版本信息）。**

### 自 Jellyfin 10.10 起，Intro Skipper **不再修改 UI**。

## 可选：File Transformation 插件

部分 Web UI 功能（例如调整跳过按钮超时时间）依赖 File Transformation 插件。即使未安装它，Intro Skipper 仍可工作，只是这些增强功能不会生效。

<details>
<summary>点击查看如何安装 File Transformation 插件</summary>

- 插件仓库：https://github.com/IAmParadox27/jellyfin-plugin-file-transformation
- 最简单的安装方式：
    - 把它作为插件源添加到你的 Jellyfin 服务器。
     ```
     https://www.iamparadox.dev/jellyfin/plugins/manifest.json
     ```
    - 在目录中找到 “File Transformation” 并安装。
</details>

## 系统要求

* Jellyfin 12.0.0（或更新版本）
* 必须安装 Jellyfin 官方维护的 `ffmpeg` [分支](https://github.com/jellyfin/jellyfin-ffmpeg)，版本 `7.1.3-1` 或更新
  * `jellyfin/jellyfin` 12.z 容器：已预装
  * `linuxserver/jellyfin` 12.z 容器：已预装
  * 基于 Debian Linux 的原生安装：由 `jellyfin-ffmpeg7` 软件包提供
  * MacOS 原生安装：需自行编译带 chromaprint 支持的 ffmpeg（[说明](https://github.com/intro-skipper/intro-skipper/wiki/Custom-FFMPEG-(MacOS))）
  * Gentoo Linux 原生安装：启用 `xarblu-overlay` 并安装 `media-video/jellyfin-ffmpeg`

## 规范
- [行为准则](https://github.com/intro-skipper/.github/blob/main/CODE_OF_CONDUCT.md)
- [隐私政策](https://github.com/intro-skipper/.github/blob/main/PRIVACY.md)

## 免责声明

本插件基于 [GNU General Public License v3.0](https://github.com/intro-skipper/intro-skipper/blob/12.0/LICENSE) 许可。
按“现状”提供，不附带任何明示或默示担保。请自行承担使用风险。
作者对数据丢失、漏检、误报或使用本插件导致的任何其它损失概不负责。

本插件生成的音频指纹（Chromaprint）、静音检测与黑帧检测数据，全部源自
你自己的本地媒体文件。插件作者不对任何生成的指纹或检测数据主张所有权。
你所生成的数据由你自己负责；除纯本地个人使用外，分享或再分发此类数据
可能违反底层媒体或软件所适用的许可证、服务条款或其它协议。在这样做之前，
你有责任自行研究并遵守所有适用条款。作者不对你使用、分发或商业化这些数据
的权利作任何陈述，并明确否认因此类使用产生的任何责任。

本项目与 Jellyfin 项目或任何媒体权利人没有隶属、背书或官方关联关系。
Chromaprint 作为 [jellyfin-ffmpeg](https://github.com/jellyfin/jellyfin-ffmpeg) 的一部分包含其中，并受其各自许可证约束。
“Jellyfin”及任何相关商标均属于其各自所有者。

## [检测参数](https://github.com/intro-skipper/intro-skipper/wiki#detection-parameters)

## [检测类型](https://github.com/intro-skipper/intro-skipper/wiki#detection-types)

## [安装](https://github.com/intro-skipper/intro-skipper/wiki/Installation)
- #### [安装插件](https://github.com/intro-skipper/intro-skipper/wiki/Installation#step-1-install-the-plugin)
- #### [验证插件](https://github.com/intro-skipper/intro-skipper/wiki/Installation#step-2-verify-the-plugin)
- #### [自定义 FFMPEG（MacOS）](https://github.com/intro-skipper/intro-skipper/wiki/Custom-FFMPEG-(MacOS))

## [Jellyfin 跳过选项](https://github.com/intro-skipper/intro-skipper/wiki/Jellyfin-Skip-Options)

## [故障排查](https://github.com/intro-skipper/intro-skipper/wiki/Troubleshooting)
- #### [目录中不显示插件](https://github.com/intro-skipper/intro-skipper/wiki/Troubleshooting#plugin-not-shown-in-catalog)
- #### [计划任务立刻失败](https://github.com/intro-skipper/intro-skipper/wiki/Troubleshooting#scheduled-tasks-fail-instantly)
- #### [跳过按钮不可见](https://github.com/intro-skipper/intro-skipper/wiki/Troubleshooting#skip-button-is-not-visible)

## 赞助商

慷慨允许我们使用他们资源的公司：

| [DigitalOcean](https://www.digitalocean.com/?refcode=8471e96eb6dd)                                                                                                                                                                                                                           | [SignPath](https://signpath.org/)                                                                                  |
|-|-
| [![do_logo_vertical_blue svg](https://opensource.nyc3.cdn.digitaloceanspaces.com/attribution/assets/SVG/DO_Logo_horizontal_blue.svg)](https://www.digitalocean.com/) | [ ![Image](https://github.com/user-attachments/assets/2b5679e0-76a4-4ae7-bb37-a6a507a53466)](https://signpath.org/) |
| 各项服务的托管                                                                                                                                                                                                                                               | 由 [SignPath.io](https://about.signpath.io/) 提供免费代码签名，证书来自 [SignPath Foundation](https://signpath.org/)。
