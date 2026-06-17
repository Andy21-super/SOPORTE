import { Chip, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getTickets } from "../services/ticket.service";

export function Tickets() {
  const { data = [] } = useQuery({ queryKey: ["tickets"], queryFn: getTickets });
  return (
    <Stack spacing={2}>
      <Typography variant="h4" fontWeight={800}>Tickets</Typography>
      <Paper variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Numero</TableCell>
              <TableCell>Asunto</TableCell>
              <TableCell>Modulo</TableCell>
              <TableCell>Prioridad</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((ticket) => (
              <TableRow key={ticket.id} hover component={Link} to={`/admin/tickets/${ticket.id}`} sx={{ textDecoration: "none" }}>
                <TableCell>{ticket.number}</TableCell>
                <TableCell>{ticket.subject}</TableCell>
                <TableCell>{ticket.module.name}</TableCell>
                <TableCell><Chip label={ticket.priority.name} size="small" sx={{ bgcolor: ticket.priority.color, color: "#fff" }} /></TableCell>
                <TableCell><Chip label={ticket.status.name} size="small" sx={{ bgcolor: ticket.status.color, color: "#fff" }} /></TableCell>
                <TableCell>{new Date(ticket.createdAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  );
}
