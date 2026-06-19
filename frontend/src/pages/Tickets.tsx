import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Chip, IconButton, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { splitProjectArea } from "../constants/publicCatalogs";
import { disableTicket, getTickets } from "../services/ticket.service";

export function Tickets() {
  const queryClient = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["tickets"], queryFn: getTickets });
  const disableMutation = useMutation({
    mutationFn: disableTicket,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tickets"] })
  });

  return (
    <Stack spacing={2}>
      <Typography variant="h4" fontWeight={800}>Tickets</Typography>
      <Paper variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Numero</TableCell>
              <TableCell>Asunto</TableCell>
              <TableCell>Proyecto</TableCell>
              <TableCell>Áreas</TableCell>
              <TableCell>IP/PC</TableCell>
              <TableCell>Modulo</TableCell>
              <TableCell>Prioridad</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((ticket) => {
              const { project, area } = splitProjectArea(ticket.area);
              const computer = ticket.requesterIp ?? ticket.deviceId ?? "No registrado";
              return (
                <TableRow key={ticket.id} hover>
                  <TableCell>
                    <Typography component={Link} to={`/admin/tickets/${ticket.id}`} fontWeight={800} sx={{ color: "primary.main", textDecoration: "none" }}>
                      {ticket.number}
                    </Typography>
                  </TableCell>
                  <TableCell>{ticket.subject}</TableCell>
                  <TableCell>{project}</TableCell>
                  <TableCell>{area || "-"}</TableCell>
                  <TableCell>
                    <Chip label={computer} size="small" variant="outlined" sx={{ maxWidth: 180 }} />
                  </TableCell>
                  <TableCell>{ticket.module.name}</TableCell>
                  <TableCell><Chip label={ticket.priority.name} size="small" sx={{ bgcolor: ticket.priority.color, color: "#fff" }} /></TableCell>
                  <TableCell><Chip label={ticket.status.name} size="small" sx={{ bgcolor: ticket.status.color, color: "#fff" }} /></TableCell>
                  <TableCell>{new Date(ticket.createdAt).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Deshabilitar incidencia">
                      <span>
                        <IconButton color="error" onClick={() => disableMutation.mutate(ticket.id)} disabled={disableMutation.isPending}>
                          <DeleteOutlineIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  );
}
