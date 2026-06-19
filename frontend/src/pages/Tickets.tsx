import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RestoreIcon from "@mui/icons-material/Restore";
import {
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { splitProjectArea } from "../constants/publicCatalogs";
import { disableTicket, enableTicket, getTickets } from "../services/ticket.service";

type TicketFilter = "active" | "disabled" | "all";

function isPublicIp(value?: string) {
  if (!value || value.includes(":")) return false;
  const parts = value.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) return false;
  const [a, b] = parts;
  return !(a === 10 || a === 127 || a === 0 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168));
}

function IpLocation({ ip }: { ip?: string }) {
  const enabled = isPublicIp(ip);
  const { data, isLoading } = useQuery({
    queryKey: ["ip-location", ip],
    enabled,
    staleTime: 24 * 60 * 60 * 1000,
    queryFn: async () => {
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      if (!response.ok) throw new Error("No se pudo consultar la ubicacion");
      return response.json() as Promise<{ city?: string; region?: string; country_name?: string; error?: boolean }>;
    }
  });

  if (!enabled) return <Typography variant="caption" color="text.secondary">No disponible</Typography>;
  if (isLoading) return <Typography variant="caption" color="text.secondary">Consultando...</Typography>;
  if (!data || data.error) return <Typography variant="caption" color="text.secondary">Sin dato</Typography>;

  const label = [data.city, data.region, data.country_name].filter(Boolean).join(", ");
  return <Typography variant="caption">{label || "Sin dato"}</Typography>;
}

export function Tickets() {
  const [filter, setFilter] = useState<TicketFilter>("active");
  const queryClient = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["tickets"], queryFn: getTickets });
  const disableMutation = useMutation({
    mutationFn: disableTicket,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tickets"] })
  });
  const enableMutation = useMutation({
    mutationFn: enableTicket,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tickets"] })
  });
  const filteredTickets = useMemo(() => {
    if (filter === "disabled") return data.filter((ticket) => ticket.deleted);
    if (filter === "all") return data;
    return data.filter((ticket) => !ticket.deleted);
  }, [data, filter]);

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1.5}>
        <Typography variant="h4" fontWeight={800}>Tickets</Typography>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={filter}
          onChange={(_, value: TicketFilter | null) => value && setFilter(value)}
        >
          <ToggleButton value="active">Activos</ToggleButton>
          <ToggleButton value="disabled">Deshabilitados</ToggleButton>
          <ToggleButton value="all">Todos</ToggleButton>
        </ToggleButtonGroup>
      </Stack>
      <Paper variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Numero</TableCell>
              <TableCell>Asunto</TableCell>
              <TableCell>Proyecto</TableCell>
              <TableCell>Areas</TableCell>
              <TableCell>IP/PC</TableCell>
              <TableCell>Ubicacion aprox.</TableCell>
              <TableCell>Modulo</TableCell>
              <TableCell>Prioridad</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTickets.map((ticket) => {
              const { project, area } = splitProjectArea(ticket.area);
              const computer = ticket.requesterIp ?? ticket.deviceId ?? "No registrado";
              return (
                <TableRow key={ticket.id} hover sx={ticket.deleted ? { opacity: 0.72 } : undefined}>
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
                  <TableCell><IpLocation ip={ticket.requesterIp} /></TableCell>
                  <TableCell>{ticket.module.name}</TableCell>
                  <TableCell><Chip label={ticket.priority.name} size="small" sx={{ bgcolor: ticket.priority.color, color: "#fff" }} /></TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.75}>
                      <Chip label={ticket.status.name} size="small" sx={{ bgcolor: ticket.status.color, color: "#fff" }} />
                      {ticket.deleted && <Chip label="Deshabilitado" size="small" color="default" />}
                    </Stack>
                  </TableCell>
                  <TableCell>{new Date(ticket.createdAt).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    {ticket.deleted ? (
                      <Tooltip title="Habilitar incidencia">
                        <span>
                          <IconButton color="success" onClick={() => enableMutation.mutate(ticket.id)} disabled={enableMutation.isPending}>
                            <RestoreIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Deshabilitar incidencia">
                        <span>
                          <IconButton color="error" onClick={() => disableMutation.mutate(ticket.id)} disabled={disableMutation.isPending}>
                            <DeleteOutlineIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
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
