const OWNER = "ganeshnair298-collab";
const REPO = "lightfall";
const API = `https://api.github.com/repos/${OWNER}/${REPO}/releases/latest`;

const versionEl = document.querySelector("#version");
const statusEl = document.querySelector("#status");
const noteEl = document.querySelector("#release-note");
const dateEl = document.querySelector("#release-date");
const countEl = document.querySelector("#asset-count");
const downloadsEl = document.querySelector("#downloads");

document.querySelector("#year").textContent = new Date().getFullYear();

function readableSize(bytes) {
  if (!Number.isFinite(bytes)) return "";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes, unit = 0;
  while (size >= 1024 && unit < units.length - 1) { size /= 1024; unit++; }
  return `${size.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

function showError(message) {
  versionEl.textContent = "Release unavailable";
  statusEl.textContent = "UNAVAILABLE";
  statusEl.style.color = "#ffb1b1";
  statusEl.style.borderColor = "rgba(255,120,120,.25)";
  noteEl.textContent = message;
  downloadsEl.innerHTML = '<div class="empty">Visit the official <a href="https://github.com/ganeshnair298-collab/lightfall/releases" target="_blank" rel="noopener">Lightfall Releases page</a> to find available downloads.</div>';
}

async function loadLatestRelease() {
  try {
    const response = await fetch(API, {
      headers: { "Accept": "application/vnd.github+json" }
    });
    if (response.status === 404) throw new Error("No published release was found yet. Check back after a release is published.");
    if (!response.ok) throw new Error(`GitHub returned an error (${response.status}). Please try again later.`);
    const release = await response.json();

    versionEl.textContent = release.name || release.tag_name || "Latest release";
    statusEl.textContent = release.prerelease ? "PRE-RELEASE" : "LATEST";
    noteEl.textContent = release.body?.trim() || "The latest official Lightfall release is ready to download.";
    dateEl.textContent = `Published ${new Date(release.published_at || release.created_at).toLocaleDateString()}`;

    const assets = Array.isArray(release.assets) ? release.assets : [];
    countEl.textContent = `${assets.length} file${assets.length === 1 ? "" : "s"} available`;
    downloadsEl.replaceChildren();

    if (!assets.length) {
      downloadsEl.innerHTML = '<div class="empty">This release has no attached installer files yet. Open the release page for details.</div>';
    } else {
      for (const asset of assets) {
        const link = document.createElement("a");
        link.className = "download-button";
        link.href = asset.browser_download_url;
        link.setAttribute("rel", "noopener");
        const name = document.createElement("span");
        name.textContent = asset.name;
        const detail = document.createElement("small");
        detail.textContent = readableSize(asset.size) + "  ↗";
        link.append(name, detail);
        downloadsEl.append(link);
      }
    }
  } catch (error) {
    showError(error.message || "Could not connect to GitHub. Please try again.");
  }
}

loadLatestRelease();
