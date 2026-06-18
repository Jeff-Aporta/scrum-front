(function () {
  "use strict";
  /** Scrum API — rutas /api/scrum/* vía gateway. */
  const APP_ID = "scrum-front";

  function qs(extra) {
    const params = new URLSearchParams(Object.assign({ app: APP_ID }, extra || {}));
    return "?" + params.toString();
  }

  async function api(path, init) {
    const res = await fetch(window.SCRUM.Config.apiUrl(path), Object.assign({}, init || {}, {
      headers: Object.assign(
        { "Content-Type": "application/json" },
        window.SCRUM.Auth.authHeader(),
        (init && init.headers) || {},
      ),
    }));
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || res.statusText);
    return data;
  }

  window.SCRUM = window.SCRUM || {};
  window.SCRUM.Api = {
    listBoards: function () { return api("/api/scrum/boards" + qs({ boardType: "scrum" })); },
    createBoard: function (payload) {
      return api("/api/scrum/boards" + qs(), { method: "POST", body: JSON.stringify(Object.assign({ boardType: "scrum" }, payload)) });
    },
    getBoard: function (id) { return api("/api/scrum/boards/" + id + qs()); },
    createTask: function (boardId, payload) {
      return api("/api/scrum/boards/" + boardId + "/tasks" + qs(), { method: "POST", body: JSON.stringify(payload) });
    },
    getTask: function (id) { return api("/api/scrum/tasks/" + id + qs()); },
    updateTask: function (id, patch) {
      return api("/api/scrum/tasks/" + id + qs(), { method: "PATCH", body: JSON.stringify(patch) });
    },
    createMilestone: function (taskId, payload) {
      return api("/api/scrum/tasks/" + taskId + "/milestones" + qs(), { method: "POST", body: JSON.stringify(payload) });
    },
    updateMilestone: function (id, patch) {
      return api("/api/scrum/milestones/" + id + qs(), { method: "PATCH", body: JSON.stringify(patch) });
    },
    addComment: function (taskId, body) {
      return api("/api/scrum/tasks/" + taskId + "/comments" + qs(), { method: "POST", body: JSON.stringify({ body: body }) });
    },
  };
})();
