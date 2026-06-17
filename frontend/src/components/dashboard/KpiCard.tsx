import { Box, Card, CardContent, Typography } from "@mui/material";
import type { ReactNode } from "react";

export function KpiCard({ label, value, icon }: { label: string; value: number; icon?: ReactNode }) {
  return (
    <Card variant="outlined">
      <CardContent sx={{ minHeight: 112 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
          {icon}
        </Box>
        <Typography variant="h4" fontWeight={900}>{value}</Typography>
      </CardContent>
    </Card>
  );
}
