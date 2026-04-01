document.addEventListener("DOMContentLoaded", () => {
    const CONSENT_KEY = "md_reader_consent_v1";
    const THEME_KEY = "md_reader_theme_v1";
    const LAST_DOC_KEY = "md_reader_last_doc_v1";
    const FALLBACK_FILES = [
        "cours/APIs.md",
        "cours/Workflow.md",
        "cours/PentestActiveDirectory.md"
    ];
    const SUPPORTED_EXTENSIONS = new Set(["md", "txt", "csv"]);
    const CANDIDATE_DIRS = ["./", "cours/"];

    const appShell = document.getElementById("app-shell");
    const sidebar = document.getElementById("sidebar");
    const sidebarResizer = document.getElementById("sidebar-resizer");
    const mobileDim = document.getElementById("mobile-dim");
    const docsTree = document.getElementById("docs-tree");
    const renderArea = document.getElementById("markdown-render");
    const docTitle = document.getElementById("doc-title");
    const globalSearchInput = document.getElementById("global-search");
    const menuToggle = document.getElementById("menu-toggle");
    const sidebarToggle = document.getElementById("sidebar-toggle");
    const themeCycle = document.getElementById("theme-cycle");
    const consentBanner = document.getElementById("consent-banner");
    const consentAllow = document.getElementById("consent-allow");
    const consentDeny = document.getElementById("consent-deny");
    const legalModal = document.getElementById("legal-modal");
    const legalContent = document.getElementById("legal-content");
    const legalTitle = document.getElementById("legal-title");
    const hljsLightTheme = document.getElementById("hljs-light-theme");
    const hljsDarkTheme = document.getElementById("hljs-dark-theme");
    const openLegal = document.getElementById("open-legal");
    const openPrivacy = document.getElementById("open-privacy");
    const openAccessibility = document.getElementById("open-accessibility");
    const openCookies = document.getElementById("open-cookies");
    const openLegalHub = document.getElementById("open-legal-hub");
    const closeLegal = document.getElementById("close-legal");
    const eraseLocalData = document.getElementById("erase-local-data");
    const copyright = document.getElementById("copyright");
    const closeMenuButton = document.getElementById("close-menu");

    let allFiles = [];
    let activePath = "";
    let currentQuery = "";
    let hasConsent = false;
    let directoryListingAvailable = false;
    let indexingInProgress = false;
    const contentIndex = new Map();
    const collapsedGroups = new Set();
    const THEME_MODES = ["system", "light", "dark"];
    const SIDEBAR_WIDTH_KEY = "md_reader_sidebar_width_v1";
    const SIDEBAR_COLLAPSED_KEY = "md_reader_sidebar_collapsed_v1";
    const SCROLL_POSITION_KEY = "md_reader_scroll_position_v1";
    const MENU_OPEN_KEY = "md_reader_menu_open_v1";
    let currentThemeMode = "system";
    let isDesktopSidebarCollapsed = false;
    let isResizingSidebar = false;
    let scrollSaveTimeout;

    marked.setOptions({
        gfm: true,
        breaks: false,
        headerIds: true,
        mangle: false
    });

    function sanitizePath(path) {
        return path
            .replace(/\\/g, "/")
            .replace(/^\.\//, "")
            .replace(/\/+/g, "/")
            .replace(/^\//, "");
    }

    function getFileExtension(path) {
        const file = sanitizePath(path).split("/").pop() || "";
        const match = file.toLowerCase().match(/\.([a-z0-9]+)$/);
        return match ? match[1] : "";
    }

    function isSupportedFile(path) {
        return SUPPORTED_EXTENSIONS.has(getFileExtension(path));
    }

    function iconByExtension(path) {
        const ext = getFileExtension(path);
        if (ext === "csv") {
            return "table-properties";
        }
        if (ext === "txt") {
            return "file";
        }
        return "file-text";
    }

    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function encodePath(path) {
        return sanitizePath(path)
            .split("/")
            .map((segment) => encodeURIComponent(segment))
            .join("/");
    }

    function formatDocLabel(path) {
        const fileName = path.split("/").pop() || path;
        return fileName.replace(/\.(md|txt|csv)$/i, "").replace(/[_-]+/g, " ").trim();
    }

    function getGroupName(path) {
        const parts = path.split("/");
        return parts.length > 1 ? parts[0] : "racine";
    }

    function resolveRelativePath(baseFilePath, relativeHref) {
        const safeBase = sanitizePath(baseFilePath);
        const baseParts = safeBase.split("/").slice(0, -1);
        const relativeParts = sanitizePath(relativeHref).split("/");
        const merged = [...baseParts];

        relativeParts.forEach((part) => {
            if (!part || part === ".") {
                return;
            }
            if (part === "..") {
                merged.pop();
                return;
            }
            merged.push(part);
        });

        return sanitizePath(merged.join("/"));
    }

    function extractLinkedDocuments(markdownText, sourcePath) {
        const linked = new Set();
        const regex = /\[[^\]]*\]\(([^)]+)\)/g;
        let match;

        while ((match = regex.exec(markdownText)) !== null) {
            const rawHref = (match[1] || "").trim();
            if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:")) {
                continue;
            }
            if (/^https?:\/\//i.test(rawHref)) {
                continue;
            }
            const hrefNoQuery = rawHref.split("?")[0].split("#")[0].trim();
            if (!hrefNoQuery) {
                continue;
            }
            const resolved = hrefNoQuery.startsWith("/")
                ? sanitizePath(hrefNoQuery)
                : resolveRelativePath(sourcePath, hrefNoQuery);
            if (isSupportedFile(resolved)) {
                linked.add(resolved);
            }
        }

        return Array.from(linked);
    }

    function hasIgnoreMarkerAtTop(text) {
        const normalized = (text || "").replace(/^\uFEFF/, "").trimStart();
        const topChunk = normalized.slice(0, 700);
        const firstLines = topChunk.split(/\r?\n/).slice(0, 8).join("\n").toLowerCase();
        if (firstLines.includes("fichier à ignorer") || firstLines.includes("fichier a ignorer")) {
            return true;
        }

        if (topChunk.startsWith("```")) {
            const endFence = topChunk.indexOf("```", 3);
            if (endFence > 3) {
                const fencedContent = topChunk.slice(3, endFence).toLowerCase();
                if (fencedContent.includes("fichier à ignorer") || fencedContent.includes("fichier a ignorer")) {
                    return true;
                }
            }
        }

        return false;
    }

    function normalizeIgnoreValue(value) {
        return (value || "")
            .replace(/^\uFEFF/, "")
            .trim()
            .toLowerCase()
            .replace(/à/g, "a");
    }

    function shouldIgnoreDocumentContent(ext, text) {
        const normalizedExt = (ext || "").toLowerCase();
        const source = text || "";

        if (normalizedExt === "md") {
            return hasIgnoreMarkerAtTop(source);
        }

        if (normalizedExt === "txt") {
            const firstMeaningfulLine = source
                .replace(/^\uFEFF/, "")
                .split(/\r?\n/)
                .map((line) => line.trim())
                .find((line) => line.length > 0) || "";
            return normalizeIgnoreValue(firstMeaningfulLine) === "||fichier a ignorer||";
        }

        if (normalizedExt === "csv") {
            const firstDataLine = source
                .replace(/^\uFEFF/, "")
                .split(/\r?\n/)
                .map((line) => line.trim())
                .find((line) => line.length > 0) || "";

            if (!firstDataLine) {
                return false;
            }

            const commaCount = (firstDataLine.match(/,/g) || []).length;
            const semicolonCount = (firstDataLine.match(/;/g) || []).length;
            const tabCount = (firstDataLine.match(/\t/g) || []).length;
            const delimiter = semicolonCount > commaCount && semicolonCount >= tabCount ? ";" : tabCount > commaCount ? "\t" : ",";
            const firstCell = (parseCsvLine(firstDataLine, delimiter)[0] || "").trim();
            return normalizeIgnoreValue(firstCell) === "fichier a ignorer";
        }

        return false;
    }

    function createStatus(type, title, message) {
        const icon = type === "error-state" ? "file-x-2" : "file-search";
        renderArea.innerHTML = `
            <div class="${type}">
                <i data-lucide="${icon}"></i>
                <h3>${title}</h3>
                <p>${message}</p>
            </div>
        `;
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    function renderLoading(message) {
        renderArea.innerHTML = `
            <div class="status">
                <i data-lucide="loader-circle"></i>
                <p>${message}</p>
            </div>
        `;
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    function applyTheme(theme) {
        if (theme === "dark" || theme === "light") {
            document.body.setAttribute("data-theme", theme);
        } else {
            document.body.removeAttribute("data-theme");
        }
        syncCodeTheme();
    }

    function getEffectiveTheme() {
        const explicit = document.body.getAttribute("data-theme");
        if (explicit === "dark" || explicit === "light") {
            return explicit;
        }
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    function syncCodeTheme() {
        if (!hljsLightTheme || !hljsDarkTheme) {
            return;
        }
        const effective = getEffectiveTheme();
        hljsDarkTheme.disabled = effective !== "dark";
        hljsLightTheme.disabled = effective === "dark";
    }

    function labelTheme(mode) {
        if (mode === "light") {
            return "Thème: Clair";
        }
        if (mode === "dark") {
            return "Thème: Sombre";
        }
        return "Thème: Système";
    }

    function syncThemeButton() {
        themeCycle.innerHTML = `<i data-lucide=\"sun-moon\"></i>${labelTheme(currentThemeMode)}`;
        themeCycle.setAttribute("aria-label", labelTheme(currentThemeMode));
        themeCycle.setAttribute("aria-pressed", currentThemeMode === "dark" ? "true" : "false");
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    function getStoredConsent() {
        return localStorage.getItem(CONSENT_KEY);
    }

    function persist(key, value) {
        if (hasConsent) {
            localStorage.setItem(key, value);
        }
    }

    function removePersistedData() {
        localStorage.removeItem(THEME_KEY);
        localStorage.removeItem(LAST_DOC_KEY);
        localStorage.removeItem(SIDEBAR_WIDTH_KEY);
        localStorage.removeItem(SIDEBAR_COLLAPSED_KEY);
        localStorage.removeItem(SCROLL_POSITION_KEY);
        localStorage.removeItem(MENU_OPEN_KEY);
    }

    function setSidebarToggleState() {
        sidebarToggle.setAttribute("aria-pressed", isDesktopSidebarCollapsed ? "true" : "false");
        sidebarToggle.innerHTML = isDesktopSidebarCollapsed
            ? "<i data-lucide=\"panel-left-open\"></i>"
            : "<i data-lucide=\"panel-left-close\"></i>";
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    function applyDesktopSidebarState() {
        const isDesktop = window.innerWidth > 980;
        if (!isDesktop) {
            appShell.classList.remove("sidebar-collapsed");
            sidebar.style.removeProperty("width");
            return;
        }
        appShell.classList.toggle("sidebar-collapsed", isDesktopSidebarCollapsed);
        setSidebarToggleState();
    }

    function setSidebarWidth(widthPx) {
        const clamped = Math.max(240, Math.min(520, Math.round(widthPx)));
        appShell.style.setProperty("--sidebar-width", `${clamped}px`);
        if (hasConsent) {
            localStorage.setItem(SIDEBAR_WIDTH_KEY, String(clamped));
        }
    }

    function openLegalModal(kind) {
        const blocks = {
            legal: {
                title: "Mentions légales",
                html: `
                    <h3>Éditeur</h3>
                    <p>Nom et prénom: Bryan Drouet.</p>
                    <p>Statut: site personnel d'études, 1re année BTS CIEL IR.</p>
                    <p>Établissement: Campus Saint Gabriel, Saint-Laurent-sur-Sèvre (France).</p>
                    <p>Contact éditeur: information à compléter avant publication publique.</p>
                    <h3>Hébergeur local</h3>
                    <p>Ce projet est actuellement servi en local pour usage pédagogique (Five Server).</p>
                    <p>Hébergeur public: information obligatoire à renseigner avant mise en ligne.</p>
                    <h3>Propriété intellectuelle</h3>
                    <p>Les contenus textuels, documents et code sont protégés par le droit d'auteur.</p>
                    <p>Les icônes utilisées proviennent de Lucide (licence ISC).</p>
                `
            },
            privacy: {
                title: "Politique de confidentialité",
                html: `
                    <h3>Données traitées</h3>
                    <p>Aucune donnée personnelle n'est envoyée vers un serveur tiers par cette interface.</p>
                    <p>Seules des préférences locales peuvent être enregistrées: thème choisi et dernier document ouvert.</p>
                    <h3>Base légale et minimisation</h3>
                    <p>Le traitement repose sur votre consentement explicite via le bandeau RGPD.</p>
                    <h3>Droits utilisateurs</h3>
                    <ul>
                        <li>Accéder aux préférences stockées localement</li>
                        <li>Rectifier les informations publiées dans les mentions légales</li>
                        <li>Retirer le consentement</li>
                        <li>Effacer les données locales à tout moment</li>
                    </ul>
                `
            },
            accessibility: {
                title: "Déclaration d'accessibilité",
                html: `
                    <h3>Référentiel</h3>
                    <p>L'interface applique les bonnes pratiques RGAA et WCAG: structure sémantique, navigation clavier et contraste renforcé.</p>
                    <h3>Fonctionnalités d'accessibilité</h3>
                    <ul>
                        <li>Navigation complète au clavier</li>
                        <li>Composants avec labels et attributs ARIA</li>
                        <li>Thèmes clair/sombre adaptés au système</li>
                    </ul>
                    <h3>Amélioration continue</h3>
                    <p>Les écarts détectés peuvent être corrigés directement dans ce projet.</p>
                `
            },
            cookies: {
                title: "Gestion des cookies et traceurs",
                html: `
                    <h3>Traceurs essentiels</h3>
                    <p>Aucun cookie tiers publicitaire ou analytique n'est installé.</p>
                    <h3>Traceurs non essentiels</h3>
                    <p>Le stockage local des préférences est non essentiel et soumis à consentement.</p>
                    <h3>Choix utilisateur</h3>
                    <p>Vous pouvez accepter ou refuser aussi simplement, puis supprimer les données locales.</p>
                `
            },
            "legal-hub": {
                title: "Informations légales et conformité",
                html: `
                    <h3>Mentions légales</h3>
                    <p>Informations éditeur, hébergeur et propriété intellectuelle.</p>
                    <h3>Confidentialité (RGPD)</h3>
                    <p>Consentement explicite, minimisation des données et suppression locale possible.</p>
                    <h3>Accessibilité</h3>
                    <p>Navigation clavier, structure sémantique et contrastes lisibles.</p>
                    <h3>Cookies et traceurs</h3>
                    <p>Aucun traceur publicitaire; préférences locales gérées avec consentement.</p>
                `
            }
        };
        const selected = blocks[kind] || blocks.legal;
        legalTitle.textContent = selected.title;
        legalContent.innerHTML = selected.html;
        legalModal.hidden = false;
        closeLegal.focus();
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    function closeLegalModal() {
        legalModal.hidden = true;
        document.body.style.removeProperty("overflow");
    }

    async function tryParseDirectoryListing(dir) {
        try {
            const response = await fetch(dir, { cache: "no-store" });
            if (!response.ok) {
                console.debug(`Directory listing for "${dir}" returned ${response.status} - falling back to probeDocumentFile`);
                return { files: [], dirs: [] };
            }
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            const anchors = Array.from(doc.querySelectorAll("a[href]"));

            if (!anchors.length) {
                return { files: [], dirs: [] };
            }

            const files = [];
            const dirs = [];

            anchors.forEach((a) => {
                const rawHref = a.getAttribute("href") || "";
                if (!rawHref || rawHref.startsWith("http") || rawHref.startsWith("#")) {
                    return;
                }
                const decoded = decodeURIComponent(rawHref.split("?")[0]).trim();
                if (!decoded || decoded === "../") {
                    return;
                }
                const normalizedBase = sanitizePath(dir);
                const normalizedHref = sanitizePath(decoded);
                const fullPath = sanitizePath(`${normalizedBase}/${normalizedHref}`);

                if (isSupportedFile(decoded) || isSupportedFile(fullPath)) {
                    files.push(fullPath);
                } else if (decoded.endsWith("/")) {
                    dirs.push(fullPath.endsWith("/") ? fullPath : `${fullPath}/`);
                }
            });

            if (files.length || dirs.length) {
                directoryListingAvailable = true;
            }

            return { files, dirs };
        } catch {
            return { files: [], dirs: [] };
        }
    }

    async function probeDocumentFile(path) {
        try {
            const response = await fetch(encodePath(path), { cache: "no-store" });
            if (!response.ok) {
                return false;
            }
            const contentType = response.headers.get("content-type") || "";
            if (!(contentType.includes("text") || contentType.includes("markdown") || contentType.includes("octet-stream") || contentType === "")) {
                return false;
            }

            // Lire le contenu pour vérifier les marqueurs d'ignore selon le type de fichier.
            const text = await response.text();
            if (shouldIgnoreDocumentContent(getFileExtension(path), text)) {
                return false;
            }

            return true;
        } catch {
            return false;
        }
    }

    async function discoverMarkdownFiles() {
        const queue = [...CANDIDATE_DIRS.map((d) => (d.endsWith("/") ? d : `${d}/`))];
        const visitedDirs = new Set();
        const foundFiles = new Set();
        let loopGuard = 0;

        while (queue.length && loopGuard < 40) {
            loopGuard += 1;
            const dir = queue.shift();
            const safeDir = sanitizePath(dir || "./") || "./";

            if (visitedDirs.has(safeDir)) {
                continue;
            }
            visitedDirs.add(safeDir);

            const { files, dirs } = await tryParseDirectoryListing(dir || "./");

            files.forEach((file) => {
                if (isSupportedFile(file)) {
                    foundFiles.add(sanitizePath(file));
                }
            });

            dirs.forEach((childDir) => {
                const depth = childDir.split("/").filter(Boolean).length;
                if (!visitedDirs.has(childDir) && depth <= 4) {
                    queue.push(childDir);
                }
            });
        }

        if ((!directoryListingAvailable || !foundFiles.size) && FALLBACK_FILES.length) {
            console.debug(`Directory listing not available or no files found. Probing ${FALLBACK_FILES.length} fallback files...`);
            await Promise.all(
                FALLBACK_FILES.map(async (path) => {
                    const normalized = sanitizePath(path);
                    if (await probeDocumentFile(normalized)) {
                        console.debug(`✓ Fallback file found: ${normalized}`);
                        foundFiles.add(normalized);
                    } else {
                        console.debug(`✗ Fallback file not found: ${normalized}`);
                    }
                })
            );
        }

        const existingFiles = Array.from(foundFiles);
        const allowedFiles = await Promise.all(
            existingFiles.map(async (path) => (await probeDocumentFile(path) ? path : null))
        );
        foundFiles.clear();
        allowedFiles.forEach((path) => {
            if (path) {
                foundFiles.add(path);
            }
        });

        const crawlQueue = Array.from(foundFiles);
        const crawled = new Set();
        let crawlGuard = 0;

        while (crawlQueue.length && crawlGuard < 150) {
            crawlGuard += 1;
            const currentFile = sanitizePath(crawlQueue.shift() || "");
            if (!currentFile || crawled.has(currentFile) || !isSupportedFile(currentFile)) {
                continue;
            }
            crawled.add(currentFile);

            try {
                const response = await fetch(encodePath(currentFile), { cache: "no-store" });
                if (!response.ok) {
                    continue;
                }
                if (!foundFiles.has(currentFile)) {
                    foundFiles.add(currentFile);
                }

                if (getFileExtension(currentFile) !== "md") {
                    continue;
                }

                const markdownText = await response.text();
                if (shouldIgnoreDocumentContent("md", markdownText)) {
                    continue; // Ignorer ce fichier
                }

                const linkedFiles = extractLinkedDocuments(markdownText, currentFile);

                for (const linked of linkedFiles) {
                    if (!foundFiles.has(linked)) {
                        if (!directoryListingAvailable && await probeDocumentFile(linked)) {
                            foundFiles.add(linked);
                            crawlQueue.push(linked);
                        }
                    }
                }
            } catch {
            }
        }

        return Array.from(foundFiles)
            .map(sanitizePath)
            .filter((p) => isSupportedFile(p))
            .sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }));
    }

    function getContentMatch(path, query) {
        if (!query) {
            return null;
        }
        const source = (contentIndex.get(path) || "").toLowerCase();
        if (!source) {
            return null;
        }
        const index = source.indexOf(query.toLowerCase());
        if (index < 0) {
            return null;
        }
        return index;
    }

    async function buildContentIndex(files) {
        if (indexingInProgress) {
            return;
        }
        indexingInProgress = true;
        await Promise.all(
            files.map(async (path) => {
                if (contentIndex.has(path)) {
                    return;
                }
                try {
                    const response = await fetch(encodePath(path), { cache: "no-store" });
                    if (!response.ok) {
                        return;
                    }
                    const text = await response.text();
                    contentIndex.set(path, text);
                } catch {
                }
            })
        );
        indexingInProgress = false;
    }

    function renderTree(files) {
        if (!files.length) {
            docsTree.innerHTML = "<p class=\"group-title\">Aucun document détecté.</p>";
            if (window.lucide) {
                lucide.createIcons();
            }
            return;
        }

        const grouped = files.reduce((acc, path) => {
            const group = getGroupName(path);
            if (!acc[group]) {
                acc[group] = [];
            }
            acc[group].push(path);
            return acc;
        }, {});

        const groups = Object.keys(grouped).sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }));
        const html = groups
            .map((group) => {
                const groupItems = grouped[group]
                    .filter((path) => {
                        const normalizedQuery = currentQuery.toLowerCase();
                        const fileTarget = `${path} ${formatDocLabel(path)}`.toLowerCase();
                        const isFileMatch = !normalizedQuery || fileTarget.includes(normalizedQuery);
                        if (!normalizedQuery) {
                            return isFileMatch;
                        }
                        const isContentMatch = getContentMatch(path, normalizedQuery) !== null;
                        return isFileMatch || isContentMatch;
                    })
                    .map((path, idx) => {
                        const activeClass = path === activePath ? "active" : "";
                        const normalizedQuery = currentQuery.toLowerCase();
                        const contentMatch = normalizedQuery && getContentMatch(path, normalizedQuery) !== null;
                        const contentClass = contentMatch ? "match-content" : "";
                        const label = formatDocLabel(path);
                        return `
                            <button type="button" class="doc-item ${activeClass} ${contentClass}" data-path="${path}" style="animation-delay:${idx * 22}ms" aria-label="Ouvrir ${escapeHtml(label)}">
                                <span class="left">
                                    <i data-lucide="${iconByExtension(path)}"></i>
                                    <span class="title">${escapeHtml(label)}</span>
                                </span>
                                <span class="path">${escapeHtml(path)}</span>
                            </button>
                        `;
                    })
                    .join("");

                if (!groupItems) {
                    return "";
                }

                const isCollapsed = collapsedGroups.has(group);
                const collapsedClass = isCollapsed ? "collapsed" : "";
                const chevron = isCollapsed ? "chevron-right" : "chevron-down";
                const count = groupItems.match(/class=\"doc-item/g)?.length || 0;

                return `
                    <section class="tree-group ${collapsedClass}" data-group="${escapeHtml(group)}" aria-label="${escapeHtml(group)}">
                        <button type="button" class="group-title" data-group-toggle="${escapeHtml(group)}" aria-label="Afficher ou masquer ${escapeHtml(group)}">
                            <span class="group-meta">
                                <i data-lucide="${chevron}"></i>
                                <span>${escapeHtml(group)}</span>
                            </span>
                            <span class="group-count">${count}</span>
                        </button>
                        ${groupItems}
                    </section>
                `;
            })
            .join("");

        docsTree.innerHTML = html || "<p class=\"group-title\">Aucun résultat pour cette recherche.</p>";

        docsTree.querySelectorAll(".doc-item").forEach((button) => {
            button.addEventListener("click", () => {
                const path = button.getAttribute("data-path");
                if (path) {
                    loadDocument(path);
                }
            });
        });

        docsTree.querySelectorAll("[data-group-toggle]").forEach((button) => {
            button.addEventListener("click", () => {
                const group = button.getAttribute("data-group-toggle");
                if (!group) {
                    return;
                }
                if (collapsedGroups.has(group)) {
                    collapsedGroups.delete(group);
                } else {
                    collapsedGroups.add(group);
                }
                renderTree(allFiles);
            });
        });

        if (window.lucide) {
            lucide.createIcons();
        }
    }

    function slugifyHeading(text) {
        const normalized = text
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[—–]/g, "-")
            .replace(/[^a-z0-9\s-]/g, "")
            .trim();
        const raw = normalized.replace(/\s/g, "-").replace(/^-+|-+$/g, "");
        const collapsed = raw.replace(/-+/g, "-");
        const doubled = raw.replace(/-{3,}/g, "--");
        return Array.from(new Set([raw, collapsed, doubled].filter(Boolean)));
    }

    function normalizeAnchors() {
        const headings = Array.from(renderArea.querySelectorAll("h1, h2, h3, h4, h5, h6"));
        const aliasMap = new Map();
        const usedIds = new Map();

        headings.forEach((heading, index) => {
            const source = heading.textContent ? heading.textContent.trim() : "";
            const slugCandidates = slugifyHeading(source);
            const baseId = slugCandidates[0] || `section-${index + 1}`;
            const suffix = usedIds.get(baseId) || 0;
            const nextId = suffix ? `${baseId}-${suffix + 1}` : baseId;
            usedIds.set(baseId, suffix + 1);
            heading.id = nextId;
            aliasMap.set(nextId.toLowerCase(), nextId);
            slugCandidates.forEach((alias) => aliasMap.set(alias.toLowerCase(), nextId));
        });

        renderArea.querySelectorAll("a[href^='#']").forEach((link) => {
            const hash = decodeURIComponent((link.getAttribute("href") || "").slice(1)).toLowerCase();
            if (!hash) {
                return;
            }
            const targetId = aliasMap.get(hash) || hash;
            link.setAttribute("href", `#${targetId}`);
            link.addEventListener("click", (event) => {
                const id = decodeURIComponent((link.getAttribute("href") || "").slice(1));
                const target = document.getElementById(id);
                if (target) {
                    event.preventDefault();
                    target.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            });
        });
    }

    function enhanceExternalLinks() {
        const links = Array.from(renderArea.querySelectorAll("a[href]"));
        links.forEach((link) => {
            const href = (link.getAttribute("href") || "").trim();
            if (!href || href.startsWith("#")) {
                return;
            }
            try {
                const url = new URL(href, window.location.href);
                const isHttp = url.protocol === "http:" || url.protocol === "https:";
                const isExternal = isHttp && url.origin !== window.location.origin;
                if (isExternal) {
                    link.setAttribute("target", "_blank");
                    link.setAttribute("rel", "noopener noreferrer external");
                }
            } catch {
            }
        });
    }

    function parseCsvLine(line, delimiter) {
        const cells = [];
        let value = "";
        let inQuotes = false;
        for (let i = 0; i < line.length; i += 1) {
            const char = line[i];
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    value += '"';
                    i += 1;
                } else {
                    inQuotes = !inQuotes;
                }
                continue;
            }
            if (char === delimiter && !inQuotes) {
                cells.push(value.trim());
                value = "";
                continue;
            }
            value += char;
        }
        cells.push(value.trim());
        return cells;
    }

    function sanitizeFileName(value) {
        return (value || "document")
            .toLowerCase()
            .replace(/[^a-z0-9-_]+/gi, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "") || "document";
    }

    async function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return;
        }
        const hidden = document.createElement("textarea");
        hidden.value = text;
        hidden.setAttribute("readonly", "");
        hidden.style.position = "absolute";
        hidden.style.left = "-9999px";
        document.body.appendChild(hidden);
        hidden.select();
        document.execCommand("copy");
        hidden.remove();
    }

    function getCodeLanguage(pre) {
        const code = pre.querySelector("code");
        const classes = code ? Array.from(code.classList) : [];
        const langClass = classes.find((c) => c.startsWith("language-"));
        return langClass ? langClass.replace("language-", "") : "txt";
    }

    function enhanceCodeBlocks(path) {
        const blocks = Array.from(renderArea.querySelectorAll("pre"));
        const docStem = sanitizeFileName(formatDocLabel(path));

        blocks.forEach((pre, index) => {
            const codeText = pre.textContent || "";
            if (!codeText.trim()) {
                return;
            }

            const wrapper = document.createElement("div");
            wrapper.className = "code-block-wrap";
            pre.parentNode.insertBefore(wrapper, pre);
            wrapper.appendChild(pre);

            const actions = document.createElement("div");
            actions.className = "code-actions";
            actions.setAttribute("role", "group");
            actions.setAttribute("aria-label", "Actions du bloc de code");

            const copyBtn = document.createElement("button");
            copyBtn.type = "button";
            copyBtn.className = "btn-secondary code-action-btn";
            copyBtn.id = `code-copy-${index + 1}`;
            copyBtn.name = `code-copy-${index + 1}`;
            copyBtn.innerHTML = '<i data-lucide="copy"></i>Copier';
            copyBtn.setAttribute("aria-label", `Copier le bloc de code ${index + 1}`);

            const downloadBtn = document.createElement("button");
            downloadBtn.type = "button";
            downloadBtn.className = "btn-secondary code-action-btn";
            downloadBtn.id = `code-download-${index + 1}`;
            downloadBtn.name = `code-download-${index + 1}`;
            downloadBtn.innerHTML = '<i data-lucide="download"></i>Télécharger';
            downloadBtn.setAttribute("aria-label", `Télécharger le bloc de code ${index + 1}`);

            copyBtn.addEventListener("click", async () => {
                try {
                    await copyText(codeText);
                    copyBtn.innerHTML = '<i data-lucide="check"></i>Copié';
                    if (window.lucide) {
                        lucide.createIcons();
                    }
                    setTimeout(() => {
                        copyBtn.innerHTML = '<i data-lucide="copy"></i>Copier';
                        if (window.lucide) {
                            lucide.createIcons();
                        }
                    }, 1600);
                } catch {
                    copyBtn.innerHTML = '<i data-lucide="x"></i>Échec';
                    if (window.lucide) {
                        lucide.createIcons();
                    }
                }
            });

            downloadBtn.addEventListener("click", () => {
                const lang = sanitizeFileName(getCodeLanguage(pre));
                const fileName = `${docStem}-bloc-${index + 1}.${lang || "txt"}`;
                const blob = new Blob([codeText], { type: "text/plain;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
            });

            actions.appendChild(copyBtn);
            actions.appendChild(downloadBtn);
            wrapper.appendChild(actions);
        });
    }

    function highlightCodeBlocks() {
        if (!window.hljs) {
            return;
        }
        const codeNodes = Array.from(renderArea.querySelectorAll("pre code"));
        codeNodes.forEach((node) => {
            hljs.highlightElement(node);
        });
    }

    function enhanceTables() {
        const tables = Array.from(renderArea.querySelectorAll("table"));
        tables.forEach((table) => {
            if (table.parentElement && table.parentElement.classList.contains("table-scroll")) {
                return;
            }
            const wrapper = document.createElement("div");
            wrapper.className = "table-scroll";
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        });
    }

    function renderCsvTable(raw) {
        const rows = raw.split(/\r?\n/).filter((line) => line.trim().length);
        if (!rows.length) {
            return "<p>Fichier CSV vide.</p>";
        }
        const firstLine = rows[0] || "";
        const commaCount = (firstLine.match(/,/g) || []).length;
        const semicolonCount = (firstLine.match(/;/g) || []).length;
        const tabCount = (firstLine.match(/\t/g) || []).length;
        const delimiter = semicolonCount > commaCount && semicolonCount >= tabCount ? ";" : tabCount > commaCount ? "\t" : ",";
        const parsedRows = rows.map((line) => parseCsvLine(line, delimiter));
        const headers = parsedRows[0];
        const bodyRows = parsedRows.slice(1);
        const headHtml = `<thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead>`;
        const bodyHtml = `<tbody>${bodyRows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody>`;
        return `<table>${headHtml}${bodyHtml}</table>`;
    }

    function renderEmptyFileMessage(ext) {
        if (ext === "csv") {
            return "<p>Fichier CSV vide.</p>";
        }
        if (ext === "md") {
            return "<p>Fichier Markdown vide.</p>";
        }
        if (ext === "txt") {
            return "<p>Fichier texte vide.</p>";
        }
        return "<p>Fichier vide.</p>";
    }

    async function loadDocument(path) {
        const safePath = sanitizePath(path);
        const ext = getFileExtension(safePath);
        activePath = safePath;
        if (location.hash) {
            history.replaceState(null, "", `${location.pathname}${location.search}`);
        }
        renderTree(allFiles);
        renderLoading("Chargement du document...");

        try {
            const response = await fetch(encodePath(safePath), { cache: "no-store" });
            if (!response.ok) {
                throw new Error("Fichier introuvable");
            }

            const payload = await response.text();
            renderArea.className = `markdown-render format-${ext || "plain"}`;

            if (!payload.trim()) {
                renderArea.innerHTML = renderEmptyFileMessage(ext);
            } else if (ext === "md") {
                const rendered = marked.parse(payload);
                const sanitized = DOMPurify.sanitize(rendered, {
                    USE_PROFILES: { html: true }
                });
                renderArea.innerHTML = sanitized;
                normalizeAnchors();
                enhanceExternalLinks();
            } else if (ext === "csv") {
                renderArea.innerHTML = renderCsvTable(payload);
            } else {
                renderArea.innerHTML = `<pre>${escapeHtml(payload)}</pre>`;
            }

            enhanceTables();
            highlightCodeBlocks();
            enhanceCodeBlocks(safePath);

            docTitle.textContent = formatDocLabel(safePath);
            persist(LAST_DOC_KEY, safePath);

            if (window.lucide) {
                lucide.createIcons();
            }

            if (currentQuery) {
                highlightInViewer(currentQuery);
            }

            originalMarkdownContent = renderArea.innerHTML;
            applyAccessibilitySettings();

            // Restaurer la position du scroll pour ce document
            if (hasConsent) {
                setTimeout(() => {
                    const scrollData = localStorage.getItem(SCROLL_POSITION_KEY);
                    if (scrollData) {
                        try {
                            const { path, position } = JSON.parse(scrollData);
                            if (path === safePath) {
                                renderArea.parentElement.scrollTop = position;
                            }
                        } catch (e) {
                            // Ignorer les données corrompues
                        }
                    }
                }, 0);
            }
        } catch {
            docTitle.textContent = "Document indisponible";
            createStatus("error-state", "404 - Fichier introuvable", `Le document ${safePath} n'a pas pu être chargé.`);
        }
    }

    function removeMarks() {
        const marks = renderArea.querySelectorAll("mark[data-md-search='1']");
        marks.forEach((mark) => {
            const textNode = document.createTextNode(mark.textContent || "");
            mark.replaceWith(textNode);
        });
    }

    function highlightInViewer(term) {
        removeMarks();
        const normalizedTerm = term.trim();
        if (!normalizedTerm) {
            return;
        }
        const walker = document.createTreeWalker(renderArea, NodeFilter.SHOW_TEXT);
        const regex = new RegExp(normalizedTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig");
        const nodes = [];

        while (walker.nextNode()) {
            const node = walker.currentNode;
            if (!node.nodeValue || !node.nodeValue.trim()) {
                continue;
            }
            const parentTag = node.parentElement ? node.parentElement.tagName : "";
            if (["SCRIPT", "STYLE", "MARK", "CODE"].includes(parentTag)) {
                continue;
            }
            if (regex.test(node.nodeValue)) {
                nodes.push(node);
            }
            regex.lastIndex = 0;
        }

        nodes.forEach((node) => {
            const value = node.nodeValue || "";
            const fragment = document.createDocumentFragment();
            let lastIndex = 0;
            value.replace(regex, (match, index) => {
                if (index > lastIndex) {
                    fragment.appendChild(document.createTextNode(value.slice(lastIndex, index)));
                }
                const mark = document.createElement("mark");
                mark.setAttribute("data-md-search", "1");
                mark.textContent = match;
                fragment.appendChild(mark);
                lastIndex = index + match.length;
                return match;
            });
            if (lastIndex < value.length) {
                fragment.appendChild(document.createTextNode(value.slice(lastIndex)));
            }
            node.replaceWith(fragment);
        });
    }

    function initializeConsent() {
        const consent = getStoredConsent();
        hasConsent = consent === "accepted";
        if (consent !== "accepted" && consent !== "denied") {
            consentBanner.hidden = false;
        }

        consentAllow.addEventListener("click", () => {
            localStorage.setItem(CONSENT_KEY, "accepted");
            hasConsent = true;
            consentBanner.hidden = true;
            localStorage.setItem(THEME_KEY, currentThemeMode);
            localStorage.setItem(SIDEBAR_COLLAPSED_KEY, isDesktopSidebarCollapsed ? "1" : "0");
        });

        consentDeny.addEventListener("click", () => {
            localStorage.setItem(CONSENT_KEY, "denied");
            hasConsent = false;
            removePersistedData();
            consentBanner.hidden = true;
        });
    }

    function initializeTheme() {
        const storedTheme = hasConsent ? localStorage.getItem(THEME_KEY) : null;
        currentThemeMode = (storedTheme === "light" || storedTheme === "dark" || storedTheme === "system") ? storedTheme : "system";
        applyTheme(currentThemeMode);
        syncThemeButton();

        themeCycle.addEventListener("click", () => {
            const idx = THEME_MODES.indexOf(currentThemeMode);
            currentThemeMode = THEME_MODES[(idx + 1) % THEME_MODES.length];
            applyTheme(currentThemeMode);
            if (hasConsent) {
                localStorage.setItem(THEME_KEY, currentThemeMode);
            }
            syncThemeButton();
        });
    }

    function initializeEvents() {
        globalSearchInput.addEventListener("input", async (event) => {
            currentQuery = event.target.value.trim();
            if (currentQuery && !contentIndex.size) {
                await buildContentIndex(allFiles);
            }
            renderTree(allFiles);
            if (activePath) {
                highlightInViewer(currentQuery);
            }
        });

        menuToggle.addEventListener("click", () => {
            appShell.classList.add("sidebar-open");
            mobileDim.classList.add("visible");
            if (hasConsent) {
                localStorage.setItem(MENU_OPEN_KEY, "1");
            }
        });

        if (closeMenuButton) {
            closeMenuButton.addEventListener("click", () => {
                appShell.classList.remove("sidebar-open");
                mobileDim.classList.remove("visible");
                if (hasConsent) {
                    localStorage.setItem(MENU_OPEN_KEY, "0");
                }
            });
        }

        mobileDim.addEventListener("click", () => {
            appShell.classList.remove("sidebar-open");
            mobileDim.classList.remove("visible");
            if (hasConsent) {
                localStorage.setItem(MENU_OPEN_KEY, "0");
            }
        });

        sidebarToggle.addEventListener("click", () => {
            isDesktopSidebarCollapsed = !isDesktopSidebarCollapsed;
            applyDesktopSidebarState();
            if (hasConsent) {
                localStorage.setItem(SIDEBAR_COLLAPSED_KEY, isDesktopSidebarCollapsed ? "1" : "0");
            }
        });

        sidebarResizer.addEventListener("pointerdown", (event) => {
            if (window.innerWidth <= 980 || isDesktopSidebarCollapsed) {
                return;
            }
            isResizingSidebar = true;
            appShell.classList.add("resizing");
            sidebarResizer.setPointerCapture(event.pointerId);
            event.preventDefault();
        });

        sidebarResizer.addEventListener("pointermove", (event) => {
            if (!isResizingSidebar) {
                return;
            }
            const shellRect = appShell.getBoundingClientRect();
            const proposedWidth = event.clientX - shellRect.left;
            setSidebarWidth(proposedWidth);
        });

        sidebarResizer.addEventListener("pointerup", (event) => {
            if (!isResizingSidebar) {
                return;
            }
            isResizingSidebar = false;
            appShell.classList.remove("resizing");
            sidebarResizer.releasePointerCapture(event.pointerId);
        });

        openLegal.addEventListener("click", () => openLegalModal("legal"));
        openPrivacy.addEventListener("click", () => openLegalModal("privacy"));
        openAccessibility.addEventListener("click", () => openLegalModal("accessibility"));
        openCookies.addEventListener("click", () => openLegalModal("cookies"));
        openLegalHub.addEventListener("click", () => openLegalModal("legal-hub"));
        closeLegal.addEventListener("click", closeLegalModal);
        [openLegal, openPrivacy, openAccessibility, openCookies, openLegalHub].forEach((button) => {
            button.addEventListener("click", () => {
                document.body.style.overflow = "hidden";
            });
        });
        legalModal.addEventListener("click", (event) => {
            if (event.target === legalModal) {
                closeLegalModal();
            }
        });

        eraseLocalData.addEventListener("click", () => {
            removePersistedData();
            hasConsent = false;
            localStorage.setItem(CONSENT_KEY, "denied");
            currentThemeMode = "system";
            applyTheme("system");
            syncThemeButton();
            closeLegalModal();
            consentBanner.hidden = false;
        });

        window.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                appShell.classList.remove("sidebar-open");
                mobileDim.classList.remove("visible");
                closeLegalModal();
            }
        });

        document.addEventListener("click", (event) => {
            if (window.innerWidth > 980 || !appShell.classList.contains("sidebar-open")) {
                return;
            }
            if (!legalModal.hidden) {
                return;
            }
            const target = event.target;
            if (!(target instanceof Element)) {
                return;
            }
            if (sidebar.contains(target) || menuToggle.contains(target)) {
                return;
            }
            appShell.classList.remove("sidebar-open");
            mobileDim.classList.remove("visible");
        }, true);

        window.addEventListener("resize", () => {
            if (window.innerWidth > 980) {
                appShell.classList.remove("sidebar-open");
                mobileDim.classList.remove("visible");
            }
            applyDesktopSidebarState();
        });

        window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
            if (currentThemeMode === "system") {
                syncCodeTheme();
            }
        });

        // Sauvegarder la position du scroll quand on scroll dans le contenu
        const viewerWrap = document.querySelector(".viewer-wrap");
        if (viewerWrap) {
            viewerWrap.addEventListener("scroll", () => {
                // Debounce pour ne pas sauvegarder à chaque événement de scroll
                clearTimeout(scrollSaveTimeout);
                scrollSaveTimeout = setTimeout(() => {
                    if (hasConsent && activePath) {
                        localStorage.setItem(SCROLL_POSITION_KEY, JSON.stringify({
                            path: activePath,
                            position: viewerWrap.scrollTop
                        }));
                    }
                }, 500);
            });
        }
    }

    async function initializeApp() {
        initializeConsent();
        initializeTheme();
        syncCodeTheme();
        loadAccessibilitySettings();
        if (hasConsent) {
            const storedWidth = Number(localStorage.getItem(SIDEBAR_WIDTH_KEY));
            if (!Number.isNaN(storedWidth) && storedWidth > 0) {
                setSidebarWidth(storedWidth);
            }
            isDesktopSidebarCollapsed = localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
            
            // Restaurer l'état du menu mobile
            const isMenuOpen = localStorage.getItem(MENU_OPEN_KEY) === "1";
            if (isMenuOpen) {
                appShell.classList.add("sidebar-open");
                mobileDim.classList.add("visible");
            }
        }
        applyDesktopSidebarState();
        initializeEvents();
        copyright.textContent = `© ${new Date().getFullYear()} Bryan - Documentation Viewer.`;

        renderLoading("Détection des documents...");
        allFiles = await discoverMarkdownFiles();
        await buildContentIndex(allFiles);
        renderTree(allFiles);

        if (!allFiles.length) {
            docTitle.textContent = "Aucun document";
            createStatus("empty-state", "Aucun document trouvé", "Placez des fichiers .md, .txt ou .csv dans les dossiers scannés : racine (./), cours/ ou stage-Bryan/.");
            return;
        }

        const storedLastDoc = hasConsent ? localStorage.getItem(LAST_DOC_KEY) : null;
        const startDoc = storedLastDoc && allFiles.includes(storedLastDoc) ? storedLastDoc : allFiles[0];
        await loadDocument(startDoc);
    }

    // ====== ACCESSIBILITY MENU ======
    const ACCESSIBILITY_KEY = "md_reader_accessibility_v1";
    const accessibilityBtn = document.getElementById("accessibility-btn");
    const accessibilityModal = document.getElementById("accessibility-modal");
    const closeAccessibilityBtn = document.getElementById("close-accessibility");
    const resetAccessibilityBtn = document.getElementById("reset-accessibility");

    // All accessibility controls
    const accessibilityControls = {
        fontFamily: document.getElementById("font-family"),
        fontSize: document.getElementById("font-size"),
        lineHeight: document.getElementById("line-height"),
        letterSpacing: document.getElementById("letter-spacing"),
        wordSpacing: document.getElementById("word-spacing"),
        brightness: document.getElementById("brightness"),
        monochrome: document.getElementById("monochrome"),
        readingMask: document.getElementById("reading-mask"),
        highlightLinks: document.getElementById("highlight-links"),
        silentLetters: document.getElementById("silent-letters")
    };

    // Range value displays
    const rangeDisplays = {
        fontSize: document.getElementById("font-size-value"),
        lineHeight: document.getElementById("line-height-value"),
        letterSpacing: document.getElementById("letter-spacing-value"),
        wordSpacing: document.getElementById("word-spacing-value"),
        brightness: document.getElementById("brightness-value")
    };

    // Range buttons
    const rangeButtons = {
        fontSizeMinus: document.getElementById("font-size-minus"),
        fontSizePlus: document.getElementById("font-size-plus"),
        lineHeightMinus: document.getElementById("line-height-minus"),
        lineHeightPlus: document.getElementById("line-height-plus"),
        letterSpacingMinus: document.getElementById("letter-spacing-minus"),
        letterSpacingPlus: document.getElementById("letter-spacing-plus"),
        wordSpacingMinus: document.getElementById("word-spacing-minus"),
        wordSpacingPlus: document.getElementById("word-spacing-plus"),
        brightnessMinus: document.getElementById("brightness-minus"),
        brightnessPlus: document.getElementById("brightness-plus")
    };

    function updateRangeDisplay(control, display) {
        const value = parseInt(control.value);
        display.textContent = value + "%";
    }

    // Sauvegarde du contenu original pour la colorisation
    let originalMarkdownContent = null;

    // Syllabation française correcte
    function splitIntoSyllables(word) {
        if (word.length <= 2) return [word];
        
        const vowels = 'aeiouyàâäãáàéèêëïîôöœùûüœæ';
        const consonants = 'bcdfghjklmnpqrstvwxz';
        const inseparablePairs = ['br', 'cr', 'dr', 'fr', 'gr', 'pr', 'tr', 'bl', 'cl', 'fl', 'gl', 'pl', 'vr', 'ch', 'gn'];
        
        const lower = word.toLowerCase();
        const syllables = [];
        let current = '';
        let lastWasVowel = false;
        
        for (let i = 0; i < word.length; i++) {
            const char = lower[i];
            const isVowel = vowels.includes(char);
            const nextChar = i + 1 < word.length ? lower[i + 1] : '';
            const nextNextChar = i + 2 < word.length ? lower[i + 2] : '';
            
            current += word[i];
            
            // Coupure après une voyelle si:
            if (isVowel && i < word.length - 1) {
                const nextTwoChars = (char + nextChar + nextNextChar).toLowerCase();
                
                // Deux voyelles consécutives
                if (vowels.includes(nextChar)) {
                    syllables.push(current);
                    current = '';
                    lastWasVowel = true;
                    continue;
                }
                
                // Voyelle + consonne + voyelle
                if (!vowels.includes(nextChar) && i + 2 < word.length && vowels.includes(nextNextChar)) {
                    const twoConsonants = nextChar + nextNextChar;
                    
                    // Si groupe inséparable: pas de coupure
                    if (inseparablePairs.includes(twoConsonants.toLowerCase())) {
                        lastWasVowel = true;
                        continue;
                    }
                    
                    // Sinon: coupure avant la consonne
                    syllables.push(current);
                    current = '';
                    lastWasVowel = false;
                    continue;
                }
                
                // Dernière syllabe
                if (i === word.length - 2) {
                    lastWasVowel = true;
                    continue;
                }
            }
            
            lastWasVowel = isVowel;
        }
        
        if (current) syllables.push(current);
        return syllables.length > 0 ? syllables : [word];
    }

    function restoreOriginalMarkdownContent() {
        if (originalMarkdownContent !== null) {
            renderArea.innerHTML = originalMarkdownContent;
        }
    }

    function detectSilentSuffixStart(word) {
        if (!word || word.length < 3 || /^[A-Z0-9]+$/.test(word)) {
            return null;
        }

        const lowered = word.toLowerCase();
        if (lowered.endsWith("ent") && lowered.length >= 5) {
            return word.length - 3;
        }

        const commonSilentEndings = ["e", "es", "s", "t", "d", "x", "p"];
        for (const ending of commonSilentEndings) {
            if (lowered.endsWith(ending) && lowered.length > ending.length + 1) {
                return word.length - ending.length;
            }
        }

        return null;
    }

    function createTextFragmentWithSilentSuffix(text, silentStart) {
        const fragment = document.createDocumentFragment();
        if (silentStart === null || silentStart < 0 || silentStart >= text.length) {
            fragment.appendChild(document.createTextNode(text));
            return fragment;
        }

        if (silentStart > 0) {
            fragment.appendChild(document.createTextNode(text.slice(0, silentStart)));
        }

        const silent = document.createElement("span");
        silent.className = "silent-letter";
        silent.textContent = text.slice(silentStart);
        fragment.appendChild(silent);
        return fragment;
    }

    function splitTokenParts(token) {
        const match = token.match(/^([^\p{L}\p{N}'’-]*)([\p{L}\p{N}][\p{L}\p{N}'’-]*)([^\p{L}\p{N}'’-]*)$/u);
        if (!match) {
            return null;
        }

        return {
            prefix: match[1],
            core: match[2],
            suffix: match[3]
        };
    }

    function shouldSkipTextNode(node) {
        if (!node || !node.parentElement) {
            return true;
        }
        const tag = node.parentElement.tagName;
        return ["SCRIPT", "STYLE", "PRE", "CODE", "TEXTAREA"].includes(tag);
    }

    function applyLireCouleurColoring() {
        if (originalMarkdownContent === null) {
            return;
        }

        restoreOriginalMarkdownContent();

        const coloringMode = document.querySelector('input[name="coloring-mode"]:checked')?.value || "none";
        const applySilentLetters = accessibilityControls.silentLetters.checked;

        if (coloringMode === "none" && !applySilentLetters) {
            return;
        }

        const walker = document.createTreeWalker(renderArea, NodeFilter.SHOW_TEXT);
        const textNodes = [];
        while (walker.nextNode()) {
            const node = walker.currentNode;
            if (!node.nodeValue || !node.nodeValue.trim() || shouldSkipTextNode(node)) {
                continue;
            }
            textNodes.push(node);
        }

        let wordIndex = 0;

        textNodes.forEach((node) => {
            const value = node.nodeValue || "";
            const tokens = value.split(/(\s+)/);
            const fragment = document.createDocumentFragment();

            tokens.forEach((token) => {
                if (!token) {
                    return;
                }
                if (/^\s+$/u.test(token)) {
                    fragment.appendChild(document.createTextNode(token));
                    return;
                }

                const parts = splitTokenParts(token);
                if (!parts) {
                    fragment.appendChild(document.createTextNode(token));
                    return;
                }

                const { prefix, core, suffix } = parts;
                const silentStart = applySilentLetters ? detectSilentSuffixStart(core) : null;

                if (prefix) {
                    fragment.appendChild(document.createTextNode(prefix));
                }

                if (coloringMode === "words") {
                    const wordSpan = document.createElement("span");
                    wordSpan.className = "word";
                    wordSpan.dataset.wordIndex = String(wordIndex);
                    wordSpan.appendChild(createTextFragmentWithSilentSuffix(core, silentStart));
                    fragment.appendChild(wordSpan);
                    wordIndex += 1;
                } else if (coloringMode === "syllables") {
                    const syllables = splitIntoSyllables(core);
                    let offset = 0;
                    syllables.forEach((syllable, index) => {
                        const syllableSpan = document.createElement("span");
                        syllableSpan.className = `syllable ${index % 2 === 0 ? "syllable-alt-a" : "syllable-alt-b"}`;
                        const localSilentStart = silentStart === null ? null : silentStart - offset;
                        syllableSpan.appendChild(createTextFragmentWithSilentSuffix(syllable, localSilentStart));
                        fragment.appendChild(syllableSpan);
                        offset += syllable.length;
                    });
                    wordIndex += 1;
                } else {
                    fragment.appendChild(createTextFragmentWithSilentSuffix(core, silentStart));
                    wordIndex += 1;
                }

                if (suffix) {
                    fragment.appendChild(document.createTextNode(suffix));
                }
            });

            node.replaceWith(fragment);
        });
    }

    function applyAccessibilitySettings() {
        const body = document.body;
        const root = document.documentElement;
        
        // Font family - appliqué au body et tous les enfants avec !important
        body.classList.remove("accessibility-font-opendyslexic", "accessibility-font-lexend", "accessibility-font-arial");
        
        if (accessibilityControls.fontFamily.value === "opendyslexic") {
            body.classList.add("accessibility-font-opendyslexic");
        } else if (accessibilityControls.fontFamily.value === "lexend") {
            body.classList.add("accessibility-font-lexend");
        } else if (accessibilityControls.fontFamily.value === "arial") {
            body.classList.add("accessibility-font-arial");
        }

        // Font size - utilise variable CSS pour s'appliquer à TOUS les éléments
        const fontSizeVal = parseInt(accessibilityControls.fontSize.value);
        const fontSizeMultiplier = 1 + (fontSizeVal / 200);
        root.style.setProperty('--accessibility-font-size', fontSizeMultiplier);

        // Line height - utilise variable CSS
        const lineHeightVal = parseInt(accessibilityControls.lineHeight.value);
        const lineHeightMultiplier = 1 + (lineHeightVal / 150);
        root.style.setProperty('--accessibility-line-height', lineHeightMultiplier);

        // Letter spacing - utilise variable CSS
        const letterSpacingVal = parseInt(accessibilityControls.letterSpacing.value);
        root.style.setProperty('--accessibility-letter-spacing', (letterSpacingVal / 20) + "px");

        // Word spacing - utilise variable CSS
        const wordSpacingVal = parseInt(accessibilityControls.wordSpacing.value);
        root.style.setProperty('--accessibility-word-spacing', (wordSpacingVal / 15) + "px");

        // Brightness/monochrome - appliqué au body
        const brightnessVal = parseInt(accessibilityControls.brightness.value);
        const activeFilters = [`brightness(${100 + brightnessVal}%)`];
        if (accessibilityControls.monochrome.checked) {
            activeFilters.push("grayscale(100%)");
        }
        body.style.filter = activeFilters.join(" ");

        // Classes d'accessibilité appliquées au body pour affecter tout
        // Monochrome
        if (accessibilityControls.monochrome.checked) {
            body.classList.add("accessibility-monochrome");
        } else {
            body.classList.remove("accessibility-monochrome");
        }

        // Reading mask
        if (accessibilityControls.readingMask.checked) {
            body.classList.add("accessibility-reading-mask");
        } else {
            body.classList.remove("accessibility-reading-mask");
        }

        // Highlight links
        if (accessibilityControls.highlightLinks.checked) {
            body.classList.add("accessibility-highlight-links");
        } else {
            body.classList.remove("accessibility-highlight-links");
        }

        // Syllable/Word colors - radio group
        const coloringMode = document.querySelector('input[name="coloring-mode"]:checked')?.value || "none";
        body.classList.remove("accessibility-syllable-colors", "accessibility-alternate-words");
        
        if (coloringMode === "syllables") {
            body.classList.add("accessibility-syllable-colors");
        } else if (coloringMode === "words") {
            body.classList.add("accessibility-alternate-words");
        }

        // Silent letters
        if (accessibilityControls.silentLetters.checked) {
            body.classList.add("accessibility-silent-letters");
        } else {
            body.classList.remove("accessibility-silent-letters");
        }

        // Applique la colorisation/lettres muettes sans casser le HTML existant
        applyLireCouleurColoring();
    }

    function loadAccessibilitySettings() {
        const storage = hasConsent ? localStorage : sessionStorage;
        const saved = storage.getItem(ACCESSIBILITY_KEY);
        if (saved) {
            const settings = JSON.parse(saved);
            
            // Update controls
            for (const [key, control] of Object.entries(accessibilityControls)) {
                if (control instanceof HTMLElement) {
                    if (control.type === "checkbox") {
                        control.checked = settings[key] || false;
                    } else if (control.type === "range") {
                        control.value = settings[key] || control.value;
                    } else if (control.tagName === "SELECT") {
                        control.value = settings[key] || "default";
                    }
                }
            }

            // Update displays
            updateRangeDisplay(accessibilityControls.fontSize, rangeDisplays.fontSize);
            updateRangeDisplay(accessibilityControls.lineHeight, rangeDisplays.lineHeight);
            updateRangeDisplay(accessibilityControls.letterSpacing, rangeDisplays.letterSpacing);
            updateRangeDisplay(accessibilityControls.wordSpacing, rangeDisplays.wordSpacing);
            updateRangeDisplay(accessibilityControls.brightness, rangeDisplays.brightness);

            // Restore coloring mode (radio group)
            if (settings.coloringMode) {
                const radio = document.querySelector(`input[name="coloring-mode"][value="${settings.coloringMode}"]`);
                if (radio) radio.checked = true;
            }

            // Appliquer et initialiser les variables CSS
            applyAccessibilitySettings();
        }
    }

    function saveAccessibilitySettings() {
        const storage = hasConsent ? localStorage : sessionStorage;
        const settings = {};
        for (const [key, control] of Object.entries(accessibilityControls)) {
            if (control instanceof HTMLElement) {
                if (control.type === "checkbox") {
                    settings[key] = control.checked;
                } else {
                    settings[key] = control.value;
                }
            }
        }

        // Save coloring mode separately (radio group)
        const coloringMode = document.querySelector('input[name="coloring-mode"]:checked');
        if (coloringMode) {
            settings.coloringMode = coloringMode.value;
        }

        storage.setItem(ACCESSIBILITY_KEY, JSON.stringify(settings));
    }

    function clearAccessibilitySettingsStorage() {
        localStorage.removeItem(ACCESSIBILITY_KEY);
        sessionStorage.removeItem(ACCESSIBILITY_KEY);
    }

    function resetAccessibilitySettings() {
        const root = document.documentElement;

        // Reset all controls to defaults
        accessibilityControls.fontFamily.value = "default";
        accessibilityControls.fontSize.value = 0;
        accessibilityControls.lineHeight.value = 0;
        accessibilityControls.letterSpacing.value = 0;
        accessibilityControls.wordSpacing.value = 0;
        accessibilityControls.brightness.value = 0;
        
        Object.values(accessibilityControls).forEach(control => {
            if (control.type === "checkbox") {
                control.checked = false;
            }
        });

        // Reset coloring mode to "none"
        const noneRadio = document.querySelector('input[name="coloring-mode"][value="none"]');
        if (noneRadio) noneRadio.checked = true;

        // Force reset des variables CSS personnalisées
        root.style.setProperty('--accessibility-font-size', 1);
        root.style.setProperty('--accessibility-line-height', 1);
        root.style.setProperty('--accessibility-letter-spacing', '0px');
        root.style.setProperty('--accessibility-word-spacing', '0px');

        // Update displays
        updateRangeDisplay(accessibilityControls.fontSize, rangeDisplays.fontSize);
        updateRangeDisplay(accessibilityControls.lineHeight, rangeDisplays.lineHeight);
        updateRangeDisplay(accessibilityControls.letterSpacing, rangeDisplays.letterSpacing);
        updateRangeDisplay(accessibilityControls.wordSpacing, rangeDisplays.wordSpacing);
        updateRangeDisplay(accessibilityControls.brightness, rangeDisplays.brightness);

        applyAccessibilitySettings();
        clearAccessibilitySettingsStorage();
    }

    // Event listeners
    accessibilityBtn.addEventListener("click", () => {
        accessibilityModal.hidden = false;
        accessibilityModal.focus();
    });

    closeAccessibilityBtn.addEventListener("click", () => {
        accessibilityModal.hidden = true;
    });

    resetAccessibilityBtn.addEventListener("click", () => {
        resetAccessibilitySettings();
    });

    // Range value updates - applique IMMÉDIATEMENT et sauvegarde
    ["fontSize", "lineHeight", "letterSpacing", "wordSpacing", "brightness"].forEach(key => {
        accessibilityControls[key].addEventListener("input", (e) => {
            updateRangeDisplay(e.target, rangeDisplays[key]);
            applyAccessibilitySettings();
            saveAccessibilitySettings();  // Sauvegarde automatique
        });
    });

    // Range buttons
    Object.entries(rangeButtons).forEach(([key, button]) => {
        button.addEventListener("click", () => {
            let control = null;
            let increment = 1;

            if (key.includes("fontSize")) {
                control = accessibilityControls.fontSize;
                increment = 1;
            } else if (key.includes("lineHeight")) {
                control = accessibilityControls.lineHeight;
                increment = 1;
            } else if (key.includes("letterSpacing")) {
                control = accessibilityControls.letterSpacing;
                increment = 1;
            } else if (key.includes("wordSpacing")) {
                control = accessibilityControls.wordSpacing;
                increment = 1;
            } else if (key.includes("brightness")) {
                control = accessibilityControls.brightness;
                increment = 1;
            }

            if (control) {
                const currentValue = parseInt(control.value);
                const isMinus = key.includes("Minus");
                const newValue = isMinus ? currentValue - increment : currentValue + increment;
                
                control.value = Math.max(parseInt(control.min), Math.min(parseInt(control.max), newValue));
                control.dispatchEvent(new Event("input"));  // Déclenche l'event input pour l'application/sauvegarde
            }
        });
    });

    // Other control changes - applique IMMÉDIATEMENT et sauvegarde
    ["fontFamily", "monochrome", "readingMask", "highlightLinks", "silentLetters"].forEach(key => {
        accessibilityControls[key].addEventListener("change", () => {
            applyAccessibilitySettings();
            saveAccessibilitySettings();  // Sauvegarde automatique
        });
    });

    // Radio group for coloring mode
    document.querySelectorAll('input[name="coloring-mode"]').forEach(radio => {
        radio.addEventListener("change", () => {
            applyAccessibilitySettings();
            saveAccessibilitySettings();
        });
    });

    // Close modal on backdrop click
    accessibilityModal.addEventListener("click", (e) => {
        if (e.target === accessibilityModal) {
            accessibilityModal.hidden = true;
        }
    });

    // Prépare un contenu de base avant le premier chargement de document
    originalMarkdownContent = renderArea.innerHTML;
    applyAccessibilitySettings();

    if (window.lucide) {
        lucide.createIcons();
    }

    initializeApp();
});
