import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import SaveIcon from "@mui/icons-material/Save";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getAdminCatalogs } from "../services/admin.service";
import { getUsers, saveUser, toggleUser } from "../services/user.service";

const emptyUser = { email: "", password: "Usuario123*", firstName: "", lastName: "", area: "", position: "", roleId: "", moduleIds: [], active: true };

export function Users() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const [viewing, setViewing] = useState<any | null>(null);
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: getUsers });
  const { data: catalogs } = useQuery({ queryKey: ["admin-catalogs"], queryFn: getAdminCatalogs });
  const activeModules = useMemo(() => catalogs?.modules?.filter((item: any) => item.enabled) ?? [], [catalogs]);
  const mutation = useMutation({
    mutationFn: saveUser,
    onSuccess: () => {
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    }
  });
  const toggleMutation = useMutation({
    mutationFn: toggleUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] })
  });

  function editUser(user: any) {
    setEditing({
      ...user,
      password: "",
      roleId: user.roleId,
      moduleIds: user.modules?.map((item: any) => item.moduleId) ?? []
    });
  }

  function updateField(key: string, value: any) {
    setEditing((current: any) => ({ ...current, [key]: value }));
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h4" fontWeight={800}>Usuarios</Typography>
          <Typography color="text.secondary">Crea usuarios, asigna roles, area, cargo y modulos habilitados.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setEditing(emptyUser)}>Nuevo usuario</Button>
      </Stack>
      <Paper variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Correo</TableCell>
              <TableCell>Area</TableCell>
              <TableCell>Cargo</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user: any) => (
              <TableRow key={user.id} hover>
                <TableCell sx={{ fontWeight: 700 }}>{user.firstName} {user.lastName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.area}</TableCell>
                <TableCell>{user.position}</TableCell>
                <TableCell>{user.role?.name}</TableCell>
                <TableCell><Chip label={user.active ? "Activo" : "Deshabilitado"} color={user.active ? "success" : "default"} size="small" /></TableCell>
                <TableCell align="right">
                  <Tooltip title="Ver"><IconButton onClick={() => setViewing(user)}><VisibilityIcon /></IconButton></Tooltip>
                  <Tooltip title="Editar"><IconButton onClick={() => editUser(user)}><EditIcon /></IconButton></Tooltip>
                  <Tooltip title={user.active ? "Deshabilitar" : "Habilitar"}><IconButton onClick={() => toggleMutation.mutate(user.id)}><PowerSettingsNewIcon /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={!!editing} onClose={() => setEditing(null)} maxWidth="md" fullWidth>
        <DialogTitle>{editing?.id ? "Editar usuario" : "Crear usuario"}</DialogTitle>
        <DialogContent sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, pt: 2 }}>
          <TextField label="Nombres" value={editing?.firstName ?? ""} onChange={(e) => updateField("firstName", e.target.value)} />
          <TextField label="Apellidos" value={editing?.lastName ?? ""} onChange={(e) => updateField("lastName", e.target.value)} />
          <TextField label="Correo" value={editing?.email ?? ""} onChange={(e) => updateField("email", e.target.value)} />
          <TextField label={editing?.id ? "Nueva contrasena opcional" : "Contrasena"} type="password" value={editing?.password ?? ""} onChange={(e) => updateField("password", e.target.value)} />
          <TextField label="Area" value={editing?.area ?? ""} onChange={(e) => updateField("area", e.target.value)} />
          <TextField label="Cargo" value={editing?.position ?? ""} onChange={(e) => updateField("position", e.target.value)} />
          <TextField select label="Rol" value={editing?.roleId ?? ""} onChange={(e) => updateField("roleId", e.target.value)}>
            {(catalogs?.roles ?? []).map((role: any) => <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>)}
          </TextField>
          <TextField select label="Estado" value={String(editing?.active ?? true)} onChange={(e) => updateField("active", e.target.value === "true")}>
            <MenuItem value="true">Activo</MenuItem>
            <MenuItem value="false">Deshabilitado</MenuItem>
          </TextField>
          <TextField select label="Modulos asignados" value={editing?.moduleIds ?? []} onChange={(e) => updateField("moduleIds", typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value)} SelectProps={{ multiple: true }} sx={{ gridColumn: { md: "1 / span 2" } }}>
            {activeModules.map((module: any) => <MenuItem key={module.id} value={module.id}>{module.name}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(null)}>Cancelar</Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={() => mutation.mutate(editing)} disabled={!editing?.email || !editing?.roleId}>Guardar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!viewing} onClose={() => setViewing(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Detalle de usuario</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5}>
            <Typography fontWeight={800}>{viewing?.firstName} {viewing?.lastName}</Typography>
            <Typography>{viewing?.email}</Typography>
            <Typography color="text.secondary">{viewing?.area} · {viewing?.position} · {viewing?.role?.name}</Typography>
            <Stack direction="row" gap={1} flexWrap="wrap">
              {viewing?.modules?.map((item: any) => <Chip key={item.moduleId} label={item.module.name} size="small" />)}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions><Button onClick={() => setViewing(null)}>Cerrar</Button></DialogActions>
      </Dialog>
    </Stack>
  );
}
