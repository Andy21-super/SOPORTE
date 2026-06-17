import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import SaveIcon from "@mui/icons-material/Save";
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Paper, Stack, Tab, Table, TableBody, TableCell, TableHead, TableRow, Tabs, TextField, Tooltip, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getAdminCatalogs, saveCategory, saveModule, savePriority, saveStatus } from "../services/admin.service";

type CatalogType = "modules" | "categories" | "priorities" | "statuses";

const labels: Record<CatalogType, string> = {
  modules: "Modulos",
  categories: "Categorias",
  priorities: "Prioridades",
  statuses: "Estados"
};

const saveByType = {
  modules: saveModule,
  categories: saveCategory,
  priorities: savePriority,
  statuses: saveStatus
};

export function Modules() {
  const queryClient = useQueryClient();
  const [type, setType] = useState<CatalogType>("modules");
  const [editing, setEditing] = useState<any | null>(null);
  const { data } = useQuery({ queryKey: ["admin-catalogs"], queryFn: getAdminCatalogs });
  const rows = useMemo(() => data?.[type] ?? [], [data, type]);
  const mutation = useMutation({
    mutationFn: (input: any) => saveByType[type](input),
    onSuccess: () => {
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ["admin-catalogs"] });
      queryClient.invalidateQueries({ queryKey: ["catalogs"] });
    }
  });

  function openNew() {
    setEditing({ name: "", color: type === "priorities" ? "#ef6c00" : "#1976d2", slaHours: 24, enabled: true });
  }

  function toggle(row: any) {
    mutation.mutate({ ...row, enabled: !row.enabled });
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h4" fontWeight={800}>Gestion de catalogos</Typography>
          <Typography color="text.secondary">Administra modulos, categorias, prioridades, colores y SLA.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openNew}>Nuevo</Button>
      </Stack>
      <Paper variant="outlined">
        <Tabs value={type} onChange={(_, value) => setType(value)} sx={{ px: 2, borderBottom: "1px solid #e5e7eb" }}>
          {(Object.keys(labels) as CatalogType[]).map((key) => <Tab key={key} value={key} label={labels[key]} />)}
        </Tabs>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              {(type === "priorities" || type === "statuses") && <TableCell>Color</TableCell>}
              {type === "priorities" && <TableCell>SLA</TableCell>}
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row: any) => (
              <TableRow key={row.id} hover>
                <TableCell sx={{ fontWeight: 700 }}>{row.name}</TableCell>
                {(type === "priorities" || type === "statuses") && <TableCell><Chip label={row.color} size="small" sx={{ bgcolor: row.color, color: "#fff" }} /></TableCell>}
                {type === "priorities" && <TableCell>{row.slaHours} h</TableCell>}
                <TableCell><Chip label={row.enabled ? "Habilitado" : "Deshabilitado"} color={row.enabled ? "success" : "default"} size="small" /></TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar"><IconButton onClick={() => setEditing(row)}><EditIcon /></IconButton></Tooltip>
                  <Tooltip title={row.enabled ? "Deshabilitar" : "Habilitar"}><IconButton onClick={() => toggle(row)}><PowerSettingsNewIcon /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Dialog open={!!editing} onClose={() => setEditing(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing?.id ? "Editar" : "Crear"} {labels[type]}</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2, pt: 2 }}>
          <TextField label="Nombre" value={editing?.name ?? ""} onChange={(event) => setEditing({ ...editing, name: event.target.value })} />
          {type === "priorities" && <TextField label="SLA en horas" type="number" value={editing?.slaHours ?? 24} onChange={(event) => setEditing({ ...editing, slaHours: Number(event.target.value) })} />}
          {(type === "priorities" || type === "statuses") && <TextField label="Color" type="color" value={editing?.color ?? "#1976d2"} onChange={(event) => setEditing({ ...editing, color: event.target.value })} />}
          <TextField select label="Estado" value={editing?.enabled ?? true} onChange={(event) => setEditing({ ...editing, enabled: event.target.value === "true" })}>
            <MenuItem value="true">Habilitado</MenuItem>
            <MenuItem value="false">Deshabilitado</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(null)}>Cancelar</Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={() => mutation.mutate(editing)} disabled={!editing?.name}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
