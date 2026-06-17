import React from "react";
import { Card, CardContent, Box, Typography, Avatar, useTheme } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";

interface KpiCardProps {
  title: string;
  value: string | number;
  trend?: number; // e.g. 12.5 for +12.5%
  trendDirection?: "up" | "down" | "neutral";
  color?: string; // hex or theme color name
  icon?: React.ReactNode;
  sparklineData?: number[];
}

export function KpiCardAdvanced({
  title,
  value,
  trend,
  trendDirection = "neutral",
  color = "#6366f1",
  icon,
  sparklineData = [10, 15, 8, 12, 22, 18, 25]
}: KpiCardProps) {
  const theme = useTheme();
  
  // Parse trend details
  const isUp = trendDirection === "up";
  const isDown = trendDirection === "down";
  const isNeutral = trendDirection === "neutral";

  const trendColor = isUp 
    ? theme.palette.success.main 
    : isDown 
      ? theme.palette.error.main 
      : theme.palette.text.secondary;

  const trendIcon = isUp 
    ? <TrendingUpIcon fontSize="small" /> 
    : isDown 
      ? <TrendingDownIcon fontSize="small" /> 
      : <TrendingFlatIcon fontSize="small" />;

  // Render SVG Sparkline
  const generateSparklinePath = (data: number[]) => {
    if (data.length < 2) return "";
    const width = 100;
    const height = 30;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min === 0 ? 1 : max - min;

    const points = data.map((val, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2; // leave margin
      return `${x},${y}`;
    });

    return `M ${points.join(" L ")}`;
  };

  return (
    <Card 
      sx={{ 
        position: "relative", 
        overflow: "hidden", 
        height: "100%",
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "4px",
          height: "100%",
          bgcolor: color
        }
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Box>
            <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="h3" fontWeight={800} color="text.primary">
              {value}
            </Typography>
          </Box>
          {icon && (
            <Avatar 
              sx={{ 
                bgcolor: (theme) => theme.palette.mode === "light" ? `${color}15` : `${color}30`, 
                color: color,
                width: 44,
                height: 44
              }}
            >
              {icon}
            </Avatar>
          )}
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {/* Trend Tag */}
          {trend !== undefined && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: trendColor }}>
              {trendIcon}
              <Typography variant="caption" fontWeight="bold">
                {isUp ? "+" : ""}{trend}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                vs. mes anterior
              </Typography>
            </Box>
          )}

          {/* Sparkline Visual */}
          {sparklineData && sparklineData.length > 0 && (
            <Box sx={{ width: 80, height: 30, display: "flex", alignItems: "center" }}>
              <svg width="100%" height="100%" viewBox="0 0 100 30">
                <path
                  d={generateSparklinePath(sparklineData)}
                  fill="none"
                  stroke={color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
