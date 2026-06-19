(function () {
  "use strict";
  const { React, MUI } = window.SCRUM_UI;
  const { useState, useEffect, useCallback, useRef } = React;

  function toast(msg) {
    if (window.SCRUM?.UI?.toast) window.SCRUM.UI.toast(msg);
  }

  function normalizeBoardData(data) {
    if (!data || !data.columns) return data;
    var inProgress = data.columns.find(function (c) { return c.columnKey === "in_progress"; });
    if (!inProgress) return data;
    var pending = data.columns.find(function (c) { return c.columnKey === "pending"; });
    var fallbackId = pending ? pending.id : null;
    var columns = data.columns.filter(function (c) { return c.columnKey !== "in_progress"; });
    var tasks = fallbackId
      ? data.tasks.map(function (t) {
        return t.columnId === inProgress.id ? Object.assign({}, t, { columnId: fallbackId }) : t;
      })
      : data.tasks;
    return { board: data.board, columns: columns, tasks: tasks };
  }

  window.SCRUM = window.SCRUM || {};
  window.SCRUM.useScrumBoard = function useScrumBoard() {
    const [loggedIn, setLoggedIn] = useState(window.SCRUM.Auth.isLoggedIn());
    const [boards, setBoards] = useState([]);
    const [boardId, setBoardId] = useState("");
    const [boardData, setBoardData] = useState(null);
    const [loadingBoards, setLoadingBoards] = useState(false);
    const [loadingBoard, setLoadingBoard] = useState(false);
    const [error, setError] = useState("");
    const [selectedTask, setSelectedTask] = useState(null);
    const [taskLoading, setTaskLoading] = useState(false);
    const [newBoardOpen, setNewBoardOpen] = useState(false);
    const dragTaskId = useRef(null);

    useEffect(function () {
      function onAuth() { setLoggedIn(window.SCRUM.Auth.isLoggedIn()); }
      window.addEventListener(window.SCRUM.Auth.EVENT || "isa:session", onAuth);
      return function () { window.removeEventListener(window.SCRUM.Auth.EVENT || "isa:session", onAuth); };
    }, []);

    const loadBoards = useCallback(async function () {
      if (!window.SCRUM.Auth.isLoggedIn()) return;
      setLoadingBoards(true);
      setError("");
      try {
        const data = await window.SCRUM.Api.listBoards();
        const list = data.boards || [];
        setBoards(list);
        if (!boardId && list.length) setBoardId(list[0].id);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoadingBoards(false);
      }
    }, [boardId]);

    const loadBoard = useCallback(async function (id) {
      if (!id || !window.SCRUM.Auth.isLoggedIn()) return;
      setLoadingBoard(true);
      setError("");
      try {
        const data = await window.SCRUM.Api.getBoard(id);
        setBoardData(normalizeBoardData({ board: data.board, columns: data.columns, tasks: data.tasks }));
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        setBoardData(null);
      } finally {
        setLoadingBoard(false);
      }
    }, []);

    useEffect(function () { if (loggedIn) loadBoards(); }, [loggedIn, loadBoards]);
    useEffect(function () { if (loggedIn && boardId) loadBoard(boardId); }, [loggedIn, boardId, loadBoard]);

    async function onCreateBoard(title, description) {
      const data = await window.SCRUM.Api.createBoard({ title: title, description: description || undefined });
      await loadBoards();
      if (data.board && data.board.id) setBoardId(data.board.id);
      toast("Tablero creado");
      setNewBoardOpen(false);
    }

    async function onQuickAddTask(columnId, title) {
      if (!boardId || !title.trim()) return;
      await window.SCRUM.Api.createTask(boardId, { columnId: columnId, title: title.trim() });
      await loadBoard(boardId);
      toast("Tarea creada");
    }

    async function openTask(taskId) {
      setTaskLoading(true);
      try {
        const data = await window.SCRUM.Api.getTask(taskId);
        setSelectedTask(data.task);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setTaskLoading(false);
      }
    }

    async function saveTask(patch) {
      if (!selectedTask) return;
      const data = await window.SCRUM.Api.updateTask(selectedTask.id, patch);
      setSelectedTask(data.task);
      if (boardId) await loadBoard(boardId);
      toast("Tarea actualizada");
    }

    async function addSubtask(title) {
      if (!selectedTask || !boardId || !title.trim()) return;
      await window.SCRUM.Api.createTask(boardId, {
        columnId: selectedTask.columnId,
        title: title.trim(),
        parentTaskId: selectedTask.id,
      });
      const data = await window.SCRUM.Api.getTask(selectedTask.id);
      setSelectedTask(data.task);
      await loadBoard(boardId);
      toast("Subtarea creada");
    }

    async function addMilestone(title, dueDate) {
      if (!selectedTask || !title.trim()) return;
      await window.SCRUM.Api.createMilestone(selectedTask.id, { title: title.trim(), dueDate: dueDate });
      const data = await window.SCRUM.Api.getTask(selectedTask.id);
      setSelectedTask(data.task);
      toast("Hito añadido");
    }

    async function toggleMilestone(milestoneId, completed) {
      await window.SCRUM.Api.updateMilestone(milestoneId, { completed: completed });
      if (selectedTask) {
        const data = await window.SCRUM.Api.getTask(selectedTask.id);
        setSelectedTask(data.task);
      }
    }

    async function postComment(body) {
      if (!selectedTask || !body.trim()) return;
      await window.SCRUM.Api.addComment(selectedTask.id, body.trim());
      const data = await window.SCRUM.Api.getTask(selectedTask.id);
      setSelectedTask(data.task);
      toast("Comentario registrado");
    }

    async function onDropColumn(columnId) {
      const taskId = dragTaskId.current;
      dragTaskId.current = null;
      if (!taskId || !boardId) return;
      const task = boardData && boardData.tasks.find(function (t) { return t.id === taskId; });
      if (!task || task.columnId === columnId) return;
      await window.SCRUM.Api.updateTask(taskId, { columnId: columnId });
      await loadBoard(boardId);
    }

    return {
      loggedIn,
      boards,
      boardId,
      setBoardId,
      boardData,
      loadingBoards,
      loadingBoard,
      error,
      selectedTask,
      taskLoading,
      newBoardOpen,
      setNewBoardOpen,
      onCreateBoard,
      onQuickAddTask,
      openTask,
      closeTask: function () { setSelectedTask(null); },
      saveTask,
      addSubtask,
      addMilestone,
      toggleMilestone,
      postComment,
      onDragStart: function (id) { dragTaskId.current = id; },
      onDropColumn,
      reload: function () { if (boardId) loadBoard(boardId); },
    };
  };
})();
