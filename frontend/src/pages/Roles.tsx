import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { Box, Button, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, Paper, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getPermissions, getRoles, saveRole } from "../services/role.service";

export function Roles() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const { data: roles = [] } = useQuery({ queryKey: ["roles"], queryFn: getRoles });
  const { data: permissions = [] } = useQuery({ queryKey: ["permissions"], queryFn: getPermissions });
  const mutation = useMutation({
    mutationFn: saveRole,
    onSuccess: () => {
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["admin-catalogs"] });
    }
  });

  function openRole(role?: any) {
    setEditing(role ? {
      id: role.id,
      name: role.name,
      description: role.description ?? "",
      permissionIds: role.permissions.map((item: any) => item.permissionId)
    } : { name: "", description: "", permissionIds: [] });
  }

  function togglePermission(id: string) {
    const permissionIds = new Set(editing.permissionIds);
    permissionIds.has(id) ? permissionIds.delete(id) : permissionIds.add(id);
    setEditing({ ...editing, permissionIds: [...permissionIds] });
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h4" fontWeight={800}>Roles y permisos</Typography>
          <Typography color="text.secondary">Define perfiles de acceso y permisos operativos.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => openRole()}>Nuevo rol</Button>
      </Stack>
      {roles.map((role: any) => (
        <Paper key={role.id} variant="outlined" sx={{ p: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Stack direction="row" alignItems="center" gap={1}>
                <Typography fontWeight={800}>{role.name}</Typography>
                <Chip label={`${role.users?.length ?? 0} usuarios`} size="small" />
              </Stack>
              <Typography color="text.secondary">{role.description || "Sin descripcion"}</Typography>
            </Box>
            <Tooltip title="Editar rol"><IconButton onClick={() => openRole(role)}><EditIcon /></IconButton></Tooltip>
          </Stack>
          <Stack direction="row" flexWrap="wrap" gap={1} mt={2}>
            {role.permissions.map((item: any) => <Chip key={item.permissionId} label={item.permission.label} size="small" color="primary" variant="outlined" />)}
          </Stack>
        </Paper>
      ))}

      <Dialog open={!!editing} onClose={() => setEditing(null)} maxWidth="md" fullWidth>
        <DialogTitle>{editing?.id ? "Editar rol" : "Crear rol"}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
              <TextField label="Nombre" value={editing?.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              <TextField label="Descripcion" value={editing?.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </Box>
            <Typography fontWeight={800}>Permisos</Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1 }}>
              {permissions.map((permission: any) => (
                <FormControlLabel
                  key={permission.id}
                  control={<Checkbox checked={editing?.permissionIds?.includes(permission.id) ?? false} onChange={() => togglePermission(permission.id)} />}
                  label={permission.label}
                />
              ))}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(null)}>Cancelar</Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={() => mutation.mutate(editing)} disabled={!editing?.name}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
