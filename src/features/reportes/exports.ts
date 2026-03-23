import { IngresoMensual, ClienteMoroso } from "./types"

// ─── PDF Export ────────────────────────────────────────────────────────────────
export async function exportarPDF(
  ingresos: IngresoMensual[],
  morosos: ClienteMoroso[],
  pendientes: ClienteMoroso[]
) {
  const { default: jsPDF } = await import("jspdf")
  const { default: autoTable } = await import("jspdf-autotable")

  const doc = new jsPDF()
  const fechaActual = new Date().toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const anio = new Date().getFullYear()

  // ── Encabezado ──
  doc.setFillColor(16, 185, 129) // emerald-500
  doc.rect(0, 0, 210, 28, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text("Acueducto San Francisco — Reporte General", 14, 12)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`Generado el ${fechaActual}`, 14, 22)

  doc.setTextColor(30, 41, 59) // slate-800

  // ── Sección 1: Ingresos mensuales ──
  doc.setFontSize(13)
  doc.setFont("helvetica", "bold")
  doc.text(`Ingresos vs Proyectado — ${anio}`, 14, 40)

  autoTable(doc, {
    startY: 46,
    head: [["Mes", "Recaudado ($)", "Proyectado ($)", "Diferencia ($)"]],
    body: ingresos.map((row) => [
      row.mes,
      row.ingreso.toLocaleString("es-CO"),
      row.proyectado.toLocaleString("es-CO"),
      (row.ingreso - row.proyectado).toLocaleString("es-CO"),
    ]),
    headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [240, 253, 244] },
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "right" },
    },
  })

  // ── Sección 2: Clientes con Deuda Vencida ──
  let finalY = (doc as any).lastAutoTable.finalY + 14

  doc.setFontSize(13)
  doc.setFont("helvetica", "bold")
  doc.text("Todos los Usuarios con Facturas Vencidas", 14, finalY)

  autoTable(doc, {
    startY: finalY + 6,
    head: [["Cliente", "Facturas Vencidas", "Total Deuda Vencida ($)"]],
    body: morosos.map((m) => [
      m.nombre,
      m.facturas_pendientes.toString(),
      m.total_deuda.toLocaleString("es-CO"),
    ]),
    headStyles: { fillColor: [239, 68, 68], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [255, 241, 242] },
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      1: { halign: "center" },
      2: { halign: "right" },
    },
  })

  // ── Sección 3: Clientes con Facturas Pendientes (No Vencidas) ──
  finalY = (doc as any).lastAutoTable.finalY + 14

  doc.setFontSize(13)
  doc.setFont("helvetica", "bold")
  doc.text("Todos los Usuarios Pendientes (Al Día)", 14, finalY)

  autoTable(doc, {
    startY: finalY + 6,
    head: [["Cliente", "Facturas Pendientes", "Total Deuda Pendiente ($)"]],
    body: pendientes.map((p) => [
      p.nombre,
      p.facturas_pendientes.toString(),
      p.total_deuda.toLocaleString("es-CO"),
    ]),
    headStyles: { fillColor: [245, 158, 11], textColor: 255, fontStyle: "bold" }, // amber-500
    alternateRowStyles: { fillColor: [255, 251, 235] }, // amber-50
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      1: { halign: "center" },
      2: { halign: "right" },
    },
  })

  // ── Pie de página ──
  const pageCount = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.text(
      `Página ${i} de ${pageCount} — Acueducto San Francisco`,
      105,
      doc.internal.pageSize.height - 8,
      { align: "center" }
    )
  }

  doc.save(`reporte-acueducto-${anio}.pdf`)
}

// ─── Excel Export ──────────────────────────────────────────────────────────────
export async function exportarExcel(
  ingresos: IngresoMensual[],
  morosos: ClienteMoroso[],
  pendientes: ClienteMoroso[]
) {
  const XLSX = await import("xlsx")
  const anio = new Date().getFullYear()
  const wb = XLSX.utils.book_new()

  // ── Hoja 1: Ingresos mensuales ──
  const ingresosData = [
    ["Mes", "Recaudado ($)", "Proyectado ($)", "Diferencia ($)"],
    ...ingresos.map((row) => [
      row.mes,
      row.ingreso,
      row.proyectado,
      row.ingreso - row.proyectado,
    ]),
    [],
    ["Total", `=SUM(B2:B${ingresos.length + 1})`, `=SUM(C2:C${ingresos.length + 1})`, `=SUM(D2:D${ingresos.length + 1})`],
  ]

  const wsIngresos = XLSX.utils.aoa_to_sheet(ingresosData)
  wsIngresos["!cols"] = [{ wch: 10 }, { wch: 18 }, { wch: 18 }, { wch: 18 }]
  XLSX.utils.book_append_sheet(wb, wsIngresos, "Ingresos Mensuales")

  // ── Hoja 2: Morosos ──
  const morososData = [
    ["Cliente", "Facturas Vencidas", "Total Deuda Vencida ($)"],
    ...morosos.map((m) => [m.nombre, m.facturas_pendientes, m.total_deuda]),
    [],
    ["Total deuda", "", `=SUM(C2:C${morosos.length + 1})`],
  ]

  const wsMorosos = XLSX.utils.aoa_to_sheet(morososData)
  wsMorosos["!cols"] = [{ wch: 30 }, { wch: 20 }, { wch: 22 }]
  XLSX.utils.book_append_sheet(wb, wsMorosos, "Usuarios Vencidos")

  // ── Hoja 3: Pendientes ──
  const pendientesData = [
    ["Cliente", "Facturas Pendientes", "Total Deuda Pendiente ($)"],
    ...pendientes.map((p) => [p.nombre, p.facturas_pendientes, p.total_deuda]),
    [],
    ["Total deuda", "", `=SUM(C2:C${pendientes.length + 1})`],
  ]

  const wsPendientes = XLSX.utils.aoa_to_sheet(pendientesData)
  wsPendientes["!cols"] = [{ wch: 30 }, { wch: 20 }, { wch: 24 }]
  XLSX.utils.book_append_sheet(wb, wsPendientes, "Usuarios Pendientes")

  XLSX.writeFile(wb, `reporte-acueducto-${anio}.xlsx`)
}