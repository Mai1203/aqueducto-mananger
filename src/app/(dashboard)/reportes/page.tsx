"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Download, TrendingUp, Loader2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useReportes } from "@/features/reportes/hooks"
import { exportarPDF, exportarExcel, generarFacturaEmpresarialPDF } from "@/features/reportes/exports"
import { getReportePendientesYMorosos, getFacturasPendientesPorMatricula } from "@/features/reportes/services"
import { useAuth } from "@/features/auth/AuthContext"
import { useMatriculas } from "@/features/matriculas/hooks"
import { useUsuarios } from "@/features/usuarios/hooks"
import { useToast } from "@/components/ui/toast"
import { Modal } from "@/components/ui/modal"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import Loading from "./loading";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-lg text-sm">
        <p className="font-semibold text-slate-700 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name === "ingreso" ? "Recaudado" : "Proyectado"}:{" "}
            <span className="font-bold">${p.value.toLocaleString("es-CO")}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function ReportesPage() {
  const { ingresos, morosos, loading, error } = useReportes()
  const { role } = useAuth()
  const { matriculas } = useMatriculas()
  const { usuarios } = useUsuarios()
  const { toast } = useToast()
  const [exportandoPDF, setExportandoPDF] = useState(false)
  const [exportandoExcel, setExportandoExcel] = useState(false)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [generandoFactura, setGenerandoFactura] = useState(false)
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState("")
  const [matriculaSeleccionada, setMatriculaSeleccionada] = useState("")
  const [busquedaUsuario, setBusquedaUsuario] = useState("")
  const [destinatario, setDestinatario] = useState("")

  const handleExportPDF = async () => {
    setExportandoPDF(true)
    try {
      const { morosos: todosMorosos, pendientes: todosPendientes } = await getReportePendientesYMorosos()
      await exportarPDF(ingresos, todosMorosos, todosPendientes)
    } finally {
      setExportandoPDF(false)
    }
  }

  const handleExportExcel = async () => {
    setExportandoExcel(true)
    try {
      const { morosos: todosMorosos, pendientes: todosPendientes } = await getReportePendientesYMorosos()
      await exportarExcel(ingresos, todosMorosos, todosPendientes)
    } finally {
      setExportandoExcel(false)
    }
  }

  const handleGenerarFacturaEmpresarial = async () => {
    if (!matriculaSeleccionada) {
      toast({ type: "warning", title: "Selecciona una matrícula", description: "Debes elegir una matrícula para generar la factura." })
      return
    }

    setGenerandoFactura(true)
    try {
      const facturas = await getFacturasPendientesPorMatricula(matriculaSeleccionada)

      if (facturas.length === 0) {
        toast({ type: "warning", title: "Sin facturas pendientes", description: "Esta matrícula no tiene facturas pendientes para generar." })
        return
      }

      const matricula = matriculas.find((m) => m.id === matriculaSeleccionada)
      const clienteNombre = destinatario.trim() || matricula?.cliente?.nombre || usuarios.find((u) => u.id === matricula?.cliente_id)?.nombre || "Cliente sin nombre"
      const numeroMatricula = matricula?.numero_matricula || "Sin número"

      const total = facturas.reduce((sum, f) => sum + Number(f.total), 0)

      await generarFacturaEmpresarialPDF({
        destinatario: clienteNombre,
        numero_matricula: numeroMatricula,
        facturas,
        total,
      })

      toast({ type: "success", title: "Factura generada", description: "El documento PDF se ha descargado correctamente." })
      setModalAbierto(false)
      setUsuarioSeleccionado("")
      setMatriculaSeleccionada("")
      setBusquedaUsuario("")
      setDestinatario("")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al generar la factura empresarial."
      toast({ type: "error", title: "Error", description: msg })
    } finally {
      setGenerandoFactura(false)
    }
  }

  if (loading) return <Loading />;

  if (error) {
    return <div className="p-8 text-red-500 text-sm">Error: {error}</div>
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Reportes
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Analíticas y exportación de datos del acueducto.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleExportPDF}
            disabled={exportandoPDF || ingresos.length === 0}
          >
            {exportandoPDF
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Download className="w-4 h-4" />
            }
            Exportar PDF
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleExportExcel}
            disabled={exportandoExcel || ingresos.length === 0}
          >
            {exportandoExcel
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Download className="w-4 h-4" />
            }
            Exportar Excel
          </Button>
          {role === "admin" && (
            <Button
              className="gap-2"
              onClick={() => setModalAbierto(true)}
            >
              <FileText className="w-4 h-4" />
              Generar Factura Empresarial
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold text-slate-900">
              Ingresos vs Proyectado
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            {ingresos.length === 0 ? (
              <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200 mt-4">
                <span className="text-sm text-slate-400 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Sin datos disponibles
                </span>
              </div>
            ) : (
              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ingresos} barCategoryGap="30%" barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} width={45} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
                    <Legend formatter={(value) => value === "ingreso" ? "Recaudado" : "Proyectado"} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: "#64748b" }} />
                    <Bar dataKey="proyectado" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="ingreso" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900">
              Top 5 Morosos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {morosos.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-sm text-slate-400">
                No hay facturas vencidas
              </div>
            ) : (
              <div className="space-y-3">
                {morosos.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-red-50/50 rounded-lg border border-red-100">
                    <div>
                      <p className="font-medium text-slate-900">{item.nombre}</p>
                      <p className="text-xs text-rose-600">
                        {item.facturas_pendientes}{" "}
                        {item.facturas_pendientes === 1 ? "factura vencida" : "facturas vencidas"}
                      </p>
                    </div>
                    <div className="font-bold text-slate-900">
                      ${item.total_deuda.toLocaleString("es-CO")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={modalAbierto} onClose={() => { setModalAbierto(false); setUsuarioSeleccionado(""); setMatriculaSeleccionada(""); setBusquedaUsuario(""); }} title="Generar Factura Empresarial">
        <div className="space-y-4">
          {!usuarioSeleccionado ? (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Buscar usuario</label>
                <input
                  type="text"
                  placeholder="Escribe el nombre del usuario..."
                  className="w-full h-10 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-shadow"
                  value={busquedaUsuario}
                  onChange={(e) => setBusquedaUsuario(e.target.value)}
                />
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1 border border-slate-200 rounded-lg">
                {usuarios
                  .filter((u) => u.nombre.toLowerCase().includes(busquedaUsuario.toLowerCase()))
                  .map((u) => (
                    <button
                      key={u.id}
                      onClick={() => { setUsuarioSeleccionado(u.id); setBusquedaUsuario(""); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-sky-50 hover:text-sky-700 transition-colors border-b border-slate-100 last:border-b-0"
                    >
                      {u.nombre}
                    </button>
                  ))}
                {usuarios.filter((u) => u.nombre.toLowerCase().includes(busquedaUsuario.toLowerCase())).length === 0 && (
                  <p className="text-xs text-slate-400 px-3 py-2">No se encontraron usuarios</p>
                )}
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dirigido a</label>
                <input
                  type="text"
                  placeholder="Nombre del destinatario o empresa..."
                  className="w-full h-10 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-shadow"
                  value={destinatario}
                  onChange={(e) => setDestinatario(e.target.value)}
                />
                <p className="text-xs text-slate-400 mt-1">Si lo dejas vacío, se usará el nombre del usuario registrado.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Matrícula</label>
                <select
                  className="w-full h-10 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-shadow"
                  value={matriculaSeleccionada}
                  onChange={(e) => setMatriculaSeleccionada(e.target.value)}
                >
                  <option value="">Seleccione una matrícula</option>
                  {matriculas
                    .filter((m) => m.cliente_id === usuarioSeleccionado)
                    .map((mat) => (
                      <option key={mat.id} value={mat.id}>
                        #{mat.numero_matricula} - {mat.direccion_lote || "Sin dirección"}
                      </option>
                    ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">Se generará un documento con todas las facturas pendientes de la matrícula seleccionada.</p>
              </div>
              <div className="flex justify-between gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => { setUsuarioSeleccionado(""); setMatriculaSeleccionada(""); }}>
                  Volver
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => { setModalAbierto(false); setUsuarioSeleccionado(""); setMatriculaSeleccionada(""); setBusquedaUsuario(""); setDestinatario(""); }}>
                    Cancelar
                  </Button>
                  <Button onClick={handleGenerarFacturaEmpresarial} disabled={generandoFactura || !matriculaSeleccionada}>
                    {generandoFactura ? "Generando..." : "Generar PDF"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  )
}