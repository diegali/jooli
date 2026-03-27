// js/events/events-avisos.js

import { formatDate } from "./events-utils.js";

export function initAvisos({ mostrarAvisoSimple, onConfirmarRealizacion }) {

  let eventoPendienteConfirmacion = null;
  let modalConfirmacionAbierto = false;

  // ===============================
  // CONFIRMACIÓN DE REALIZACIÓN
  // ===============================
  function abrirModalConfirmarRealizacion(evento) {
    const modal = document.getElementById("modalConfirmarRealizacion");
    const texto = document.getElementById("textoConfirmarRealizacion");
    if (!modal || !texto) return;

    eventoPendienteConfirmacion = evento;
    modalConfirmacionAbierto = true;

    texto.innerHTML = `
      El evento de <strong>${evento.client || "sin cliente"}</strong><br>
      del <strong>${formatDate(evento.date)}</strong> ya pasó.<br><br>
      ¿Se realizó este evento?
    `;

    modal.style.display = "flex";
  }

  function cerrarModalConfirmarRealizacion() {
    const modal = document.getElementById("modalConfirmarRealizacion");
    if (!modal) return;

    modal.style.display = "none";
    eventoPendienteConfirmacion = null;
    modalConfirmacionAbierto = false;

    verificarAvisosPendientes(window.allEventsData || []);
  }

  // ===============================
  // VERIFICACIONES
  // ===============================
  function verificarEventosPasados(events) {
    if (modalConfirmacionAbierto) return;

    const today = new Date().toLocaleDateString("sv").split("T")[0];

    for (const evento of events) {
      const yaPaso = evento.date && evento.date < today;
      const yaConfirmado = evento.realizacionConfirmada === true;
      const yaRealizado = evento.status === "Realizado";
      const yaCancelado = evento.status === "Cancelado";

      if (yaPaso && !yaConfirmado && !yaRealizado && !yaCancelado) {
        abrirModalConfirmarRealizacion(evento);
        break;
      }
    }
  }

  function verificarAvisosPendientes(events) {
    const today = new Date().toLocaleDateString("sv").split("T")[0];
    const en3dias = new Date();
    en3dias.setDate(en3dias.getDate() + 3);
    const limite = en3dias.toLocaleDateString("sv").split("T")[0];

    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    const fechaManana = manana.toLocaleDateString("sv").split("T")[0];

    const staffCriticos = events.filter(e => {
      if (e.date < today || e.date > limite) return false;
      if (e.status === "Cancelado") return false;
      const staffNecesario = Number(e.staffNecesario || 0);
      if (staffNecesario === 0) return false;
      const asignados = (e.mensajesEnviados || []).filter(
        m => (m.estado || "pendiente") !== "rechazado"
      ).length;
      return asignados < staffNecesario;
    });

    const checklistCriticos = events.filter(e => {
      if (e.date !== fechaManana) return false;
      if (e.status === "Cancelado") return false;
      const checklist = e.checklist || [];
      return checklist.length === 0 || checklist.some(item => !item.preparado);
    });

    if (staffCriticos.length === 0 && checklistCriticos.length === 0) return;

    let mensaje = "";

    if (staffCriticos.length > 0) {
      mensaje += `<strong>👥 Staff incompleto:</strong><br>`;
      mensaje += staffCriticos.map(e => {
        const asignados = (e.mensajesEnviados || []).filter(
          m => (m.estado || "pendiente") !== "rechazado"
        ).length;
        const faltan = Number(e.staffNecesario) - asignados;
        const fecha = new Date(e.date + "T00:00:00").toLocaleDateString("es-AR");
        return `• ${fecha} · ${e.client} — faltan <strong>${faltan} mozo${faltan > 1 ? "s" : ""}</strong>`;
      }).join("<br>");
    }

    if (checklistCriticos.length > 0) {
      if (mensaje) mensaje += "<br><br>";
      mensaje += `<strong>📦 Checklist pendiente para mañana:</strong><br>`;
      mensaje += checklistCriticos.map(e => {
        const checklist = e.checklist || [];
        const fecha = new Date(e.date + "T00:00:00").toLocaleDateString("es-AR");
        if (checklist.length === 0) {
          return `• ${fecha} · ${e.client} — sin checklist armado`;
        }
        const pendientes = checklist.filter(item => !item.preparado).length;
        return `• ${fecha} · ${e.client} — <strong>${pendientes} ítem${pendientes > 1 ? "s" : ""} sin preparar</strong>`;
      }).join("<br>");
    }

    mostrarAvisoSimple("Recordatorios", mensaje, "🔔");
  }

  // ===============================
  // GRÁFICO
  // ===============================
  function actualizarGrafico(events) {
    const canvas = document.getElementById("chartEventosMes");
    if (!canvas) return;

    const conteo = {};
    events
      .filter(e => e.status !== "Cancelado")
      .forEach(e => {
        if (!e.date) return;
        const mes = e.date.substring(0, 7);
        conteo[mes] = (conteo[mes] || 0) + 1;
      });

    const mesesOrdenados = Object.keys(conteo).sort();
    const nombres = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const labels = mesesOrdenados.map(m => {
      const [anio, mes] = m.split("-");
      return `${nombres[parseInt(mes) - 1]} ${anio}`;
    });
    const datos = mesesOrdenados.map(m => conteo[m]);

    if (window._chartEventos) window._chartEventos.destroy();

    window._chartEventos = new Chart(canvas, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Eventos",
          data: datos,
          backgroundColor: "#d4af37",
          borderRadius: 6,
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
      },
    });
  }

  // ===============================
  // INICIALIZAR BOTONES
  // ===============================
  function initBotonesConfirmacion() {
    document.getElementById("btnEventoRealizado")?.addEventListener("click", async () => {
      if (!eventoPendienteConfirmacion) return;
      await onConfirmarRealizacion(eventoPendienteConfirmacion, "Realizado");
      cerrarModalConfirmarRealizacion();
    });

    document.getElementById("btnEventoCancelado")?.addEventListener("click", async () => {
      if (!eventoPendienteConfirmacion) return;
      await onConfirmarRealizacion(eventoPendienteConfirmacion, "Cancelado");
      cerrarModalConfirmarRealizacion();
    });

    document.getElementById("btnCerrarConfirmacionEvento")?.addEventListener("click", () => {
      cerrarModalConfirmarRealizacion();
    });
  }

  initBotonesConfirmacion();

  return {
    verificarEventosPasados,
    verificarAvisosPendientes,
    actualizarGrafico,
    isModalConfirmacionAbierto: () => modalConfirmacionAbierto,
  };
}
