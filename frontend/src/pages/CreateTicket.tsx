import { zodResolver } from "@hookform/resolvers/zod";
import SendIcon from "@mui/icons-material/Send";
import { Button, Grid, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { createTicket, getCatalogs } from "../services/ticket.service";

const schema = z.object({
  moduleId: z.string().min(1),
  categoryId: z.string().min(1),
  priorityId: z.string().min(1),
  subject: z.string().min(5),
  description: z.string().min(10)
});
type FormValues = z.infer<typeof schema>;

export function CreateTicket() {
  const navigate = useNavigate();
  const { data } = useQuery({ queryKey: ["catalogs"], queryFn: getCatalogs });
  const mutation = useMutation({ mutationFn: createTicket, onSuccess: (ticket) => navigate(`/admin/tickets/${ticket.id}`) });
  const { control, register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  return (
    <Stack spacing={2}>
      <Typography variant="h4" fontWeight={800}>Crear Ticket</Typography>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack component="form" spacing={2.5} onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller name="moduleId" control={control} defaultValue="" render={({ field }) => (
                <TextField select fullWidth label="Modulo" {...field} error={!!errors.moduleId}>
                  {(data?.modules ?? []).map((item) => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}
                </TextField>
              )} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller name="categoryId" control={control} defaultValue="" render={({ field }) => (
                <TextField select fullWidth label="Categoria" {...field} error={!!errors.categoryId}>
                  {(data?.categories ?? []).map((item) => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}
                </TextField>
              )} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller name="priorityId" control={control} defaultValue="" render={({ field }) => (
                <TextField select fullWidth label="Prioridad" {...field} error={!!errors.priorityId}>
                  {(data?.priorities ?? []).map((item) => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}
                </TextField>
              )} />
            </Grid>
          </Grid>
          <TextField label="Asunto" {...register("subject")} error={!!errors.subject} helperText={errors.subject?.message} />
          <TextField label="Descripcion" multiline minRows={5} {...register("description")} error={!!errors.description} helperText={errors.description?.message} />
          <Button type="submit" variant="contained" startIcon={<SendIcon />} disabled={mutation.isPending}>Registrar incidencia</Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
