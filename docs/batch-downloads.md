# Batch named downloads (Windows custom development build)

Based on Motrix v2.0.0-beta.39. This source bundle is not a prebuilt installer.

## Usage

Paste one task per line in the New Task URL field:

```text
xxx01,https://example.com/a.mp4
第02集$https://example.com/b.mp4
自定义名称.mkv，https://example.com/c.mp4
https://example.com/d.mp4
```

The first three save as `xxx01.mp4`, `第02集.mp4`, and `自定义名称.mkv`. The last uses existing automatic naming.

- Use an ASCII comma `,`, Chinese comma `，`, or dollar sign `$`. The first separator divides a name from its URL; punctuation inside the complete URL remains unchanged. Keep each name and URL on the same line (visual wrapping is fine).
- Names cannot contain any of the three separators, paths, Windows-invalid filename characters, or reserved device names.
- A name without an extension inherits the last URL path extension only. Query parameters and response headers are not inspected.
- If no extension can be inferred, retain the name as entered. Download URLs are never decoded or rewritten.
- Plain magnet links retain existing behavior; named magnet lines are unsupported.
- Invalid lines display line numbers and block the entire form until corrected.
- A per-line name overrides the advanced filename field. Plain URLs in a mixed batch retain automatic naming.
- Existing Motrix filename-conflict handling remains in effect; this change adds no overwrite or deduplication policy.

## Windows downloads and validation

The custom branch workflow builds both the installer and a no-install ZIP. After a successful run, download the desired artifact from GitHub Actions:

- `Motrix-Batch-Windows-x64`: extract and run the setup executable.
- `Motrix-Batch-Windows-x64-NoInstall`: extract the artifact, then extract the included application ZIP and run `Motrix.exe`. Keep all extracted application files together. Settings and task history still use the normal Windows user data directory.

The workflow runs code checks, focused parser and form tests, native tests, add-task end-to-end tests, package verification, and packaged startup tests. It also extracts the no-install ZIP and verifies and launches that extracted application. A failed step prevents artifact delivery. Builds are unsigned development artifacts in the fork, not official releases. Successful validation does not guarantee availability of an individual third-party download URL.

This custom build retains the upstream application identity and data directory. An official update may remove the feature; retain the original installer and a data backup before replacing an existing beta. The custom artifact is unsigned and is not an official release.
