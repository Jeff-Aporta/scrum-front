(function () {
  "use strict";
  const { React, MUI, Icon } = window.SCRUM_UI;
  const { Box, Typography, Button, Alert, Stack, Select, MenuItem, FormControl, InputLabel, CircularProgress } = MUI;

  window.SCRUM = window.SCRUM || {};
  window.SCRUM.ScrumLoggedOutShell = function ScrumLoggedOutShell() {
    return (
      <Box className="paty-todos-shell">
        <Box className="paty-todos-gate">
          <Stack spacing={2} alignItems="center" sx={{ maxWidth: 420, p: 2 }}>
            <Icon icon="mdi:view-column" width="2.5em" height="2.5em" style={{ opacity: 0.7 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Scrum</Typography>
            <Alert severity="info" sx={{ width: "100%" }}>
              Inicia sesión para acceder al tablero Scrum.
            </Alert>
          </Stack>
        </Box>
      </Box>
    );
  };

  window.SCRUM.ScrumToolbar = function ScrumToolbar(props) {
    return (
      <Box className="paty-todos-toolbar">
        <Icon icon="mdi:view-column" size={22} />
        <span className="paty-todos-board-title">{props.boardTitle || "Tablero SCRUM"}</span>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="scrum-board-label">Tablero</InputLabel>
          <Select
            labelId="scrum-board-label"
            label="Tablero"
            value={props.boardId || ""}
            onChange={function (e) { props.onSelectBoard(e.target.value); }}
            disabled={props.loadingBoards || !props.boards.length}
          >
            {props.boards.map(function (b) {
              return <MenuItem key={b.id} value={b.id}>{b.title}</MenuItem>;
            })}
          </Select>
        </FormControl>
        <Button size="small" variant="outlined" startIcon={<Icon icon="mdi:plus" size={16} />} onClick={props.onNewBoard}>
          Nuevo
        </Button>
        <Button
          size="small"
          variant="text"
          onClick={props.onRefresh}
          disabled={props.loadingBoard || !props.boardId}
          startIcon={props.loadingBoard ? <CircularProgress size={14} /> : <Icon icon="mdi:refresh" size={16} />}
        >
          Actualizar
        </Button>
      </Box>
    );
  };
})();
