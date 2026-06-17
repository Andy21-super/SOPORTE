import React from "react";
import { Dialog, DialogContent, TextField, InputAdornment, Box, Typography, List, ListItemButton, ListItemText, CircularProgress } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import { searchGlobal } from "../../services/search.service";

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

export function GlobalSearchDialog({ open, onClose }: SearchDialogProps) {
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<any>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!open) {
      setQuery("");
      setResults(null);
      return;
    }
  }, [open]);

  React.useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchGlobal(query);
        setResults(data);
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const hasResults = results && (
    results.tickets.length > 0 ||
    results.users.length > 0 ||
    results.modules.length > 0 ||
    results.categories.length > 0
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3, top: "-10%" } }}>
      <DialogContent sx={{ p: 2 }}>
        <TextField
          autoFocus
          fullWidth
          variant="outlined"
          placeholder="Buscar tickets, usuarios, módulos... (Esc para salir)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: loading && (
              <InputAdornment position="end">
                <CircularProgress size={20} />
              </InputAdornment>
            )
          }}
        />

        {query.trim().length >= 2 && !loading && !hasResults && (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography color="text.secondary">No se encontraron resultados para "{query}"</Typography>
          </Box>
        )}

        {results && hasResults && (
          <Box sx={{ mt: 2, maxHeight: 350, overflowY: "auto" }}>
            {results.tickets.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" fontWeight="bold" color="primary" sx={{ px: 1, textTransform: "uppercase" }}>
                  Tickets
                </Typography>
                <List dense>
                  {results.tickets.map((t: any) => (
                    <ListItemButton key={t.id} onClick={() => handleNavigate(`/admin/tickets/${t.id}`)} sx={{ borderRadius: 1 }}>
                      <ListItemText
                        primary={t.subject}
                        secondary={`${t.number} · ${t.status.name} · ${t.priority.name}`}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Box>
            )}

            {results.users.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" fontWeight="bold" color="primary" sx={{ px: 1, textTransform: "uppercase" }}>
                  Usuarios
                </Typography>
                <List dense>
                  {results.users.map((u: any) => (
                    <ListItemButton key={u.id} onClick={() => handleNavigate(`/admin/usuarios`)} sx={{ borderRadius: 1 }}>
                      <ListItemText
                        primary={`${u.firstName} ${u.lastName}`}
                        secondary={`${u.email} · ${u.role.name}`}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Box>
            )}

            {results.modules.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" fontWeight="bold" color="primary" sx={{ px: 1, textTransform: "uppercase" }}>
                  Módulos
                </Typography>
                <List dense>
                  {results.modules.map((m: any) => (
                    <ListItemButton key={m.id} onClick={() => handleNavigate(`/admin/modulos`)} sx={{ borderRadius: 1 }}>
                      <ListItemText primary={m.name} />
                    </ListItemButton>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
