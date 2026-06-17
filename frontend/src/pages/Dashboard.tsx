import React from "react";
import { Box, Stack, Typography, TextField, Paper, Tooltip, IconButton, useTheme } from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

// Icons
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import GroupIcon from "@mui/icons-material/Group";
import SpeedIcon from "@mui/icons-material/Speed";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FeedbackIcon from "@mui/icons-material/Feedback";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from "chart.js";
import { Line, Bar, Doughnut, Pie, PolarArea } from "react-chartjs-2";

// Components
import { KpiCardAdvanced } from "../components/dashboard/KpiCardAdvanced";
import { DataTable, DataTableColumn } from "../components/common/DataTable";
import { StatusChip } from "../components/common/StatusChip";
import { getDashboard } from "../services/ticket.service";
import { formatDate } from "../utils/format";

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

export function Dashboard() {
  const navigate = useNavigate();
  const theme = useTheme();

  // Date filters state
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");

  // Query dashboard statistics
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", startDate, endDate],
    queryFn: () => getDashboard(startDate, endDate),
    refetchInterval: 30000 // auto-refresh every 30s
  });

  const kpis = data?.kpis ?? {};
  const trends = data?.trends ?? {};
  const charts = data?.charts ?? {};
  const recentTickets = data?.recentTickets ?? [];

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  // KPI card configs
  const kpiConfigs = [
    {
      title: "Tickets Totales",
      value: kpis.total ?? 0,
      trend: trends.total,
      trendDir: (trends.total ?? 0) >= 0 ? "up" : "down",
      color: "#4f46e5", // indigo
      icon: <SupportAgentIcon />
    },
    {
      title: "Tickets Abiertos",
      value: kpis.open ?? 0,
      trend: trends.open,
      trendDir: (trends.open ?? 0) <= 0 ? "down" : "up", // going down is good for open tickets
      color: "#0ea5e9", // sky blue
      icon: <FeedbackIcon />
    },
    {
      title: "Incidencias Críticas",
      value: kpis.critical ?? 0,
      trend: trends.critical,
      trendDir: (trends.critical ?? 0) <= 0 ? "down" : "up",
      color: "#dc2626", // red
      icon: <WarningAmberIcon />
    },
    {
      title: "Tickets Vencidos",
      value: kpis.overdue ?? 0,
      color: "#ea580c", // orange/amber
      icon: <AccessTimeIcon />
    },
    {
      title: "SLA Cumplidos",
      value: kpis.slaMet ?? 0,
      color: "#16a34a", // green
      icon: <SpeedIcon />
    },
    {
      title: "SLA Incumplidos",
      value: kpis.slaBroken ?? 0,
      color: "#b91c1c", // dark red
      icon: <WarningAmberIcon />
    },
    {
      title: "Usuarios Activos",
      value: kpis.usersActive ?? 0,
      color: "#64748b", // slate
      icon: <GroupIcon />
    },
    {
      title: "Usuarios Online",
      value: kpis.usersOnline ?? 0,
      color: "#8b5cf6", // purple
      icon: <GroupIcon />
    }
  ];

  // Chart options templates
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: theme.palette.text.secondary,
          font: { family: "Inter", size: 10 }
        }
      }
    },
    scales: {
      r: {
        grid: { color: theme.palette.divider },
        angleLines: { color: theme.palette.divider },
        pointLabels: { color: theme.palette.text.secondary, font: { family: "Inter" } }
      }
    }
  };

  const lineBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: theme.palette.text.secondary,
          font: { family: "Inter", size: 11 }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: theme.palette.text.secondary, font: { family: "Inter", size: 10 } }
      },
      y: {
        grid: { color: theme.palette.divider },
        ticks: { color: theme.palette.text.secondary, font: { family: "Inter", size: 10 } }
      }
    }
  };

  // Comparative line data
  const monthlyTrendData = {
    labels: (charts.monthlyTrend ?? []).map((x: any) => x.month),
    datasets: [
      {
        label: "Tickets Creados",
        data: (charts.monthlyTrend ?? []).map((x: any) => x.creados),
        borderColor: "#4f46e5",
        backgroundColor: "rgba(79, 70, 229, 0.1)",
        tension: 0.35,
        fill: true
      },
      {
        label: "Tickets Resueltos/Cerrados",
        data: (charts.monthlyTrend ?? []).map((x: any) => x.resueltos),
        borderColor: "#16a34a",
        backgroundColor: "rgba(22, 163, 74, 0.05)",
        tension: 0.35,
        fill: true
      }
    ]
  };

  // Status pie chart
  const statusChartData = {
    labels: (charts.byStatus ?? []).map((x: any) => x.name),
    datasets: [
      {
        data: (charts.byStatus ?? []).map((x: any) => x.value),
        backgroundColor: (charts.byStatus ?? []).map((x: any) => x.color || "#94a3b8"),
        borderWidth: 1,
        borderColor: theme.palette.background.paper
      }
    ]
  };

  // Priority doughnut chart
  const priorityChartData = {
    labels: (charts.byPriority ?? []).map((x: any) => x.name),
    datasets: [
      {
        data: (charts.byPriority ?? []).map((x: any) => x.value),
        backgroundColor: (charts.byPriority ?? []).map((x: any) => x.color || "#94a3b8"),
        borderWidth: 1,
        borderColor: theme.palette.background.paper
      }
    ]
  };

  // Area horizontal bar
  const areaChartData = {
    labels: (charts.byArea ?? []).map((x: any) => x.name),
    datasets: [
      {
        label: "Tickets",
        data: (charts.byArea ?? []).map((x: any) => x.value),
        backgroundColor: theme.palette.mode === "light" ? "rgba(79, 70, 229, 0.85)" : "rgba(99, 102, 241, 0.85)",
        borderRadius: 6
      }
    ]
  };

  // Module polar area
  const moduleChartData = {
    labels: (charts.byModule ?? []).map((x: any) => x.name),
    datasets: [
      {
        data: (charts.byModule ?? []).map((x: any) => x.value),
        backgroundColor: [
          "rgba(79, 70, 229, 0.7)",
          "rgba(14, 165, 233, 0.7)",
          "rgba(22, 163, 74, 0.7)",
          "rgba(234, 88, 12, 0.7)",
          "rgba(168, 85, 247, 0.7)",
          "rgba(236, 72, 153, 0.7)",
          "rgba(245, 158, 11, 0.7)",
          "rgba(59, 130, 246, 0.7)"
        ]
      }
    ]
  };

  // DataTable column definitions for recent tickets
  const columns: DataTableColumn[] = [
    {
      id: "number",
      label: "Ticket ID",
      sortable: true,
      render: (row) => (
        <Typography fontSize="0.875rem" fontWeight="bold" color="primary">
          {row.number}
        </Typography>
      )
    },
    { id: "subject", label: "Asunto", sortable: true },
    { id: "module", label: "Módulo", sortable: true },
    {
      id: "priority",
      label: "Prioridad",
      sortable: true,
      render: (row) => <StatusChip label={row.priority} color={row.priorityColor} />
    },
    {
      id: "status",
      label: "Estado",
      sortable: true,
      render: (row) => <StatusChip label={row.status} color={row.statusColor} />
    },
    {
      id: "createdAt",
      label: "Creado",
      sortable: true,
      render: (row) => formatDate(row.createdAt)
    }
  ];

  return (
    <Stack spacing={4}>
      {/* Header and Date Filter */}
      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
        <Box>
          <Typography variant="h3" fontWeight={800} color="text.primary" gutterBottom>
            Dashboard Ejecutivo
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Métricas operacionales de soporte, SLAs de atención y carga por módulos en tiempo real.
          </Typography>
        </Box>

        {/* Date Filter Panel */}
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 1.5, 
            display: "flex", 
            alignItems: "center", 
            gap: 2, 
            flexWrap: "wrap",
            borderRadius: "10px"
          }}
        >
          <TextField
            label="Fecha Inicio"
            type="date"
            size="small"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 150 }}
          />
          <TextField
            label="Fecha Fin"
            type="date"
            size="small"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 150 }}
          />
          {(startDate || endDate) && (
            <Tooltip title="Limpiar rango de fechas">
              <IconButton color="error" onClick={handleClearFilters}>
                <FilterAltOffIcon />
              </IconButton>
            </Tooltip>
          )}
        </Paper>
      </Box>

      {/* Summary KPI Grid */}
      <Grid container spacing={2}>
        {kpiConfigs.map((kpi, idx) => (
          <Grid key={idx} item xs={12} sm={6} md={3}>
            <KpiCardAdvanced
              title={kpi.title}
              value={isLoading ? "..." : kpi.value}
              trend={isLoading ? undefined : kpi.trend}
              trendDirection={kpi.trendDir as any}
              color={kpi.color}
              icon={kpi.icon}
            />
          </Grid>
        ))}
      </Grid>

      {/* Main Historical Comparative Chart */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: "12px" }}>
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
          Historial Anual: Creados vs. Resueltos
        </Typography>
        <Box sx={{ height: 320 }}>
          <Line data={monthlyTrendData} options={lineBarOptions} />
        </Box>
      </Paper>

      {/* Secondary Charts Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: "12px" }}>
            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
              Carga por Área de Origen
            </Typography>
            <Box sx={{ height: 260 }}>
              <Bar 
                data={areaChartData} 
                options={{
                  ...lineBarOptions,
                  indexAxis: "y" as const,
                  plugins: { legend: { display: false } }
                }} 
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: "12px" }}>
            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
              Distribución por Módulo
            </Typography>
            <Box sx={{ height: 260 }}>
              <PolarArea data={moduleChartData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: "12px" }}>
            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
              Distribución por Estado
            </Typography>
            <Box sx={{ height: 260 }}>
              <Pie data={statusChartData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: "12px" }}>
            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
              Distribución por Prioridad
            </Typography>
            <Box sx={{ height: 260 }}>
              <Doughnut data={priorityChartData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Tickets DataTable */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: "12px" }}>
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
          Tickets Recientes
        </Typography>
        <DataTable
          data={recentTickets}
          columns={columns}
          loading={isLoading}
          selectable={false}
          exportFilename={`tickets_recientes_${startDate || "inicio"}_a_${endDate || "fin"}`}
          exportTitle="Tickets Recientes"
          searchPlaceholder="Filtrar tickets en pantalla..."
        />
      </Paper>
    </Stack>
  );
}
