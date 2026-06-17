import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { buildTheme } from "./styles/theme";
import { useThemeStore } from "./store/theme.store";
import "./styles/global.css";

const queryClient = new QueryClient();

function RootApp() {
  const mode = useThemeStore((state) => state.mode);
  const theme = React.useMemo(() => buildTheme(mode), [mode]);

  React.useEffect(() => {
    document.body.className = mode;
  }, [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RootApp />
    </QueryClientProvider>
  </React.StrictMode>
);
