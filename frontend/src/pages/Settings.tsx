import SaveIcon from "@mui/icons-material/Save";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { getAdminCatalogs, saveSettings, uploadLogo } from "../services/admin.service";

const defaults = {
  company_name: "Empresa",
  logo_url: "",
  smtp_host: "",
  smtp_port: "587",
  smtp_user: "",
  mail_from: "Soporte <soporte@empresa.com>",
  max_upload_mb: "10",
  theme_primary: "#12355b",
  theme_secondary: "#2f6f73",
  public_subtitle: "Mesa de ayuda para operaciones, construccion y montaje metalico",
  public_background_url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1800&q=80"
};

export function Settings() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-catalogs"], queryFn: getAdminCatalogs });
  const [settings, setSettings] = useState<Record<string, string>>(defaults);
  const mutation = useMutation({
    mutationFn: saveSettings,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-catalogs"] })
  });
  const logoMutation = useMutation({
    mutationFn: uploadLogo,
    onSuccess: (setting) => {
      setValue("logo_url", setting.value);
      queryClient.invalidateQueries({ queryKey: ["admin-catalogs"] });
      queryClient.invalidateQueries({ queryKey: ["public-bootstrap"] });
    }
  });

  const savedSettings = useMemo(() => Object.fromEntries((data?.settings ?? []).map((item: any) => [item.key, item.value])), [data]);

  useEffect(() => {
    setSettings({ ...defaults, ...savedSettings });
  }, [savedSettings]);

  function setValue(key: string, value: string) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h4" fontWeight={800}>Configuracion</Typography>
          <Typography color="text.secondary">Gestiona parametros generales, correo, marca, seguridad y carga de archivos.</Typography>
        </Box>
        <Button variant="contained" startIcon={<SaveIcon />} onClick={() => mutation.mutate(settings)}>Guardar</Button>
      </Stack>
      {mutation.isSuccess && <Alert severity="success">Configuracion actualizada</Alert>}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2 }}>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={800} mb={2}>Empresa</Typography>
          <Stack spacing={2}>
            <TextField label="Nombre de empresa" value={settings.company_name} onChange={(e) => setValue("company_name", e.target.value)} />
            <Button variant="outlined" component="label" startIcon={<UploadFileIcon />} disabled={logoMutation.isPending}>
              Seleccionar logo desde archivos
              <input
                hidden
                type="file"
                accept="image/png,image/jpeg"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) logoMutation.mutate(file);
                }}
              />
            </Button>
            {logoMutation.isError && <Alert severity="error">No se pudo cargar el logo. Use PNG o JPG.</Alert>}
            <TextField label="Subtitulo portal publico" value={settings.public_subtitle} onChange={(e) => setValue("public_subtitle", e.target.value)} />
            <TextField label="URL fondo construccion/montaje" value={settings.public_background_url} onChange={(e) => setValue("public_background_url", e.target.value)} />
            <TextField label="Color primario" type="color" value={settings.theme_primary} onChange={(e) => setValue("theme_primary", e.target.value)} />
            <TextField label="Color secundario" type="color" value={settings.theme_secondary} onChange={(e) => setValue("theme_secondary", e.target.value)} />
            <Box sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2, display: "flex", alignItems: "center", gap: 2 }}>
              {settings.logo_url ? (
                <Box component="img" src={settings.logo_url} alt="Logo" sx={{ width: 72, height: 72, objectFit: "contain" }} />
              ) : (
                <Box sx={{ width: 72, height: 72, bgcolor: "action.hover", borderRadius: 1 }} />
              )}
              <Box>
                <Typography fontWeight={900}>{settings.company_name}</Typography>
                <Typography variant="body2" color="text.secondary">{settings.public_subtitle}</Typography>
              </Box>
            </Box>
          </Stack>
        </Paper>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={800} mb={2}>Correo SMTP</Typography>
          <Stack spacing={2}>
            <TextField label="Servidor SMTP" value={settings.smtp_host} onChange={(e) => setValue("smtp_host", e.target.value)} />
            <TextField label="Puerto SMTP" value={settings.smtp_port} onChange={(e) => setValue("smtp_port", e.target.value)} />
            <TextField label="Usuario SMTP" value={settings.smtp_user} onChange={(e) => setValue("smtp_user", e.target.value)} />
            <TextField label="Remitente" value={settings.mail_from} onChange={(e) => setValue("mail_from", e.target.value)} />
          </Stack>
        </Paper>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={800} mb={2}>Operaciones</Typography>
          <Stack spacing={2}>
            <TextField label="Limite de adjuntos MB" type="number" value={settings.max_upload_mb} onChange={(e) => setValue("max_upload_mb", e.target.value)} />
            <TextField label="Dominio corporativo permitido" value={settings.allowed_domain ?? "empresa.com"} onChange={(e) => setValue("allowed_domain", e.target.value)} />
            <TextField label="Intentos fallidos antes de bloqueo" type="number" value={settings.max_failed_logins ?? "5"} onChange={(e) => setValue("max_failed_logins", e.target.value)} />
          </Stack>
        </Paper>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={800} mb={2}>Resumen SLA</Typography>
          <Stack spacing={1}>
            {(data?.priorities ?? []).map((priority: any) => (
              <Stack key={priority.id} direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 12, height: 12, bgcolor: priority.color, borderRadius: "50%" }} />
                  <Typography>{priority.name}</Typography>
                </Stack>
                <Typography fontWeight={800}>{priority.slaHours} h</Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>
      </Box>
    </Stack>
  );
}
