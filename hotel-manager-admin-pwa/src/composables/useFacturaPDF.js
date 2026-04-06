// src/composables/useFacturaPDF.js
// Genera PDFs con jsPDF puro — sin html2canvas, sin capturas de pantalla.
// Esto garantiza que el PDF siempre salga con contenido, sin importar el navegador.

export function useFacturaPDF() {

  // Carga jsPDF desde CDN solo cuando se necesita
  async function cargarJsPDF() {
    if (window.jspdf) return
    await new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
      s.onload = resolve
      s.onerror = reject
      document.head.appendChild(s)
    })
  }

  function parsearFecha(valor) {
    if (!valor) return null
    if (Array.isArray(valor)) {
      const [y, m, d] = valor
      return new Date(y, m - 1, d)
    }
    if (typeof valor === 'string') {
      if (valor.length === 10) return new Date(valor + 'T00:00:00')
      return new Date(valor)
    }
    return new Date(valor)
  }

  function formatFecha(valor) {
    if (!valor) return '—'
    const d = parsearFecha(valor)
    if (!d || isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
  }

  function formatFechaHora(valor) {
    if (!valor) return '—'
    const d = parsearFecha(valor)
    if (!d || isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('es-CO', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  function formatPrecio(valor) {
    return Number(valor || 0).toLocaleString('es-CO', {
      minimumFractionDigits: 0, maximumFractionDigits: 0
    })
  }

  function formatFormaPago(valor) {
    const map = {
      efectivo:        'Efectivo',
      tarjeta_credito: 'Tarjeta de credito',
      tarjeta_debito:  'Tarjeta de debito',
      transferencia:   'Transferencia bancaria',
      pse:             'PSE',
      nequi:           'Nequi',
      daviplata:       'Daviplata'
    }
    return map[valor] || valor || '—'
  }

  // ─── Genera y descarga el PDF usando jsPDF puro ──────────────────────────────
  async function descargarPDF(reserva) {
    await cargarJsPDF()

    const { jsPDF } = window.jspdf
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })

    const pW  = 210   // ancho A4 en mm
    const mL  = 15    // margen izquierdo
    const mR  = 15    // margen derecho
    const cW  = pW - mL - mR  // ancho útil
    let   y   = 20   // cursor vertical

    const azul    = [37, 99, 235]
    const gris    = [100, 116, 139]
    const grisCla = [248, 250, 252]
    const negro   = [30, 41, 59]
    const azulCla = [239, 246, 255]

    const numeroFactura = 'FAC-' + new Date().getFullYear() + '-' + String(reserva.id).padStart(6, '0')
    const nombreArchivo = `Factura-HotelManager-${String(reserva.id).padStart(6, '0')}.pdf`

    // ── CABECERA ──────────────────────────────────────────────────────────────
    // Línea azul superior
    doc.setFillColor(...azul)
    doc.rect(0, 0, pW, 3, 'F')

    // Logo / nombre hotel
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...azul)
    doc.text('Hotel Manager', mL, y + 6)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...gris)
    doc.text('Cali, Valle del Cauca — Colombia', mL, y + 12)
    doc.text('NIT: 900.123.456-7  |  Tel: (2) 123-4567', mL, y + 17)

    // Número de factura (derecha)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...gris)
    doc.text('FACTURA DE VENTA', pW - mR, y, { align: 'right' })

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...negro)
    doc.text(numeroFactura, pW - mR, y + 8, { align: 'right' })

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...gris)
    doc.text('Emitida: ' + formatFechaHora(reserva.createdAt), pW - mR, y + 14, { align: 'right' })

    // Línea divisora
    y += 24
    doc.setDrawColor(...azul)
    doc.setLineWidth(0.5)
    doc.line(mL, y, pW - mR, y)
    y += 8

    // ── DATOS DEL HUÉSPED ─────────────────────────────────────────────────────
    // Fondo gris claro
    doc.setFillColor(...grisCla)
    doc.roundedRect(mL, y, cW, 32, 2, 2, 'F')

    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...gris)
    doc.text('DATOS DEL HUESPED', mL + 5, y + 6)

    // Columna izquierda
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...gris)
    doc.text('Nombre completo', mL + 5, y + 13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...negro)
    doc.text(
      ((reserva.nombreHuesped || '') + ' ' + (reserva.apellidoHuesped || '')).trim() || '—',
      mL + 5, y + 18
    )

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...gris)
    doc.text('Email', mL + 5, y + 25)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...negro)
    doc.text(reserva.emailHuesped || '—', mL + 5, y + 30)

    // Columna derecha
    const colD = mL + cW / 2 + 5
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...gris)
    doc.text('Telefono', colD, y + 13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...negro)
    doc.text(reserva.telefonoHuesped || '—', colD, y + 18)

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...gris)
    doc.text('N\u00b0 de reserva', colD, y + 25)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...azul)
    doc.text('#' + reserva.id, colD, y + 30)

    y += 40

    // ── DETALLE DE LA ESTADÍA ─────────────────────────────────────────────────
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...gris)
    doc.text('DETALLE DE LA ESTADIA', mL, y)
    y += 5

    // Encabezado tabla
    doc.setFillColor(241, 245, 249)
    doc.rect(mL, y, cW, 8, 'F')

    const cols = {
      desc:    mL + 2,
      checkin: mL + 60,
      checkout:mL + 95,
      noches:  mL + 130,
      pnoche:  mL + 148,
      total:   mL + cW - 2
    }

    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...gris)
    doc.text('DESCRIPCION',  cols.desc,    y + 5)
    doc.text('CHECK-IN',     cols.checkin, y + 5)
    doc.text('CHECK-OUT',    cols.checkout,y + 5)
    doc.text('NOCHES',       cols.noches,  y + 5, { align: 'center' })
    doc.text('P/NOCHE',      cols.pnoche,  y + 5, { align: 'right' })
    doc.text('TOTAL',        cols.total,   y + 5, { align: 'right' })
    y += 8

    // Fila de datos
    const precioPorNoche = reserva.noches > 0
      ? Math.round(Number(reserva.valorTotal) / reserva.noches)
      : Number(reserva.valorTotal)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...negro)
    doc.text(
      (reserva.tipoHabitacion || '') + ' — Hab. ' + (reserva.numeroHabitacion || ''),
      cols.desc, y + 6
    )

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(71, 85, 105)
    doc.text(formatFecha(reserva.fechaEntrada),  cols.checkin,  y + 6)
    doc.text(formatFecha(reserva.fechaSalida),   cols.checkout, y + 6)

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...negro)
    doc.text(String(reserva.noches || 0), cols.noches, y + 6, { align: 'center' })

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(71, 85, 105)
    doc.text('$' + formatPrecio(precioPorNoche), cols.pnoche, y + 6, { align: 'right' })

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...azul)
    doc.text('$' + formatPrecio(reserva.valorTotal), cols.total, y + 6, { align: 'right' })

    y += 8
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.3)
    doc.line(mL, y, pW - mR, y)
    y += 10

    // ── TOTAL Y FORMA DE PAGO ─────────────────────────────────────────────────
    doc.setFillColor(...azulCla)
    doc.setDrawColor(191, 219, 254)
    doc.setLineWidth(0.4)
    doc.roundedRect(mL, y, cW, 22, 2, 2, 'FD')

    // Forma de pago (izquierda)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...gris)
    doc.text('Forma de pago', mL + 5, y + 8)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...negro)
    doc.text(formatFormaPago(reserva.formaPago), mL + 5, y + 16)

    // Total (derecha)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...gris)
    doc.text('TOTAL FACTURADO', pW - mR - 2, y + 7, { align: 'right' })
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...azul)
    doc.text('$' + formatPrecio(reserva.valorTotal), pW - mR - 2, y + 18, { align: 'right' })

    y += 30

    // ── PIE ───────────────────────────────────────────────────────────────────
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.3)
    doc.line(mL, y, pW - mR, y)
    y += 6

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...gris)
    doc.text('Gracias por hospedarse en Hotel Manager', pW / 2, y, { align: 'center' })
    y += 5
    doc.text(
      'Este documento es valido como soporte contable  \u00b7  ' + numeroFactura,
      pW / 2, y, { align: 'center' }
    )
    y += 5
    doc.setTextColor(203, 213, 225)
    doc.text(
      'Generado el ' + new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' }),
      pW / 2, y, { align: 'center' }
    )

    // Línea azul inferior
    doc.setFillColor(...azul)
    doc.rect(0, 294, pW, 3, 'F')

    doc.save(nombreArchivo)
  }

  // ─── Preview en modal (sigue usando HTML para la vista en pantalla) ──────────
  function obtenerHTMLPreview(reserva) {
    const precioPorNoche = reserva.noches > 0
      ? Math.round(Number(reserva.valorTotal) / reserva.noches)
      : Number(reserva.valorTotal)

    const numeroFactura = 'FAC-' + new Date().getFullYear() + '-' + String(reserva.id).padStart(6, '0')
    const hoy = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })

    return `
<div style="width:100%;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#1e293b;background:#fff;padding:32px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;padding-bottom:16px;border-bottom:3px solid #2563eb;">
    <tr>
      <td style="vertical-align:top;">
        <div style="font-size:22px;font-weight:900;color:#2563eb;margin-bottom:4px;">Hotel Manager</div>
        <div style="font-size:11px;color:#64748b;line-height:1.8;">Cali, Valle del Cauca — Colombia<br>NIT: 900.123.456-7 | Tel: (2) 123-4567</div>
      </td>
      <td style="vertical-align:top;text-align:right;">
        <div style="font-size:9px;font-weight:700;letter-spacing:2px;color:#94a3b8;text-transform:uppercase;margin-bottom:4px;">Factura de Venta</div>
        <div style="font-size:18px;font-weight:900;color:#1e293b;margin-bottom:3px;">${numeroFactura}</div>
        <div style="font-size:11px;color:#64748b;">Emitida: ${formatFechaHora(reserva.createdAt)}</div>
      </td>
    </tr>
  </table>
  <div style="background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:20px;">
    <div style="font-size:9px;font-weight:700;letter-spacing:2px;color:#94a3b8;text-transform:uppercase;margin-bottom:12px;">Datos del Huésped</div>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td width="50%" style="padding-bottom:10px;vertical-align:top;">
          <div style="font-size:10px;color:#94a3b8;margin-bottom:2px;">Nombre completo</div>
          <div style="font-size:13px;font-weight:700;color:#1e293b;">${reserva.nombreHuesped || ''} ${reserva.apellidoHuesped || ''}</div>
        </td>
        <td width="50%" style="padding-bottom:10px;vertical-align:top;">
          <div style="font-size:10px;color:#94a3b8;margin-bottom:2px;">Teléfono</div>
          <div style="font-size:13px;font-weight:700;color:#1e293b;">${reserva.telefonoHuesped || '—'}</div>
        </td>
      </tr>
      <tr>
        <td width="50%" style="vertical-align:top;">
          <div style="font-size:10px;color:#94a3b8;margin-bottom:2px;">Email</div>
          <div style="font-size:13px;font-weight:700;color:#1e293b;">${reserva.emailHuesped || '—'}</div>
        </td>
        <td width="50%" style="vertical-align:top;">
          <div style="font-size:10px;color:#94a3b8;margin-bottom:2px;">N° de reserva</div>
          <div style="font-size:13px;font-weight:700;color:#2563eb;">#${reserva.id}</div>
        </td>
      </tr>
    </table>
  </div>
  <div style="font-size:9px;font-weight:700;letter-spacing:2px;color:#94a3b8;text-transform:uppercase;margin-bottom:10px;">Detalle de la Estadía</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px;">
    <thead>
      <tr style="background:#f1f5f9;">
        <th style="text-align:left;padding:9px 10px;font-size:9px;font-weight:700;color:#64748b;text-transform:uppercase;">Descripción</th>
        <th style="text-align:center;padding:9px 6px;font-size:9px;font-weight:700;color:#64748b;text-transform:uppercase;">Check-in</th>
        <th style="text-align:center;padding:9px 6px;font-size:9px;font-weight:700;color:#64748b;text-transform:uppercase;">Check-out</th>
        <th style="text-align:center;padding:9px 6px;font-size:9px;font-weight:700;color:#64748b;text-transform:uppercase;">Noches</th>
        <th style="text-align:right;padding:9px 6px;font-size:9px;font-weight:700;color:#64748b;text-transform:uppercase;">P/Noche</th>
        <th style="text-align:right;padding:9px 10px;font-size:9px;font-weight:700;color:#64748b;text-transform:uppercase;">Total</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:12px 10px;font-weight:600;color:#1e293b;">${reserva.tipoHabitacion} — Hab. ${reserva.numeroHabitacion}</td>
        <td style="padding:12px 6px;text-align:center;color:#475569;">${formatFecha(reserva.fechaEntrada)}</td>
        <td style="padding:12px 6px;text-align:center;color:#475569;">${formatFecha(reserva.fechaSalida)}</td>
        <td style="padding:12px 6px;text-align:center;font-weight:700;color:#1e293b;">${reserva.noches}</td>
        <td style="padding:12px 6px;text-align:right;color:#475569;">$${formatPrecio(precioPorNoche)}</td>
        <td style="padding:12px 10px;text-align:right;font-weight:800;color:#2563eb;">$${formatPrecio(reserva.valorTotal)}</td>
      </tr>
    </tbody>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;margin-bottom:20px;">
    <tr>
      <td style="padding:14px 18px;vertical-align:middle;">
        <div style="font-size:10px;color:#64748b;margin-bottom:3px;">Forma de pago</div>
        <div style="font-size:14px;font-weight:700;color:#1e293b;">${formatFormaPago(reserva.formaPago)}</div>
      </td>
      <td style="padding:14px 18px;text-align:right;vertical-align:middle;">
        <div style="font-size:9px;font-weight:700;letter-spacing:2px;color:#64748b;text-transform:uppercase;margin-bottom:3px;">Total Facturado</div>
        <div style="font-size:28px;font-weight:900;color:#2563eb;">$${formatPrecio(reserva.valorTotal)}</div>
      </td>
    </tr>
  </table>
  <div style="text-align:center;padding-top:16px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:10px;line-height:2;">
    <div>Gracias por hospedarse en Hotel Manager</div>
    <div>Este documento es válido como soporte contable · ${numeroFactura}</div>
    <div style="color:#cbd5e1;font-size:9px;">Generado el ${hoy}</div>
  </div>
</div>`
  }

  return {
    descargarPDF,
    obtenerHTMLPreview,
    formatFecha,
    formatPrecio,
    formatFormaPago,
    parsearFecha
  }
}