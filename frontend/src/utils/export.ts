import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

export interface ExportColumn {
  header: string;
  key: string;
}

async function imageToDataUrl(url: string) {
  const response = await fetch(url);
  const blob = await response.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function exportToExcel(data: any[], columns: ExportColumn[], filename: string) {
  const wsData = data.map((item) => {
    const row: any = {};
    columns.forEach((col) => {
      row[col.header] = item[col.key];
    });
    return row;
  });

  const ws = XLSX.utils.json_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Datos");

  // Generate buffer and trigger download
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportToCsv(data: any[], columns: ExportColumn[], filename: string) {
  const headers = columns.map((col) => `"${col.header.replaceAll('"', '""')}"`).join(",");
  
  const rows = data.map((item) =>
    columns
      .map((col) => {
        const val = item[col.key];
        return `"${String(val ?? "").replaceAll('"', '""')}"`;
      })
      .join(",")
  );

  const csvContent = "\uFEFF" + [headers, ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function exportToPdf(data: any[], columns: ExportColumn[], filename: string, title: string, options?: { logoUrl?: string; companyName?: string }) {
  const doc = new jsPDF() as any;

  if (options?.logoUrl) {
    try {
      const logoData = await imageToDataUrl(options.logoUrl);
      doc.addImage(logoData, options.logoUrl.toLowerCase().includes(".png") ? "PNG" : "JPEG", 14, 10, 18, 18);
    } catch {
      // El reporte se genera aunque el navegador bloquee la imagen.
    }
  }

  // Header Style
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(title, options?.logoUrl ? 36 : 14, 22);

  // Metadata
  const user = localStorage.getItem("user") 
    ? JSON.parse(localStorage.getItem("user")!) 
    : { email: "usuario@empresa.com" };

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Fecha de Generación: ${new Date().toLocaleString()}`, 14, 30);
  doc.text(`Usuario: ${user.firstName ? `${user.firstName} ${user.lastName}` : user.email}`, 14, 35);

  // Accent line
  doc.setDrawColor(79, 70, 229); // Indigo line
  doc.setLineWidth(1);
  doc.line(14, 38, 196, 38);

  const headers = columns.map((col) => col.header);
  const rows = data.map((item) => columns.map((col) => String(item[col.key] ?? "")));

  doc.autoTable({
    head: [headers],
    body: rows,
    startY: 42,
    theme: "striped",
    headStyles: {
      fillColor: [79, 70, 229], // indigo primary
      textColor: [255, 255, 255],
      fontStyle: "bold"
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // slate-50
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
      font: "helvetica"
    },
    didDrawPage: (pageData: any) => {
      const pageCount = doc.internal.getNumberOfPages();
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate-400
      
      // Footer page numbering
      const footerText = `Página ${pageData.pageNumber} de ${pageCount}`;
      doc.text(footerText, 14, pageHeight - 10);
      doc.text(options?.companyName ?? "SISTEMA DE SOPORTE ENTERPRISE", pageSize.width - 65, pageHeight - 10);
    }
  });

  doc.save(`${filename}.pdf`);
}
