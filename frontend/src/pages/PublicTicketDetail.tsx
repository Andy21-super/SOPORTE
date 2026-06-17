import { zodResolver } from "@hookform/resolvers/zod";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ReplyIcon from "@mui/icons-material/Reply";
import { Alert, Box, Button, Checkbox, Chip, Divider, FormControlLabel, Paper, Stack, TextField, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, useParams } from "react-router-dom";
import { z } from "zod";
import { addPublicComment, getPublicBootstrap, getPublicTicket } from "../services/ticket.service";
import { formatDate } from "../utils/format";

const schema = z.object({
  message: z.string().min(2, "Ingrese una respuesta"),
  noSolucionado: z.boolean().optional()
});

type FormValues = z.infer<typeof schema>;

function settingsMap(settings?: Array<{ key: string; value: string }>) {
  return Object.fromEntries((settings ?? []).map((item) => [item.key, item.value]));
}

export function PublicTicketDetail() {
  const { id = "" } = useParams();
  const queryClient = useQueryClient();
  const { data: bootstrap } = useQuery({ queryKey: ["public-bootstrap"], queryFn: getPublicBootstrap });
  const settings = settingsMap(bootstrap?.settings);
  const companyName = settings.company_name ?? "Mesa de Ayuda TI";
  const logoUrl = settings.logo_url;
  const { data: ticket, isError } = useQuery({ queryKey: ["public-ticket", id], queryFn: () => getPublicTicket(id), enabled: !!id, refetchInterval: 20000 });
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { message: "", noSolucionado: false }
  });
  const mutation = useMutation({
    mutationFn: (values: FormValues) => addPublicComment(id, values),
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ["public-ticket", id] });
      queryClient.invalidateQueries({ queryKey: ["public-tickets-ip"] });
    }
  });

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f4f7fb", px: { xs: 2, md: 4 }, py: 3 }}>
      <Box sx={{ maxWidth: 980, mx: "auto" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            {logoUrl ? <Box component="img" src={logoUrl} alt={companyName} sx={{ width: 46, height: 46, objectFit: "contain" }} /> : null}
            <Typography variant="h5" fontWeight={900}>{companyName}</Typography>
          </Stack>
          <Button component={Link} to="/" startIcon={<ArrowBackIcon />}>Volver</Button>
        </Stack>

        {isError && <Alert severity="error">No se pudo abrir este ticket desde este equipo.</Alert>}
        {!ticket && !isError && <Typography>Cargando ticket...</Typography>}
        {ticket && (
          <Stack spacing={2}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}>
                <Box>
                  <Typography variant="h4" fontWeight={900}>{ticket.number}</Typography>
                  <Typography color="text.secondary">{formatDate(ticket.createdAt)}</Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Chip label={ticket.status.name} sx={{ bgcolor: ticket.status.color, color: "#fff" }} />
                  <Chip label={ticket.priority.name} sx={{ bgcolor: ticket.priority.color, color: "#fff" }} />
                </Stack>
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" fontWeight={900}>{ticket.subject}</Typography>
              <Typography color="text.secondary" mb={2}>{ticket.area} · {ticket.requester.firstName} {ticket.requester.lastName}</Typography>
              <Typography>{ticket.description}</Typography>
            </Paper>

            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={900} mb={2}>Conversacion</Typography>
              <Stack spacing={2}>
                {ticket.comments.length === 0 && <Typography color="text.secondary">Aun no hay mensajes en este ticket.</Typography>}
                {ticket.comments.map((comment) => (
                  <Box key={comment.id} sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
                    <Typography fontWeight={800}>{comment.user.firstName} {comment.user.lastName}</Typography>
                    <Typography>{comment.message}</Typography>
                    <Typography variant="caption" color="text.secondary">{formatDate(comment.createdAt)}</Typography>
                  </Box>
                ))}
              </Stack>

              <Stack component="form" spacing={1.5} mt={3} onSubmit={handleSubmit((values) => mutation.mutate(values))}>
                {mutation.isSuccess && <Alert severity="success">Respuesta enviada correctamente.</Alert>}
                {mutation.isError && <Alert severity="error">No se pudo enviar la respuesta.</Alert>}
                <TextField label="Responder al ticket" multiline minRows={3} {...register("message")} error={!!errors.message} helperText={errors.message?.message} />
                <FormControlLabel control={<Checkbox {...register("noSolucionado")} />} label="No solucionado, necesito que lo revisen nuevamente" />
                <Button type="submit" variant="contained" startIcon={<ReplyIcon />} disabled={mutation.isPending}>
                  Enviar respuesta
                </Button>
              </Stack>
            </Paper>
          </Stack>
        )}
      </Box>
    </Box>
  );
}
