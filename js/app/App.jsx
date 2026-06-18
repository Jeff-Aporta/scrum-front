(function () {
  "use strict";
  const MUI = MaterialUI;
  const { Box, Alert, Typography, Button } = MUI;

  function App() {
    const Shell = window.ISAFront.Layout.AppShell;
    const board = window.SCRUM.useScrumBoard();
    const ScrumKanban = window.SCRUM.ScrumKanban;
    const TaskDetailDialog = window.SCRUM.TaskDetailDialog;
    const NewBoardDialog = window.SCRUM.NewBoardDialog;
    const ScrumToolbar = window.SCRUM.ScrumToolbar;
    const ScrumLoggedOutShell = window.SCRUM.ScrumLoggedOutShell;

    if (!board.loggedIn) {
      return (
        <Shell ns="SCRUM" loginGate>
          <ScrumLoggedOutShell />
        </Shell>
      );
    }

    const boardTitle = (board.boardData && board.boardData.board && board.boardData.board.title) || "";

    return (
      <Shell ns="SCRUM" loginGate toolbarExtra={<MUI.Button size="small" onClick={board.reload}>Recargar</MUI.Button>}>
        <Box className="paty-todos-shell">
          <ScrumToolbar
            boards={board.boards}
            boardId={board.boardId}
            boardTitle={boardTitle}
            loadingBoards={board.loadingBoards}
            loadingBoard={board.loadingBoard}
            onSelectBoard={function (id) { board.setBoardId(id); }}
            onNewBoard={function () { board.setNewBoardOpen(true); }}
            onRefresh={board.reload}
          />

          {board.error ? (
            <Alert severity="error" sx={{ m: 2 }}>{board.error}</Alert>
          ) : null}

          {!board.loadingBoards && !board.boards.length ? (
            <Box className="paty-todos-gate">
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                No hay tableros SCRUM. Crea el primero para empezar.
              </Typography>
              <Button variant="contained" onClick={function () { board.setNewBoardOpen(true); }}>Crear tablero</Button>
            </Box>
          ) : (
            <ScrumKanban
              boardData={board.boardData}
              onOpenTask={board.openTask}
              onQuickAdd={board.onQuickAddTask}
              onDragStart={board.onDragStart}
              onDropColumn={board.onDropColumn}
            />
          )}

          <NewBoardDialog
            open={board.newBoardOpen}
            onClose={function () { board.setNewBoardOpen(false); }}
            busy={false}
            onCreate={board.onCreateBoard}
          />

          <TaskDetailDialog
            open={!!board.selectedTask || board.taskLoading}
            task={board.selectedTask}
            loading={board.taskLoading}
            onClose={board.closeTask}
            onSave={board.saveTask}
            onAddSubtask={board.addSubtask}
            onAddMilestone={board.addMilestone}
            onToggleMilestone={board.toggleMilestone}
            onComment={board.postComment}
          />
        </Box>
      </Shell>
    );
  }

  window.SCRUM = window.SCRUM || {};
  window.SCRUM.mount = function () {
    const root = document.getElementById("root");
    if (!root) throw new Error("No se encontró #root");
    ReactDOM.createRoot(root).render(<App />);
  };
  window.SCRUM.mount();
})();
