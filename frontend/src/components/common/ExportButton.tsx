import React from "react";
import { Button, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import TableChartIcon from "@mui/icons-material/TableChart"; // Excel
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf"; // PDF
import DescriptionIcon from "@mui/icons-material/Description"; // CSV

import { exportToExcel, exportToCsv, exportToPdf, ExportColumn } from "../../utils/export";

interface ExportButtonProps {
  data: any[];
  columns: ExportColumn[];
  filename?: string;
  title?: string;
  variant?: "contained" | "outlined" | "text";
  color?: "primary" | "secondary" | "success" | "error" | "info" | "warning" | "inherit";
  size?: "small" | "medium" | "large";
}

export function ExportButton({
  data,
  columns,
  filename = "export",
  title = "Reporte",
  variant = "outlined",
  color = "primary",
  size = "small"
}: ExportButtonProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExportExcel = () => {
    handleClose();
    exportToExcel(data, columns, filename);
  };

  const handleExportCsv = () => {
    handleClose();
    exportToCsv(data, columns, filename);
  };

  const handleExportPdf = () => {
    handleClose();
    exportToPdf(data, columns, filename, title);
  };

  return (
    <>
      <Button
        id="export-button"
        aria-controls={open ? "export-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        variant={variant}
        color={color}
        size={size}
        startIcon={<FileDownloadIcon />}
        onClick={handleClick}
        sx={{ textTransform: "none" }}
      >
        Exportar
      </Button>
      <Menu
        id="export-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "export-button"
        }}
        PaperProps={{
          sx: {
            mt: 0.5,
            borderRadius: 2,
            minWidth: 160,
            boxShadow: "0px 4px 12px rgba(0,0,0,0.08)"
          }
        }}
      >
        <MenuItem onClick={handleExportExcel}>
          <ListItemIcon>
            <TableChartIcon fontSize="small" color="success" />
          </ListItemIcon>
          <ListItemText primary="Excel (.xlsx)" primaryTypographyProps={{ fontSize: "0.875rem" }} />
        </MenuItem>
        <MenuItem onClick={handleExportPdf}>
          <ListItemIcon>
            <PictureAsPdfIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="PDF (.pdf)" primaryTypographyProps={{ fontSize: "0.875rem" }} />
        </MenuItem>
        <MenuItem onClick={handleExportCsv}>
          <ListItemIcon>
            <DescriptionIcon fontSize="small" color="info" />
          </ListItemIcon>
          <ListItemText primary="CSV (.csv)" primaryTypographyProps={{ fontSize: "0.875rem" }} />
        </MenuItem>
      </Menu>
    </>
  );
}
