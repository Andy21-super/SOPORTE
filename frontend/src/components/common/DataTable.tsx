import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Box,
  Checkbox,
  IconButton,
  Button,
  Typography,
  Skeleton,
  Tooltip,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from "@mui/material";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

import { ExportColumn } from "../../utils/export";
import { ExportButton } from "./ExportButton";

export interface DataTableColumn {
  id: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: "text" | "select" | "boolean";
  filterOptions?: { label: string; value: any }[];
  render?: (row: any) => React.ReactNode;
}

interface DataTableProps {
  data: any[];
  columns: DataTableColumn[];
  loading?: boolean;
  selectable?: boolean;
  onSelectionChange?: (selectedRows: any[]) => void;
  exportFilename?: string;
  exportTitle?: string;
  searchPlaceholder?: string;
}

export function DataTable({
  data = [],
  columns,
  loading = false,
  selectable = true,
  onSelectionChange,
  exportFilename = "export",
  exportTitle = "Reporte",
  searchPlaceholder = "Buscar..."
}: DataTableProps) {
  // State variables
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [globalSearch, setGlobalSearch] = React.useState("");
  const [showColumnFilters, setShowColumnFilters] = React.useState(false);
  const [columnFilters, setColumnFilters] = React.useState<Record<string, string>>({});
  
  // Sorting state
  const [sortField, setSortField] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc");

  // Selection state
  const [selected, setSelected] = React.useState<any[]>([]);

  // Clear states when data updates
  React.useEffect(() => {
    setSelected([]);
    if (onSelectionChange) onSelectionChange([]);
  }, [data]);

  // Handle Select All
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(filteredData);
      if (onSelectionChange) onSelectionChange(filteredData);
    } else {
      setSelected([]);
      if (onSelectionChange) onSelectionChange([]);
    }
  };

  // Handle Select Row
  const handleSelectRow = (event: React.MouseEvent<unknown>, row: any) => {
    const selectedIndex = selected.findIndex((item) => item.id === row.id);
    let newSelected: any[] = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, row];
    } else {
      newSelected = selected.filter((item) => item.id !== row.id);
    }

    setSelected(newSelected);
    if (onSelectionChange) onSelectionChange(newSelected);
  };

  const isSelected = (id: string) => selected.some((item) => item.id === id);

  // Sorting handler
  const handleSort = (field: string) => {
    const isAsc = sortField === field && sortDirection === "asc";
    setSortDirection(isAsc ? "desc" : "asc");
    setSortField(field);
  };

  // Filter change handlers
  const handleColumnFilterChange = (id: string, value: string) => {
    setColumnFilters((prev) => ({
      ...prev,
      [id]: value
    }));
    setPage(0); // reset page to 0
  };

  const clearAllFilters = () => {
    setColumnFilters({});
    setGlobalSearch("");
    setPage(0);
  };

  // Process data (Filter → Global Search → Sort)
  const filteredData = React.useMemo(() => {
    return data
      .filter((row) => {
        // 1. Apply global search
        if (globalSearch.trim() !== "") {
          const query = globalSearch.toLowerCase();
          const matchesGlobal = columns.some((col) => {
            const val = row[col.id];
            if (val === null || val === undefined) return false;
            return String(val).toLowerCase().includes(query);
          });
          if (!matchesGlobal) return false;
        }

        // 2. Apply column-specific filters
        for (const col of columns) {
          const filterValue = columnFilters[col.id];
          if (filterValue && filterValue !== "ALL") {
            const cellValue = row[col.id];
            
            // Check boolean
            if (col.filterType === "boolean") {
              const boolVal = cellValue === true ? "true" : "false";
              if (boolVal !== filterValue) return false;
            }
            // Check select or text
            else {
              if (cellValue === null || cellValue === undefined) return false;
              const matches = String(cellValue).toLowerCase().includes(filterValue.toLowerCase());
              if (!matches) return false;
            }
          }
        }

        return true;
      })
      .sort((a, b) => {
        // 3. Apply sort
        if (!sortField) return 0;
        
        let aVal = a[sortField];
        let bVal = b[sortField];

        // Custom handles for sorting sub-objects if needed, or simple comparison
        if (aVal === null || aVal === undefined) aVal = "";
        if (bVal === null || bVal === undefined) bVal = "";

        if (typeof aVal === "string") {
          return sortDirection === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        } else {
          return sortDirection === "asc" 
            ? (aVal > bVal ? 1 : -1) 
            : (bVal > aVal ? 1 : -1);
        }
      });
  }, [data, columns, globalSearch, columnFilters, sortField, sortDirection]);

  // Paginated chunk
  const paginatedData = React.useMemo(() => {
    const start = page * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  // Export handlers
  const exportCols: ExportColumn[] = columns.map((c) => ({
    header: c.label,
    key: c.id
  }));

  return (
    <Box sx={{ width: "100%" }}>
      {/* Top Toolbar */}
      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 2, mb: 2 }}>
        {/* Left: Search input */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexGrow: 1, maxWidth: { xs: "100%", sm: 400 } }}>
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            placeholder={searchPlaceholder}
            value={globalSearch}
            onChange={(e) => {
              setGlobalSearch(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              )
            }}
          />
          <Tooltip title={showColumnFilters ? "Ocultar filtros avanzados" : "Filtros por columna"}>
            <IconButton
              onClick={() => setShowColumnFilters(!showColumnFilters)}
              color={showColumnFilters || Object.keys(columnFilters).length > 0 ? "primary" : "default"}
              sx={{ border: "1px solid", borderColor: "divider" }}
            >
              <FilterListIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {Object.keys(columnFilters).length > 0 || globalSearch !== "" ? (
            <Tooltip title="Limpiar todos los filtros">
              <IconButton onClick={clearAllFilters} color="error" sx={{ border: "1px solid", borderColor: "divider" }}>
                <FilterListOffIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
        </Box>

        {/* Right: Export options */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {selected.length > 0 && (
            <Typography variant="body2" sx={{ mr: 1, fontWeight: "bold" }}>
              {selected.length} seleccionados
            </Typography>
          )}
          <ExportButton
            data={selected.length > 0 ? selected : filteredData}
            columns={exportCols}
            filename={exportFilename}
            title={exportTitle}
            size="small"
          />
        </Box>
      </Box>

      {/* Main Table Container */}
      <TableContainer component={Paper} className="zebra-table" sx={{ overflowX: "auto", borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }}>
          {/* Table Header */}
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox" sx={{ py: 1.5 }}>
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < filteredData.length}
                    checked={filteredData.length > 0 && selected.length === filteredData.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
              )}
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  align="left"
                  sx={{ py: 1.5, cursor: col.sortable ? "pointer" : "default", select: "none" }}
                  onClick={() => col.sortable && handleSort(col.id)}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography fontSize="0.875rem" fontWeight="bold">
                      {col.label}
                    </Typography>
                    {col.sortable && sortField === col.id ? (
                      sortDirection === "asc" ? (
                        <ArrowUpwardIcon fontSize="inherit" sx={{ fontSize: "0.9rem" }} />
                      ) : (
                        <ArrowDownwardIcon fontSize="inherit" sx={{ fontSize: "0.9rem" }} />
                      )
                    ) : null}
                  </Box>
                </TableCell>
              ))}
            </TableRow>

            {/* Optional Columns Filter Row */}
            {showColumnFilters && (
              <TableRow sx={{ bgcolor: "action.hover" }}>
                {selectable && <TableCell />}
                {columns.map((col) => (
                  <TableCell key={`filter-${col.id}`} sx={{ py: 1, px: 1 }}>
                    {col.filterable && (
                      <Box>
                        {col.filterType === "select" && col.filterOptions ? (
                          <FormControl fullWidth size="small">
                            <Select
                              value={columnFilters[col.id] || "ALL"}
                              onChange={(e) => handleColumnFilterChange(col.id, e.target.value)}
                              sx={{ height: 32, fontSize: "0.8rem" }}
                            >
                              <MenuItem value="ALL" sx={{ fontSize: "0.8rem" }}>
                                <em>Todos</em>
                              </MenuItem>
                              {col.filterOptions.map((opt) => (
                                <MenuItem key={opt.value} value={String(opt.value)} sx={{ fontSize: "0.8rem" }}>
                                  {opt.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        ) : col.filterType === "boolean" ? (
                          <FormControl fullWidth size="small">
                            <Select
                              value={columnFilters[col.id] || "ALL"}
                              onChange={(e) => handleColumnFilterChange(col.id, e.target.value)}
                              sx={{ height: 32, fontSize: "0.8rem" }}
                            >
                              <MenuItem value="ALL" sx={{ fontSize: "0.8rem" }}>
                                <em>Todos</em>
                              </MenuItem>
                              <MenuItem value="true" sx={{ fontSize: "0.8rem" }}>
                                Activos
                              </MenuItem>
                              <MenuItem value="false" sx={{ fontSize: "0.8rem" }}>
                                Inactivos
                              </MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          <TextField
                            fullWidth
                            size="small"
                            placeholder={`Filtrar ${col.label.toLowerCase()}...`}
                            value={columnFilters[col.id] || ""}
                            onChange={(e) => handleColumnFilterChange(col.id, e.target.value)}
                            sx={{
                              "& .MuiInputBase-root": { height: 32, fontSize: "0.8rem" }
                            }}
                          />
                        )}
                      </Box>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            )}
          </TableHead>

          {/* Table Body */}
          <TableBody>
            {loading ? (
              // Loading Skeleton state
              Array.from({ length: rowsPerPage }).map((_, rIdx) => (
                <TableRow key={`skeleton-row-${rIdx}`}>
                  {selectable && (
                    <TableCell padding="checkbox">
                      <Skeleton variant="rectangular" width={18} height={18} />
                    </TableCell>
                  )}
                  {columns.map((col, cIdx) => (
                    <TableCell key={`skeleton-cell-${rIdx}-${cIdx}`}>
                      <Skeleton variant="text" width="80%" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : paginatedData.length === 0 ? (
              // Empty State
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0)} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary">
                    No se encontraron registros.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              // Actual Data Rows
              paginatedData.map((row) => {
                const isItemSelected = isSelected(row.id);
                return (
                  <TableRow
                    hover
                    onClick={(event) => selectable && handleSelectRow(event, row)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                    sx={{ cursor: selectable ? "pointer" : "default" }}
                  >
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox checked={isItemSelected} />
                      </TableCell>
                    )}
                    {columns.map((col) => {
                      return (
                        <TableCell key={`${row.id}-${col.id}`}>
                          {col.render ? (
                            col.render(row)
                          ) : (
                            <Typography fontSize="0.875rem">
                              {String(row[col.id] ?? "")}
                            </Typography>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Bar */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
      />
    </Box>
  );
}
