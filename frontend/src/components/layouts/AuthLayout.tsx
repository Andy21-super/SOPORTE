import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { Link } from "react-router-dom";
import { getPublicBootstrap } from "../../services/ticket.service";

export function AuthLayout({ children }: PropsWithChildren) {
  const { data } = useQuery({ queryKey: ["public-bootstrap"], queryFn: getPublicBootstrap });
  const settings = Object.fromEntries((data?.settings ?? []).map((item) => [item.key, item.value]));
  const companyName = settings.company_name ?? "SOPORTE";
  const logoUrl = settings.logo_url;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
        py: 4,
        backgroundImage: "linear-gradient(135deg, rgba(15,23,42,.92), rgba(18,53,91,.76)), url('https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1800&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <Paper sx={{ width: "100%", maxWidth: 460, p: { xs: 3, md: 4 }, borderRadius: 3 }} elevation={16}>
        <Stack spacing={2.5}>
          <Button component={Link} to="/" startIcon={<ArrowBackIcon />} sx={{ alignSelf: "flex-start" }}>
            Portal publico
          </Button>
          <Stack direction="row" spacing={1.5} alignItems="center">
            {logoUrl ? <Box component="img" src={logoUrl} alt={companyName} sx={{ width: 96, height: 64, objectFit: "contain" }} /> : null}
            <Box>
              <Typography variant="h4" fontWeight={900} color="primary">
                {companyName}
              </Typography>
              <Typography color="text.secondary">
                Acceso administrativo de CAMPAMENTOS DIOSES
              </Typography>
            </Box>
          </Stack>
          {children}
        </Stack>
      </Paper>
    </Box>
  );
}
