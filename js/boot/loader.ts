(function () {
  "use strict";

  const FRONT_SHARED_REF = "0692ebf";
  const isLocalDev = /localhost|127\.0\.0\.1|\[::1\]/.test(location.hostname);
  const BOOT_HELPER = isLocalDev
    ? "../../components/front-shared/cdn/boot-helper.mjs"
    : "https://cdn.jsdelivr.net/gh/Jeff-Aporta/front-shared@" + FRONT_SHARED_REF + "/cdn/boot-helper.mjs?v=" + FRONT_SHARED_REF;

  const FILES = [
    "js/core/ui.jsx",
    "js/core/isa-setup.ts",
    "js/api/client.ts",
    "js/board/ScrumKanban.jsx",
    "js/board/ScrumShellParts.jsx",
    "js/board/NewBoardDialog.jsx",
    "js/board/TaskDetailDialog.jsx",
    "js/board/useScrumBoard.jsx",
    "css/scrum.css",
    "js/app/App.jsx",
  ];

  async function boot() {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = isLocalDev ? "css/scrum.css" : "css/scrum.css?v=" + Date.now();
    document.head.appendChild(link);

    const { bootApp } = await import(BOOT_HELPER);
    await bootApp({ files: FILES.filter(function (f) { return !f.endsWith(".css"); }), Babel: Babel });
  }

  function showErr(err) {
    const root = document.getElementById("root");
    const msg = err instanceof Error ? err.stack || err.message : String(err);
    if (root) root.innerHTML = '<pre style="color:#ff8a80;padding:24px;font-family:monospace">Error de arranque:\n' + msg + "</pre>";
    console.error(err);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { boot().catch(showErr); });
  else boot().catch(showErr);
})();
