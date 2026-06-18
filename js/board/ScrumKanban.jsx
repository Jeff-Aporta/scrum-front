(function () {
  "use strict";
  const { React, MUI, Icon } = window.SCRUM_UI;
  const { useState } = React;
  const { Box, Typography, TextField, Button, Stack } = MUI;

  function TaskCard({ task, onOpen, onDragStart }) {
    const subCount = (task.subtasks && task.subtasks.length) || 0;
    const msCount = (task.milestones && task.milestones.length) || 0;
    const openMs = (task.milestones || []).filter(function (m) { return !m.completedAt; }).length;

    return (
      <Box
        className="paty-todos-card"
        draggable
        onDragStart={function (e) {
          e.dataTransfer.setData("text/plain", task.id);
          onDragStart(task.id);
        }}
        onClick={function () { onOpen(task.id); }}
        role="button"
        tabIndex={0}
        onKeyDown={function (e) { if (e.key === "Enter") onOpen(task.id); }}
      >
        <div className="paty-todos-card__title">{task.title}</div>
        <div className="paty-todos-card__meta">
          {task.assignedTo ? (
            <span className="paty-todos-card__badge">
              <Icon icon="mdi:account-outline" size={12} />
              {task.assignedTo}
            </span>
          ) : null}
          {subCount ? (
            <span className="paty-todos-card__badge">
              <Icon icon="mdi:checkbox-multiple-marked-outline" size={12} />
              {subCount}
            </span>
          ) : null}
          {msCount ? (
            <span className="paty-todos-card__badge">
              <Icon icon="mdi:flag-outline" size={12} />
              {openMs}/{msCount}
            </span>
          ) : null}
        </div>
      </Box>
    );
  }

  function ColumnAddForm({ onAdd }) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");

    if (!open) {
      return (
        <Button
          fullWidth
          size="small"
          className="paty-todos-add-card"
          startIcon={<Icon icon="mdi:plus" size={16} />}
          onClick={function () { setOpen(true); }}
          sx={{ justifyContent: "flex-start", color: "text.secondary" }}
        >
          Añadir tarjeta
        </Button>
      );
    }

    return (
      <Box className="paty-todos-add-card">
        <TextField
          autoFocus
          fullWidth
          size="small"
          multiline
          minRows={2}
          placeholder="Título de la tarea…"
          value={title}
          onChange={function (e) { setTitle(e.target.value); }}
          onKeyDown={function (e) {
            if (e.key === "Enter" && !e.shiftKey && title.trim()) {
              e.preventDefault();
              onAdd(title.trim());
              setTitle("");
              setOpen(false);
            }
            if (e.key === "Escape") setOpen(false);
          }}
        />
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Button
            variant="contained"
            size="small"
            disabled={!title.trim()}
            onClick={function () {
              onAdd(title.trim());
              setTitle("");
              setOpen(false);
            }}
          >
            Añadir
          </Button>
          <Button size="small" onClick={function () { setOpen(false); setTitle(""); }}>Cancelar</Button>
        </Stack>
      </Box>
    );
  }

  window.SCRUM = window.SCRUM || {};
  window.SCRUM.ScrumKanban = function ScrumKanban(props) {
    const [dragOverCol, setDragOverCol] = useState(null);
    const boardData = props.boardData;
    if (!boardData) return null;

    const columns = boardData.columns;
    const tasks = boardData.tasks;

    return (
      <Box className="paty-todos-kanban">
        {columns.map(function (col) {
          const colTasks = tasks.filter(function (t) { return t.columnId === col.id; });
          const isOver = dragOverCol === col.id;
          return (
            <Box key={col.id} className="paty-todos-column">
              <Box className="paty-todos-column__head">
                <span>{col.title}</span>
                <span className="paty-todos-column__count">{colTasks.length}</span>
              </Box>
              <Box
                className={"paty-todos-column__list" + (isOver ? " paty-todos-column__list--drag-over" : "")}
                onDragOver={function (e) { e.preventDefault(); setDragOverCol(col.id); }}
                onDragLeave={function () { setDragOverCol(null); }}
                onDrop={function (e) {
                  e.preventDefault();
                  setDragOverCol(null);
                  props.onDropColumn(col.id);
                }}
              >
                {colTasks.map(function (task) {
                  return (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onOpen={props.onOpenTask}
                      onDragStart={props.onDragStart}
                    />
                  );
                })}
              </Box>
              {col.columnKey === "pending" ? (
                <ColumnAddForm onAdd={function (title) { props.onQuickAdd(col.id, title); }} />
              ) : null}
            </Box>
          );
        })}
      </Box>
    );
  };
})();
