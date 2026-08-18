# DownloadBridge 下载桥

DownloadBridge 是一个私有的 GitHub Actions 下载桥，用于把公开软件源码、单文件或 Python 依赖获取到 GitHub Actions Artifact 中，供 ChatGPT 的 GitHub Connector 下载和验证。

## 项目定位

该仓库只作为受控资源获取通道，不是开放代理，也不作为被获取软件的运行后端。请求由根目录 `request.json` 描述；提交请求后，GitHub Actions 会校验目标、执行下载、计算 SHA-256，并生成来源清单。

## 支持的请求模式

### `url`：下载公开 HTTPS 文件

下载一个公开 HTTPS URL，支持重定向、重试、最大 2 GiB 限制，并可选校验预期 SHA-256。

```json
{
  "mode": "url",
  "url": "https://example.com/file.bin",
  "filename": "file.bin",
  "sha256": "",
  "max_bytes": 2147483648
}
```

字段说明：

- `url`：必须是可公开访问的 HTTPS 地址。
- `filename`：Artifact 中保存的简单文件名，不允许目录路径。
- `sha256`：可留空；填写时必须是 64 位十六进制 SHA-256。
- `max_bytes`：允许下载的最大字节数，硬上限为 2 GiB。

### `git`：获取公开 Git 仓库源码

以浅克隆方式获取公开 HTTPS Git 仓库，不递归下载 submodule。可通过 `ref` 固定分支或标签；实际解析到的 commit 会写入 `manifest.json`。

```json
{
  "mode": "git",
  "url": "https://projects.blender.org/lab/blender_mcp.git",
  "ref": ""
}
```

### `pip`：下载 Python 包及依赖

在 GitHub Runner 上使用指定 CPython 版本下载包索引中的发行文件和传递依赖。支持 Python 3.10 到 3.14，默认 3.13。为保持来源边界，不接受直接 URL、本地路径或 pip 命令行选项。

```json
{
  "mode": "pip",
  "python_version": "3.13",
  "requirements": [
    "mcp[cli]>=1.2.0",
    "docutils",
    "pyyaml"
  ]
}
```

## 执行流程

修改并提交 `request.json` 后会触发 `DownloadBridge 下载桥` workflow：

```text
读取请求
→ 校验模式与目标
→ 选择 Python 运行时
→ 执行 URL / Git / pip 获取
→ 计算文件 SHA-256 与 MIME 类型
→ 生成 manifest.json
→ 上传 fetched-file Artifact
```

也可以在 GitHub Actions 页面通过 `workflow_dispatch` 手动触发当前请求。

## 输出

每次成功运行都会上传名为 `fetched-file` 的 Artifact，其中包含实际获取的文件和 `manifest.json`。

`manifest.json` 至少记录：

- 原始 `request.json` 请求；
- 每个文件的相对路径、字节数、SHA-256 和 MIME 类型；
- Git 模式解析得到的源仓库 commit；
- GitHub 仓库名、workflow run id 和请求 commit。

Artifact 默认保留 7 天。

## 安全边界

- `url` 与 `git` 仅允许公开 HTTPS 目标。
- 拒绝 URL 中的用户名或密码。
- DNS 解析结果必须是公开可路由地址，阻止私网、环回、链路本地等非公网目标。
- Git 模式要求 URL 以 `.git` 结尾。
- pip 模式只允许包索引需求表达式，不接受直接 URL、本地路径或命令行参数。
- 单文件下载硬上限为 2 GiB。
- 下载桥只负责传输和来源记录，不会把非 GitHub 上游伪装成 GitHub 来源。

## 文件说明

```text
request.json                 当前资源获取请求
.github/workflows/fetch.yml  下载、校验、清单生成与 Artifact 上传流程
README.md                    项目说明与使用规范
```

仓库中的 JSON 字段名、Artifact 名称和 manifest 字段属于机器接口，为保证兼容性继续使用英文；项目说明、GitHub Actions 展示名称和运行日志采用简体中文。