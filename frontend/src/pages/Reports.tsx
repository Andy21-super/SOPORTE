import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableViewIcon from "@mui/icons-material/TableView";
import { Box, Button, Chip, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPublicBootstrap, getTickets } from "../services/ticket.service";
import { exportToCsv, exportToExcel, exportToPdf } from "../utils/export";
import { formatDate } from "../utils/format";

const columns = [
  { header: "Ticket", key: "number" },
  { header: "Fecha", key: "createdAt" },
  { header: "Estado", key: "status" },
  { header: "Prioridad", key: "priority" },
  { header: "Area", key: "area" },
  { header: "Solicitante", key: "requesterName" },
  { header: "DNI", key: "dni" },
  { header: "Correo", key: "email" },
  { header: "Cargo/Puesto", key: "position" },
  { header: "Modulo", key: "module" },
  { header: "Categoria", key: "category" },
  { header: "Asunto", key: "subject" },
  { header: "Descripcion", key: "description" }
];

export function Reports() {
  const { data = [] } = useQuery({ queryKey: ["tickets"], queryFn: getTickets });
  const { data: bootstrap } = useQuery({ queryKey: ["public-bootstrap"], queryFn: getPublicBootstrap });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  const rows = useMemo(() => data.map((ticket) => {
    const rawPosition = ticket.position ?? ticket.requester?.position ?? "";
    return {
      id: ticket.id,
      number: ticket.number,
      createdAt: formatDate(ticket.createdAt),
      createdAtRaw: ticket.createdAt,
      status: ticket.status.name,
      statusColor: ticket.status.color,
      priority: ticket.priority.name,
      priorityColor: ticket.priority.color,
      area: ticket.area,
      requesterName: `${ticket.requester.firstName} ${ticket.requester.lastName}`,
      dni: rawPosition.startsWith("DNI ") ? rawPosition.replace("DNI ", "") : "",
      email: ticket.requester.email,
      position: rawPosition.startsWith("DNI ") ? "Solicitante publico" : rawPosition,
      module: ticket.module.name,
      category: ticket.category.name,
      subject: ticket.subject,
      description: ticket.description
    };
  }), [data]);

  const filteredRows = useMemo(() => rows.filter((row) => {
    const created = new Date(row.createdAtRaw).getTime();
    if (startDate && created < new Date(`${startDate}T00:00:00`).getTime()) return false;
    if (endDate && created > new Date(`${endDate}T23:59:59`).getTime()) return false;
    if (status && row.status !== status) return false;
    if (priority && row.priority !== priority) return false;
    return true;
  }), [rows, startDate, endDate, status, priority]);

  const statuses = [...new Set(rows.map((row) => row.status))];
  const priorities = [...new Set(rows.map((row) => row.priority))];
  const filename = `reporte_tickets_${startDate || "inicio"}_${endDate || "fin"}`;
  const settings = Object.fromEntries((bootstrap?.settings ?? []).map((item) => [item.key, item.value]));

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", md: "row" }} alignItems={{ md: "center" }} justifyContent="space-between" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Reportes</Typography>
          <Typography color="text.secondary">Exportacion estructurada con datos completos del solicitante y detalle de la incidencia.</Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => exportToCsv(filteredRows, columns, filename)}>CSV</Button>
          <Button variant="outlined" startIcon={<TableViewIcon />} onClick={() => exportToExcel(filteredRows, columns, filename)}>Excel</Button>
          <Button
            variant="contained"
            startIcon={<PictureAsPdfIcon />}
            onClick={() => exportToPdf(filteredRows, columns, filename, "Reporte estructurado de tickets", { logoUrl: settings.logo_url, companyName: settings.company_name })}
          >
            PDF
          </Button>
        </Stack>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" }, gap: 2 }}>
          <TextField label="Desde" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField label="Hasta" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField select label="Estado" value={status} onChange={(e) => setStatus(e.target.value)}>
            <MenuItem value="">Todos</MenuItem>
            {statuses.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
          </TextField>
          <TextField select label="Prioridad" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <MenuItem value="">Todas</MenuItem>
            {priorities.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
          </TextField>
        </Box>
      </Paper>

      <Paper variant="outlined" sx={{ overflow: "hidden" }}>
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Ticket</TableCell>
                <TableCell>Solicitante</TableCell>
                <TableCell>DNI / Correo</TableCell>
                <TableCell>Area</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Prioridad</TableCell>
                <TableCell>Descripcion</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Typography fontWeight={800}>{row.number}</Typography>
                    <Typography variant="caption" color="text.secondary">{row.createdAt}</Typography>
                  </TableCell>
                  <TableCell>{row.requesterName}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{row.dni || "No registrado"}</Typography>
                    <Typography variant="caption" color="text.secondary">{row.email}</Typography>
                  </TableCell>
                  <TableCell>{row.area}</TableCell>
                  <TableCell><Chip label={row.status} size="small" sx={{ bgcolor: row.statusColor, color: "#fff" }} /></TableCell>
                  <TableCell><Chip label={row.priority} size="small" sx={{ bgcolor: row.priorityColor, color: "#fff" }} /></TableCell>
                  <TableCell sx={{ minWidth: 280 }}>{row.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Paper>
    </Stack>
  );
}
