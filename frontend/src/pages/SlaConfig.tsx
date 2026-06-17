import SaveIcon from "@mui/icons-material/Save";
import { Alert, Box, Button, Checkbox, Paper, Stack, TextField, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getAdminCatalogs, saveSlaRules } from "../services/admin.service";

type Rule = { priorityId: string; hours: number; warn75: boolean; warn90: boolean; warn100: boolean };

export function SlaConfig() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-catalogs"], queryFn: getAdminCatalogs });
  const [rules, setRules] = useState<Rule[]>([]);
  const mutation = useMutation({
    mutationFn: saveSlaRules,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-catalogs"] })
  });

  useEffect(() => {
    const saved = new Map((data?.slaRules ?? []).map((rule: any) => [rule.priorityId, rule]));
    setRules((data?.priorities ?? []).map((priority: any) => {
      const rule: any = saved.get(priority.id);
      return {
        priorityId: priority.id,
        hours: Number(rule?.hours ?? priority.slaHours ?? 24),
        warn75: rule?.warn75 ?? true,
        warn90: rule?.warn90 ?? true,
        warn100: rule?.warn100 ?? true
      };
    }));
  }, [data]);

  function updateRule(priorityId: string, patch: Partial<Rule>) {
    setRules((current) => current.map((rule) => rule.priorityId === priorityId ? { ...rule, ...patch } : rule));
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h4" fontWeight={800}>Configuracion SLA</Typography>
          <Typography color="text.secondary">Define horas objetivo y alertas por prioridad.</Typography>
        </Box>
        <Button variant="contained" startIcon={<SaveIcon />} disabled={mutation.isPending} onClick={() => mutation.mutate(rules)}>
          Guardar reglas
        </Button>
      </Stack>
      {mutation.isSuccess && <Alert severity="success">Reglas SLA actualizadas</Alert>}
      {mutation.isError && <Alert severity="error">No se pudieron guardar las reglas SLA</Alert>}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "repeat(2, 1fr)" }, gap: 2 }}>
        {(data?.priorities ?? []).map((priority: any) => {
          const rule = rules.find((item) => item.priorityId === priority.id);
          if (!rule) return null;
          return (
            <Paper key={priority.id} variant="outlined" sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1.2} alignItems="center">
                    <Box sx={{ width: 14, height: 14, bgcolor: priority.color, borderRadius: "50%" }} />
                    <Typography variant="h6" fontWeight={900}>{priority.name}</Typography>
                  </Stack>
                  <Typography color="text.secondary">Objetivo operativo</Typography>
                </Stack>
                <TextField
                  label="Horas maximas de atencion"
                  type="number"
                  value={rule.hours}
                  inputProps={{ min: 1 }}
                  onChange={(event) => updateRule(priority.id, { hours: Number(event.target.value) })}
                />
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Stack direction="row" alignItems="center">
                    <Checkbox checked={rule.warn75} onChange={(e) => updateRule(priority.id, { warn75: e.target.checked })} />
                    <Typography>Alerta 75%</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center">
                    <Checkbox checked={rule.warn90} onChange={(e) => updateRule(priority.id, { warn90: e.target.checked })} />
                    <Typography>Alerta 90%</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center">
                    <Checkbox checked={rule.warn100} onChange={(e) => updateRule(priority.id, { warn100: e.target.checked })} />
                    <Typography>Vencimiento 100%</Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Paper>
          );
        })}
      </Box>
    </Stack>
  );
}
