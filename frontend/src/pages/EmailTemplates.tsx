import SaveIcon from "@mui/icons-material/Save";
import { Alert, Box, Button, List, ListItemButton, ListItemText, Paper, Stack, TextField, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getAdminCatalogs, saveEmailTemplate } from "../services/admin.service";

type Template = { id?: string; key: string; name: string; subject: string; html: string };

const emptyTemplate: Template = {
  key: "",
  name: "",
  subject: "",
  html: "<h2>{{ticketNumber}}</h2><p>{{message}}</p>"
};

export function EmailTemplates() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-catalogs"], queryFn: getAdminCatalogs });
  const templates: Template[] = data?.templates ?? [];
  const [selectedId, setSelectedId] = useState<string>("new");
  const [form, setForm] = useState<Template>(emptyTemplate);
  const mutation = useMutation({
    mutationFn: saveEmailTemplate,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-catalogs"] })
  });

  useEffect(() => {
    if (selectedId === "new") {
      setForm(emptyTemplate);
      return;
    }
    const selected = templates.find((item) => item.id === selectedId);
    if (selected) setForm(selected);
  }, [selectedId, data]);

  function setValue(key: keyof Template, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h4" fontWeight={800}>Plantillas de correo</Typography>
          <Typography color="text.secondary">Administra asuntos y contenido HTML para notificaciones automaticas.</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={mutation.isPending || !form.key || !form.name || !form.subject || !form.html}
          onClick={() => mutation.mutate(form)}
        >
          Guardar plantilla
        </Button>
      </Stack>
      {mutation.isSuccess && <Alert severity="success">Plantilla guardada correctamente</Alert>}
      {mutation.isError && <Alert severity="error">No se pudo guardar la plantilla</Alert>}

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "320px 1fr" }, gap: 2 }}>
        <Paper variant="outlined" sx={{ p: 1 }}>
          <List>
            <ListItemButton selected={selectedId === "new"} onClick={() => setSelectedId("new")} sx={{ borderRadius: 1 }}>
              <ListItemText primary="Nueva plantilla" secondary="Crear clave personalizada" />
            </ListItemButton>
            {templates.map((template) => (
              <ListItemButton key={template.id} selected={selectedId === template.id} onClick={() => setSelectedId(template.id ?? "new")} sx={{ borderRadius: 1 }}>
                <ListItemText primary={template.name || template.key} secondary={template.key} />
              </ListItemButton>
            ))}
          </List>
        </Paper>

        <Paper variant="outlined" sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
              <TextField label="Clave tecnica" value={form.key} onChange={(e) => setValue("key", e.target.value)} disabled={Boolean(form.id)} />
              <TextField label="Nombre visible" value={form.name} onChange={(e) => setValue("name", e.target.value)} />
            </Box>
            <TextField label="Asunto" value={form.subject} onChange={(e) => setValue("subject", e.target.value)} />
            <TextField label="HTML de la plantilla" value={form.html} onChange={(e) => setValue("html", e.target.value)} multiline minRows={12} />
            <Alert severity="info">
              Variables sugeridas: {"{{ticketNumber}}"}, {"{{requesterName}}"}, {"{{status}}"}, {"{{message}}"}, {"{{resetUrl}}"}.
            </Alert>
          </Stack>
        </Paper>
      </Box>
    </Stack>
  );
}
