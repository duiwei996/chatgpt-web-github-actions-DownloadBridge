# duiwei-download-bridge

A small private GitHub Actions bridge for moving public software sources and dependencies into an Actions artifact that ChatGPT's GitHub Connector can download.

## Supported request modes

### `url`
Downloads one public HTTPS URL with redirects, retries, a 2 GiB hard ceiling, optional SHA-256 verification, and a manifest.

```json
{
  "mode": "url",
  "url": "https://example.com/file.bin",
  "filename": "file.bin",
  "sha256": "",
  "max_bytes": 2147483648
}
```

### `git`
Clones a public HTTPS Git repository without submodules. An optional `ref` pins a branch or tag. The resolved commit is written to `manifest.json`.

```json
{
  "mode": "git",
  "url": "https://projects.blender.org/lab/blender_mcp.git",
  "ref": ""
}
```

### `pip`
Uses a requested CPython version (3.10..3.14; default 3.13) on the GitHub runner to download package-index distributions and all transitive dependencies into the artifact. Direct URLs, local paths and pip command-line options are rejected.

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

## Output

A push changing `request.json` triggers the workflow. Every successful run uploads a `fetched-file` artifact containing the fetched payload plus `manifest.json`. The manifest records SHA-256, byte size, MIME type, the workflow commit, and (for Git mode) the resolved source commit.

Artifacts are retained for 7 days. The bridge is intended for controlled software/source acquisition, not as an open proxy. URL and Git modes require public HTTPS destinations and reject credentials and non-public network addresses.
