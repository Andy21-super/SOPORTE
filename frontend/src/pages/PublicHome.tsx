import { zodResolver } from "@hookform/resolvers/zod";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import DownloadDoneIcon from "@mui/icons-material/DownloadDone";
import SendIcon from "@mui/icons-material/Send";
import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import jsPDF from "jspdf";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { projectAreas } from "../constants/publicCatalogs";
import { createPublicTicket, getPublicBootstrap, getPublicTicketsByIp } from "../services/ticket.service";
import { formatDate } from "../utils/format";

const schema = z.object({
  firstName: z.string().min(2, "Ingrese nombres validos"),
  lastName: z.string().min(2, "Ingrese apellidos validos"),
  dni: z.string().regex(/^\d{8,12}$/, "Solo numeros, entre 8 y 12 digitos"),
  email: z.string().email("Correo invalido"),
  project: z.string().min(1, "Seleccione un proyecto"),
  area: z.string().min(1, "Seleccione un area"),
  priorityId: z.string().optional(),
  description: z.string().min(20, "Describa la solicitud con al menos 20 caracteres")
});

type FormValues = z.infer<typeof schema>;

function settingsMap(settings?: Array<{ key: string; value: string }>) {
  return Object.fromEntries((settings ?? []).map((item) => [item.key, item.value]));
}

async function imageToDataUrl(url: string) {
  const response = await fetch(url);
  const blob = await response.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function downloadTicketPdf(ticket: any, companyName: string, logoUrl?: string) {
  const doc = new jsPDF();
  doc.setFillColor(18, 53, 91);
  doc.rect(0, 0, 210, 28, "F");
  if (logoUrl) {
    try {
      const logoData = await imageToDataUrl(logoUrl);
      doc.addImage(logoData, logoUrl.toLowerCase().includes(".png") ? "PNG" : "JPEG", 16, 5, 18, 18);
    } catch {
      // El PDF sigue siendo valido aunque el navegador bloquee la imagen.
    }
  }
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text(companyName || "CAMPAMENTOS DIOSES", logoUrl ? 40 : 18, 17);
  doc.setTextColor(18, 53, 91);
  doc.setFontSize(15);
  doc.text("CONSTANCIA DE REGISTRO DE TICKET", 18, 46);
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(11);
  const rows = [
    ["Codigo Ticket", ticket.number],
    ["Fecha", formatDate(ticket.createdAt)],
    ["Nombre completo", `${ticket.requester.firstName} ${ticket.requester.lastName}`],
    ["DNI", ticket.position.replace("DNI ", "")],
    ["Correo", ticket.requester.email],
    ["Proyecto / Area", ticket.area],
    ["Prioridad", ticket.priority.name],
    ["Estado", ticket.status.name]
  ];
  let y = 62;
  rows.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 18, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(value), 62, y);
    y += 9;
  });
  doc.setFont("helvetica", "bold");
  doc.text("Descripcion:", 18, y + 4);
  doc.setFont("helvetica", "normal");
  doc.text(doc.splitTextToSize(ticket.description, 172), 18, y + 13);
  doc.setTextColor(90, 90, 90);
  doc.setFontSize(10);
  doc.text("Su solicitud ha sido registrada y sera atendida por el area correspondiente.", 18, 282);
  doc.save(`${ticket.number}.pdf`);
}

export function PublicHome() {
  const queryClient = useQueryClient();
  const { data: bootstrap } = useQuery({ queryKey: ["public-bootstrap"], queryFn: getPublicBootstrap });
  const { data: tickets, isLoading } = useQuery({ queryKey: ["public-tickets-ip"], queryFn: getPublicTicketsByIp, refetchInterval: 20000 });
  const settings = settingsMap(bootstrap?.settings);
  const companyName = settings.company_name ?? "CAMPAMENTOS DIOSES";
  const logoUrl = settings.logo_url;
  const subtitle = settings.public_subtitle ?? "Mesa de ayuda para operaciones, construccion y montaje metalico";
  const backgroundUrl = settings.public_background_url ?? "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1800&q=80";
  const mutation = useMutation({
    mutationFn: createPublicTicket,
    onSuccess: async (ticket) => {
      await downloadTicketPdf(ticket, companyName, logoUrl);
      queryClient.invalidateQueries({ queryKey: ["public-tickets-ip"] });
      reset();
    }
  });
  const { control, register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: "", lastName: "", dni: "", email: "", project: "", area: "", priorityId: "", description: "" }
  });
  const selectedProject = watch("project");
  const availableAreas = selectedProject ? (projectAreas[selectedProject] ?? []) : [];
  const projects = Object.keys(projectAreas);

  function submitTicket(values: FormValues) {
    const { project, area, ...rest } = values;
    mutation.mutate({ ...rest, area: `${project} - ${area}` });
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#0f172a",
        backgroundImage: `linear-gradient(120deg, rgba(15,23,42,.94), rgba(17,24,39,.72)), url('${backgroundUrl}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "white"
      }}
    >
      <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, md: 4 }, py: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            {logoUrl ? (
              <Box
                sx={{
                  width: { xs: 104, sm: 132 },
                  height: { xs: 104, sm: 132 },
                  borderRadius: "50%",
                  bgcolor: "rgba(255,255,255,.96)",
                  border: "3px solid rgba(245,158,11,.95)",
                  boxShadow: "0 18px 40px rgba(0,0,0,.35), inset 0 0 0 6px rgba(18,53,91,.08)",
                  display: "grid",
                  placeItems: "center",
                  overflow: "hidden",
                  flex: "0 0 auto"
                }}
              >
                <Box
                  component="img"
                  src={logoUrl}
                  alt={companyName}
                  sx={{
                    width: "84%",
                    height: "84%",
                    objectFit: "contain",
                    filter: "drop-shadow(0 8px 12px rgba(0,0,0,.18))"
                  }}
                />
              </Box>
            ) : null}
            <Box>
              <Typography variant="h5" fontWeight={900}>{companyName}</Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,.72)" }}>{subtitle}</Typography>
            </Box>
          </Stack>
          <Button component={Link} to="/login" variant="contained" startIcon={<AdminPanelSettingsIcon />} sx={{ bgcolor: "#f59e0b", color: "#111827", fontWeight: 800 }}>
            Login admin
          </Button>
        </Stack>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1.05fr .95fr" }, gap: 3, alignItems: "start" }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h3" fontWeight={900} sx={{ maxWidth: 760 }}>Panel publico de soporte TI</Typography>
              <Typography sx={{ color: "rgba(255,255,255,.78)", maxWidth: 760, mt: 1 }}>
                Registre incidencias, solicitudes de acceso, equipos, sistemas o conectividad. Sus tickets creados desde este computador aparecen aqui automaticamente.
              </Typography>
            </Box>

            <Paper sx={{ p: 2.5, bgcolor: "rgba(255,255,255,.94)", borderRadius: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={900} color="text.primary">Mis tickets de este equipo</Typography>
                <Chip label={`${tickets?.length ?? 0} registrados`} color="primary" size="small" />
              </Stack>
              <Stack spacing={1.2}>
                {isLoading && <Typography color="text.secondary">Cargando tickets...</Typography>}
                {!isLoading && (tickets ?? []).length === 0 && <Typography color="text.secondary">Aun no hay tickets registrados desde esta IP.</Typography>}
                {(tickets ?? []).map((ticket) => (
                  <Box
                    key={ticket.id}
                    component={Link}
                    to={`/ticket/${ticket.id}`}
                    sx={{
                      p: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1.5,
                      display: "block",
                      textDecoration: "none",
                      color: "inherit",
                      transition: "border-color .2s, transform .2s",
                      "&:hover": { borderColor: "primary.main", transform: "translateY(-1px)" }
                    }}
                  >
                    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
                      <Box>
                        <Typography fontWeight={900} color="text.primary">{ticket.number}</Typography>
                        <Typography variant="body2" color="text.secondary">{ticket.subject}</Typography>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        {ticket.comments?.length > 0 && (
                          <Chip
                            icon={<ChatBubbleOutlineIcon />}
                            label={ticket.comments[ticket.comments.length - 1]?.user?.id !== ticket.requester.id ? "Mensaje reciente" : `${ticket.comments.length} mensajes`}
                            color={ticket.comments[ticket.comments.length - 1]?.user?.id !== ticket.requester.id ? "warning" : "default"}
                            size="small"
                          />
                        )}
                        <Chip label={ticket.status.name} size="small" sx={{ bgcolor: ticket.status.color, color: "white" }} />
                        <Chip label={ticket.priority.name} size="small" variant="outlined" />
                      </Stack>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">{formatDate(ticket.createdAt)}</Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Stack>

          <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
            <Stack component="form" spacing={2} onSubmit={handleSubmit(submitTicket)}>
              <Typography variant="h5" fontWeight={900}>Crear ticket</Typography>
              {mutation.isSuccess && <Alert icon={<DownloadDoneIcon />} severity="success">Su ticket ha sido registrado correctamente. El PDF se descargo automaticamente.</Alert>}
              {mutation.isError && <Alert severity="error">No se pudo registrar el ticket. Revise los datos.</Alert>}
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                <TextField label="Nombres" {...register("firstName")} error={!!errors.firstName} helperText={errors.firstName?.message} />
                <TextField label="Apellidos" {...register("lastName")} error={!!errors.lastName} helperText={errors.lastName?.message} />
                <TextField label="DNI" {...register("dni")} error={!!errors.dni} helperText={errors.dni?.message} />
                <TextField label="Correo electronico" {...register("email")} error={!!errors.email} helperText={errors.email?.message} />
              </Box>
              <Controller name="project" control={control} render={({ field }) => (
                <TextField select label="Proyecto" {...field} error={!!errors.project} helperText={errors.project?.message} onChange={(event) => {
                  field.onChange(event);
                  setValue("area", "");
                }}>
                  {projects.map((project) => <MenuItem key={project} value={project}>{project}</MenuItem>)}
                </TextField>
              )} />
              <Controller name="area" control={control} render={({ field }) => (
                <TextField select label="Áreas" {...field} error={!!errors.area} helperText={errors.area?.message} disabled={!selectedProject}>
                  {availableAreas.map((area) => <MenuItem key={area} value={area}>{area}</MenuItem>)}
                </TextField>
              )} />
              <Controller name="priorityId" control={control} render={({ field }) => (
                <TextField select label="Prioridad" {...field}>
                  <MenuItem value="">Media por defecto</MenuItem>
                  {(bootstrap?.priorities ?? []).map((priority) => <MenuItem key={priority.id} value={priority.id}>{priority.name}</MenuItem>)}
                </TextField>
              )} />
              <TextField label="Descripcion de la incidencia o solicitud TI" multiline minRows={5} {...register("description")} error={!!errors.description} helperText={errors.description?.message} />
              <Alert severity="info" icon={<ChatBubbleOutlineIcon />}>
                Despues de registrar, abra su ticket en "Mis tickets de este equipo" para chatear con el area de TI y ver las respuestas.
              </Alert>
              <Button type="submit" variant="contained" size="large" startIcon={<SendIcon />} disabled={mutation.isPending}>
                Registrar y descargar constancia
              </Button>
            </Stack>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
