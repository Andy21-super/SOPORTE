import React from "react";
import { Box, Chip } from "@mui/material";

interface StatusChipProps {
  label: string;
  color: string;
}

export function StatusChip({ label, color }: StatusChipProps) {
  // Helper to parse hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    // If not valid hex, return fallback
    if (!hex || !hex.startsWith("#")) return `rgba(100, 116, 139, ${alpha})`;
    
    let cleaned = hex.slice(1);
    if (cleaned.length === 3) {
      cleaned = cleaned[0] + cleaned[0] + cleaned[1] + cleaned[1] + cleaned[2] + cleaned[2];
    }
    const r = parseInt(cleaned.slice(0, 2), 16);
    const g = parseInt(cleaned.slice(2, 4), 16);
    const b = parseInt(cleaned.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const isHex = color && color.startsWith("#");
  const bg = isHex ? hexToRgba(color, 0.12) : "rgba(100, 116, 139, 0.12)";
  const text = isHex ? color : "#64748b";

  return (
    <Chip
      size="small"
      label={label}
      sx={{
        bgcolor: bg,
        color: text,
        fontWeight: 600,
        fontSize: "0.75rem",
        borderRadius: "6px",
        border: `1px solid ${isHex ? hexToRgba(color, 0.2) : "rgba(100, 116, 139, 0.2)"}`,
        height: "24px",
        "& .MuiChip-label": {
          px: 1,
          display: "flex",
          alignItems: "center",
          gap: 1
        }
      }}
      icon={
        <Box
          className="animate-pulse-dot"
          sx={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            bgcolor: text,
            display: "inline-block",
            ml: 1
          }}
        />
      }
    />
  );
}
