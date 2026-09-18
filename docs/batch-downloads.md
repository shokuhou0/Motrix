# Batch named downloads (Windows custom development build)

Based on Motrix v2.0.0-beta.39. This source bundle is not a prebuilt installer.

## Usage

Paste one task per line in the New Task URL field:

```text
xxx01,https://example.com/a.mp4
第02集,https://example.com/b.mp4
自定义名称.mkv,https://example.com/c.mp4
https://example.com/d.mp4
```

The first three save as `xxx01.mp4`, `第02集.mp4`, and `自定义名称.mkv`. The last uses existing automatic naming.

- Use an ASCII comma. Only the first separator divides a name from its URL; commas inside a complete URL remain unchanged.
- Names cannot contain commas, paths, Windows-invalid filename characters, or reserved device names.
- A name without an extension inherits the last URL path extension only. Query parameters and response headers are not inspected.
- If no extension can be inferred, retain the name as entered. Download URLs are never decoded or rewritten.
- Plain magnet links retain existing behavior; named magnet lines are unsupported.
- Invalid lines display line numbers and block the entire form until corrected.
- A per-line name overrides the advanced filename field. Plain URLs in a mixed batch retain automatic naming.
- Existing Motrix filename-conflict handling remains in effect; this change adds no overwrite or deduplication policy.

## Build the Windows installer on GitHub Actions

1. Put the complete extracted source in your own GitHub repository, including `.github`. Uploading only the ZIP does not make a runnable workflow.
2. Place `package.json` and `.github/workflows/batch-windows.yml` at their respective paths from the repository root. Commit the workflow to the default branch to enable manual dispatch.
3. Select **Actions → Build Windows Batch Edition → Run workflow**.
4. After all steps pass, download **Artifacts → Motrix-Batch-Windows-x64**.
5. Extract it and run `Motrix-Batch-Setup-2.0.0-beta.39-x64.exe`.

The workflow uses Windows 2025, Node.js 24, pnpm 12.4.2, and Rust 1.94.1. It runs validation, focused unit tests, native builds, existing add-task E2E tests, package verification, and a packaged startup smoke test. A failed step prevents successful installer artifact upload. It creates an unsigned private development artifact, not a public Release, and leaves official release workflows intact.

## Verification at delivery

- Batch parser, form submission, input component, and existing interpreters: 127 tests passed.
- TypeScript, architecture boundaries, i18n, and filename checks passed.
- Repository lint passed with 3 existing warnings in unchanged code.
- Electron renderer production build passed with an existing large-chunk warning.
- Local Windows native build failed: the Linux execution environment lacks Cargo and Windows MSVC tools. Dependency installation also encountered native header extraction `fchown EINVAL` errors.
- GitHub Actions has not run. Windows installation, actual download finalization, and packaged startup remain unverified. The 127 tests do not replace those checks.

This custom build retains the upstream application identity and data directory. An official update may remove the feature; retain the original installer and a data backup before replacing an existing beta. The custom artifact is unsigned and is not an official release.
