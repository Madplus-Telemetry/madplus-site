# Mad+ download page

Official download page for Mad+. Everything that publishes an APK is in this repository, so you can check how a release gets there.

## How a release is published

1. The signed APK is attached to a GitHub Release in this repo, named `madplus-<version>.apk`.
2. `.github/workflows/publish.yml` downloads it, computes its SHA-256 and uploads it to VirusTotal and MetaDefender.
3. `scripts/render.mjs` writes `index.html` with the download link, the hash and the links to both scan reports.

The app source code is not in this repository.

## Setup (maintainers)

Repository secrets: `VT_API_KEY` (VirusTotal) and `MD_API_KEY` (MetaDefender Cloud). GitHub Pages is served from `main`, folder `/`.

## Obtainium

Add the page address as an app source in Obtainium (source type: HTML). The APK link is in the static HTML of the page.
