import { Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import { formatDate } from "../utils/format";

export function Audit() {
  const { data = [] } = useQuery({ queryKey: ["audit"], queryFn: async () => (await api.get("/audit")).data });
  return (
    <Stack spacing={2}>
      <Typography variant="h4" fontWeight={800}>Auditoria</Typography>
      <Paper variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Accion</TableCell>
              <TableCell>Modulo</TableCell>
              <TableCell>Descripcion</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((log: any) => (
              <TableRow key={log.id}>
                <TableCell>{formatDate(log.createdAt)}</TableCell>
                <TableCell>{log.user?.email ?? "-"}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>{log.module}</TableCell>
                <TableCell>{log.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  );
}
