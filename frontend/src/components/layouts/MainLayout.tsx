import React from "react";
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
  Badge,
  Tooltip,
  Menu,
  MenuItem,
  InputBase,
  Button
} from "@mui/material";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

// Icons
import AddIcon from "@mui/icons-material/Add";
import AssessmentIcon from "@mui/icons-material/Assessment";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import GroupIcon from "@mui/icons-material/Group";
import HistoryIcon from "@mui/icons-material/History";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import { useAuthStore } from "../../store/auth.store";
import { useThemeStore } from "../../store/theme.store";
import { useHasPermission } from "../../hooks/usePermission";
import { GlobalSearchDialog } from "../common/GlobalSearchDialog";
import { getPublicBootstrap } from "../../services/ticket.service";

const EXPANDED_WIDTH = 260;
const COLLAPSED_WIDTH = 72;

export function MainLayout() {
  const { user, logout } = useAuthStore();
  const { mode, toggleMode } = useThemeStore();
  const hasPermission = useHasPermission();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { data: branding } = useQuery({ queryKey: ["public-bootstrap"], queryFn: getPublicBootstrap });
  const settings = Object.fromEntries((branding?.settings ?? []).map((item) => [item.key, item.value]));
  const companyName = settings.company_name ?? "SOPORTE";
  const logoUrl = settings.logo_url;
  
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Sidebar states
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    return localStorage.getItem("sidebar_collapsed") === "true";
  });
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Search dialog state
  const [searchOpen, setSearchOpen] = React.useState(false);

  // User menu anchor state
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  // Keyboard shortcut Ctrl+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key?.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar_collapsed", String(next));
      return next;
    });
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
    navigate("/login");
  };

  // Define sidebar menu items
  const menuItems = [
    { to: "/admin", label: "Dashboard", icon: <DashboardIcon />, permission: "dashboard:view" },
    { to: "/admin/tickets", label: "Tickets", icon: <SupportAgentIcon />, permission: "tickets:create" },
    { to: "/admin/tickets/nuevo", label: "Nuevo Ticket", icon: <AddIcon />, permission: "tickets:create" },
    { to: "/admin/usuarios", label: "Usuarios", icon: <GroupIcon />, permission: "users:manage" },
    { to: "/admin/roles", label: "Roles", icon: <AdminPanelSettingsIcon />, permission: "roles:manage" },
    { to: "/admin/modulos", label: "Catalogos / Modulos", icon: <AccountTreeIcon />, permission: "modules:manage" },
    { to: "/admin/plantillas-correo", label: "Plantillas de Correo", icon: <MailOutlineIcon />, permission: "templates:manage" },
    { to: "/admin/sla", label: "Configuracion SLA", icon: <AccessTimeIcon />, permission: "sla:manage" },
    { to: "/admin/reportes", label: "Reportes", icon: <AssessmentIcon />, permission: "reports:view" },
    { to: "/admin/auditoria", label: "Auditoria de Acciones", icon: <HistoryIcon />, permission: "audit:view" },
    { to: "/admin/configuracion", label: "Configuracion Sistema", icon: <SettingsIcon />, permission: "settings:manage" }
  ];

  // Filter items according to permissions
  const filteredItems = menuItems.filter((item) => {
    // Exception: tickets is visible if user can either create or manage tickets
    if (item.to === "/admin/tickets") {
      return hasPermission("tickets:create") || hasPermission("tickets:manage");
    }
    return item.permission ? hasPermission(item.permission) : true;
  });

  const drawerWidth = isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  const sidebarContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Sidebar Header */}
      <Toolbar sx={{ justifyContent: isCollapsed ? "center" : "space-between", px: 2 }}>
        {!isCollapsed && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
            {logoUrl ? <Box component="img" src={logoUrl} alt={companyName} sx={{ width: 34, height: 34, objectFit: "contain" }} /> : null}
            <Typography variant="h6" fontWeight={900} color="primary" noWrap>
              {companyName}
            </Typography>
          </Box>
        )}
        {!isMobile && (
          <IconButton onClick={handleToggleCollapse} size="small" sx={{ border: "1px solid", borderColor: "divider" }}>
            {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        )}
      </Toolbar>
      <Divider />

      {/* Navigation List */}
      <List sx={{ px: 1, py: 2, flexGrow: 1 }}>
        {filteredItems.map((item) => {
          const isActive = item.to === "/admin"
            ? location.pathname === item.to
            : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
          return (
            <Tooltip key={item.to} title={isCollapsed ? item.label : ""} placement="right" arrow>
              <ListItemButton
                component={NavLink}
                to={item.to}
                onClick={isMobile ? handleDrawerToggle : undefined}
                sx={{
                  borderRadius: "8px",
                  mb: 0.5,
                  py: 1.2,
                  px: isCollapsed ? 1.5 : 2,
                  justifyContent: isCollapsed ? "center" : "flex-start",
                  color: isActive ? "primary.main" : "text.secondary",
                  backgroundColor: isActive 
                    ? (theme) => theme.palette.mode === "light" ? "rgba(79, 70, 229, 0.08)" : "rgba(99, 102, 241, 0.12)"
                    : "transparent",
                  fontWeight: isActive ? 600 : 500,
                  position: "relative",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&::before": isActive ? {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: "15%",
                    height: "70%",
                    width: "4px",
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: "0 4px 4px 0"
                  } : {},
                  "& .MuiListItemIcon-root": {
                    minWidth: isCollapsed ? 0 : 36,
                    color: isActive ? "primary.main" : "text.secondary",
                    transition: "color 0.2s"
                  },
                  "&:hover": {
                    backgroundColor: (theme) => theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.03)" : "rgba(255, 255, 255, 0.03)",
                    color: isActive ? "primary.main" : "text.primary",
                    "& .MuiListItemIcon-root": {
                      color: isActive ? "primary.main" : "text.primary"
                    }
                  }
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                {!isCollapsed && <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: "0.9rem", fontWeight: isActive ? 600 : 500 }} />}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>
      
      {/* Footer Details */}
      {!isCollapsed && user && (
        <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Rol: {user.role}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            Área: {user.area}
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Sidebar Drawer */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { width: EXPANDED_WIDTH, boxSizing: "border-box" }
          }}
        >
          {sidebarContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            transition: theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen
            }),
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              transition: theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen
              }),
              overflowX: "hidden"
            }
          }}
        >
          {sidebarContent}
        </Drawer>
      )}

      {/* Main Container */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top Header */}
        <AppBar position="sticky" color="inherit" elevation={0}>
          <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, md: 3 } }}>
            {/* Left side: Hamburger on mobile, Search bar button on desktop */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {isMobile && (
                <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle} sx={{ mr: 1 }}>
                  <MenuIcon />
                </IconButton>
              )}

              {/* Omni Search Button */}
              {!isMobile && (
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => setSearchOpen(true)}
                  startIcon={<SearchIcon fontSize="small" />}
                  sx={{
                    borderRadius: "20px",
                    px: 2,
                    py: 0.5,
                    fontSize: "0.85rem",
                    color: "text.secondary",
                    borderColor: "divider",
                    textTransform: "none",
                    fontWeight: 400,
                    width: 280,
                    justifyContent: "space-between",
                    "&:hover": {
                      borderColor: "text.secondary",
                      bgcolor: "transparent"
                    }
                  }}
                >
                  <span>Buscar...</span>
                  <Typography variant="caption" sx={{ bgcolor: "divider", px: 1, py: 0.2, borderRadius: "4px", fontSize: "0.75rem", color: "text.secondary" }}>
                    Ctrl+K
                  </Typography>
                </Button>
              )}
              {isMobile && (
                <IconButton color="inherit" onClick={() => setSearchOpen(true)}>
                  <SearchIcon />
                </IconButton>
              )}
            </Box>

            {/* Right side Actions */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {/* Dark mode switch */}
              <Tooltip title={mode === "light" ? "Modo Oscuro" : "Modo Claro"}>
                <IconButton onClick={toggleMode} color="inherit">
                  {mode === "light" ? <Brightness4Icon /> : <Brightness7Icon />}
                </IconButton>
              </Tooltip>

              {/* Notification Center */}
              <Tooltip title="Notificaciones">
                <IconButton color="inherit">
                  <Badge badgeContent={3} color="error" variant="dot">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Divider orientation="vertical" flexItem sx={{ my: 1.5 }} />

              {/* User Avatar & Menu */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <IconButton onClick={handleUserMenuOpen} sx={{ p: 0 }}>
                  <Avatar sx={{ bgcolor: "primary.main", fontWeight: 750, width: 36, height: 36 }}>
                    {user?.firstName?.[0] ?? "U"}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleUserMenuClose}
                  onClick={handleUserMenuClose}
                  PaperProps={{
                    sx: {
                      mt: 1.5,
                      borderRadius: 2,
                      minWidth: 200,
                      boxShadow: "0px 5px 15px rgba(0,0,0,0.1)"
                    }
                  }}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {user?.firstName} {user?.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user?.email}
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuItem onClick={() => navigate("/admin/configuracion")}>
                    <ListItemIcon>
                      <SettingsIcon fontSize="small" />
                    </ListItemIcon>
                    Configuración
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    Cerrar sesión
                  </MenuItem>
                </Menu>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Content view portal */}
        <Box component="main" className="animate-fade-in" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, overflowY: "auto" }}>
          <Outlet />
        </Box>
      </Box>

      {/* Global search shortcut overlay */}
      <GlobalSearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </Box>
  );
}
