import { zodResolver } from "@hookform/resolvers/zod";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LoginIcon from "@mui/icons-material/Login";
import { Alert, Button, IconButton, InputAdornment, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { AuthLayout } from "../components/layouts/AuthLayout";
import { login } from "../services/auth.service";
import { useAuthStore } from "../store/auth.store";

const schema = z.object({
  email: z.string().min(1, "Ingresa tu usuario"),
  password: z.string().min(6, "Ingresa tu contrasena")
});
type FormValues = z.infer<typeof schema>;

export function Login() {
  const setSession = useAuthStore((state) => state.setSession);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "CD.ADMIN", password: "" }
  });

  async function onSubmit(values: FormValues) {
    try {
      const session = await login(values.email, values.password);
      setSession(session);
      navigate("/admin");
    } catch {
      setError("No se pudo iniciar sesion. Revisa las credenciales.");
    }
  }

  return (
    <AuthLayout>
      <Stack component="form" spacing={2.2} onSubmit={handleSubmit(onSubmit)} autoComplete="off">
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Usuario" autoComplete="username" {...register("email")} error={!!errors.email} helperText={errors.email?.message} />
        <TextField
          label="Contrasena"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          {...register("password")}
          error={!!errors.password}
          helperText={errors.password?.message}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}>
                  <IconButton edge="end" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}>
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            )
          }}
        />
        <Button type="submit" variant="contained" size="large" startIcon={<LoginIcon />} disabled={isSubmitting}>
          Iniciar sesion
        </Button>
        <Typography component="button" type="button" onClick={() => navigate("/olvide-contrasena")} sx={{ border: 0, bgcolor: "transparent", color: "primary.main", cursor: "pointer", fontWeight: 700 }}>
          Olvide mi contrasena
        </Typography>
      </Stack>
    </AuthLayout>
  );
}
