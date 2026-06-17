import { zodResolver } from "@hookform/resolvers/zod";
import LoginIcon from "@mui/icons-material/Login";
import { Alert, Button, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { AuthLayout } from "../components/layouts/AuthLayout";
import { login } from "../services/auth.service";
import { useAuthStore } from "../store/auth.store";

const schema = z.object({ email: z.string().email(), password: z.string().min(8) });
type FormValues = z.infer<typeof schema>;

export function Login() {
  const setSession = useAuthStore((state) => state.setSession);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "admin@empresa.com", password: "Admin123*" }
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
      <Stack component="form" spacing={2.2} onSubmit={handleSubmit(onSubmit)}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Correo corporativo" {...register("email")} error={!!errors.email} helperText={errors.email?.message} />
        <TextField label="Contrasena" type="password" {...register("password")} error={!!errors.password} helperText={errors.password?.message} />
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
