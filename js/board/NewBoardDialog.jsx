(function () {
  "use strict";
  const { React, MUI, Icon } = window.SCRUM_UI;
  const { useState } = React;
  const { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack } = MUI;

  window.SCRUM = window.SCRUM || {};
  window.SCRUM.NewBoardDialog = function NewBoardDialog(props) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    function reset() {
      setTitle("");
      setDescription("");
    }

    function handleClose() {
      reset();
      props.onClose();
    }

    return (
      <Dialog open={props.open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Icon icon="mdi:view-column" size={22} />
          Nuevo tablero SCRUM
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField autoFocus label="Título" fullWidth size="small" value={title} onChange={function (e) { setTitle(e.target.value); }} />
            <TextField label="Descripción" fullWidth size="small" multiline minRows={2} value={description} onChange={function (e) { setDescription(e.target.value); }} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button
            variant="contained"
            disabled={props.busy || !title.trim()}
            onClick={async function () {
              await props.onCreate(title.trim(), description.trim());
              reset();
            }}
          >
            Crear
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
})();
