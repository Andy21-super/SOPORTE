import { zodResolver } from "@hookform/resolvers/zod";
import RestoreIcon from "@mui/icons-material/Restore";
import ReplyIcon from "@mui/icons-material/Reply";
import { Button, Checkbox, Chip, Divider, FormControlLabel, Paper, Stack, TextField, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { z } from "zod";
import { addComment, enableTicket, getTicket } from "../services/ticket.service";

const schema = z.object({ message: z.string().min(2), noSolucionado: z.boolean().optional() });
type FormValues = z.infer<typeof schema>;

export function TicketDetail() {
  const { id = "" } = useParams();
  const queryClient = useQueryClient();
  const { data: ticket } = useQuery({ queryKey: ["ticket", id], queryFn: () => getTicket(id), enabled: !!id });
  const { register, handleSubmit, reset } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { noSolucionado: false } });
  const mutation = useMutation({
    mutationFn: (values: FormValues) => addComment(id, values),
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ["ticket", id] });
    }
  });
  const enableMutation = useMutation({
    mutationFn: () => enableTicket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", id] });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    }
  });

  if (!ticket) return <Typography>Cargando ticket...</Typography>;

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="h4" fontWeight={800}>{ticket.number}</Typography>
        <Chip label={ticket.status.name} sx={{ bgcolor: ticket.status.color, color: "#fff" }} />
        <Chip label={ticket.priority.name} sx={{ bgcolor: ticket.priority.color, color: "#fff" }} />
        {ticket.deleted && <Chip label="Deshabilitado" />}
        {ticket.deleted && (
          <Button size="small" variant="outlined" color="success" startIcon={<RestoreIcon />} onClick={() => enableMutation.mutate()} disabled={enableMutation.isPending}>
            Habilitar
          </Button>
        )}
      </Stack>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={800}>{ticket.subject}</Typography>
        <Typography color="text.secondary" mb={2}>{ticket.module.name} · {ticket.category.name} · {ticket.area}</Typography>
        <Typography>{ticket.description}</Typography>
      </Paper>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={800} mb={2}>Conversacion</Typography>
        <Stack spacing={2}>
          {ticket.comments.map((comment) => (
            <Stack key={comment.id} spacing={0.5}>
              <Typography fontWeight={700}>{comment.user.firstName} {comment.user.lastName}</Typography>
              <Typography>{comment.message}</Typography>
              <Typography variant="caption" color="text.secondary">{new Date(comment.createdAt).toLocaleString()}</Typography>
              <Divider />
            </Stack>
          ))}
        </Stack>
        <Stack component="form" spacing={1.5} mt={3} onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <TextField label="Respuesta" multiline minRows={3} {...register("message")} />
          <FormControlLabel control={<Checkbox {...register("noSolucionado")} />} label="No solucionado" />
          <Button type="submit" variant="contained" startIcon={<ReplyIcon />}>Comentar</Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
