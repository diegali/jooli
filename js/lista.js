import { db } from "./auth.js";
import {
    doc,
    updateDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const ITEMS_BASE = {
    VAJILLA: ["Copas", "Platos", "Bandejas"],
    LIMPIEZA: ["Repasadores", "Alcohol"],
    DESCARTABLES: ["Bandejas telgopor", "Cazuelas"],
    BEBIDAS: ["Agua", "Gaseosa"],
    INDUMENTARIA: ["Remeras", "Delantales"],
};

export function initLista() { }

function renderChecklistActual(evento) {
    const cont = document.getElementById("checklistEventoActual");
    if (!cont) return;

    if (!evento.checklist || evento.checklist.length === 0) {
        cont.innerHTML = "<p style='color:#888'>No hay ítems agregados.</p>";
        return;
    }

    const totalItems = evento.checklist.length;
    const preparados = evento.checklist.filter(item => item.preparado).length;
    const porcentaje = totalItems > 0 ? Math.round((preparados / totalItems) * 100) : 0;

    // Agrupar por categoría
    const grupos = {};

    evento.checklist.forEach((item) => {
        const categoria = item.categoria || "OTROS";

        if (!grupos[categoria]) {
            grupos[categoria] = [];
        }

        grupos[categoria].push(item);
    });

    let html = `
  <div style="margin-bottom:15px;">
    <div style="
      display:flex;
      justify-content:space-between;
      align-items:center;
      margin-bottom:6px;
      font-size:14px;
      font-weight:600;
      color:#444;
    ">
      <span>📦 Preparado: ${preparados} / ${totalItems}</span>
      <span>${porcentaje}%</span>
    </div>

    <div style="
      width:100%;
      height:10px;
      background:#e9e9e9;
      border-radius:999px;
      overflow:hidden;
    ">
      <div style="
        width:${porcentaje}%;
        height:100%;
        background:#4caf50;
        border-radius:999px;
        transition:width 0.2s ease;
      "></div>
    </div>
  </div>
`;

    Object.entries(grupos).forEach(([categoria, items]) => {
        html += `
      <div style="margin-top:15px;">
        <div style="
          font-weight:600;
          font-size:14px;
          margin-bottom:6px;
          color:#555;
        ">
          ${categoria}
        </div>
    `;

        items.forEach((item) => {
            const index = evento.checklist.indexOf(item);

            html += `
        <div style="
          display:flex;
          align-items:center;
          gap:10px;
          padding:8px;
          border-bottom:1px solid #eee;
        ">

          <input
            type="checkbox"
            ${item.preparado ? "checked" : ""}
            onchange="window.toggleChecklistItem(${index})"
            style="width:18px;height:18px;"
          >

          <span
            onclick="window.toggleChecklistItem(${index})"
            style="
                flex:1;
                cursor:pointer;
                user-select:none;
                text-decoration: ${item.preparado ? "line-through" : "none"};
                opacity: ${item.preparado ? "0.6" : "1"};
                transition: all 0.2s ease;
            "
            >
            ${item.nombre}
        </span>
        
          <input
            type="number"
            value="${item.cantidad}"
            min="1"
            style="width:55px;height:30px;text-align:center;"
            onchange="window.cambiarCantidadChecklist(${index}, this.value)"
          >

          <button
    type="button"
    onclick="window.eliminarChecklistItem(${index})"
    style="
      height:32px;
      padding:0 10px;
      display:flex;
      align-items:center;
      justify-content:center;
    "
  >
    ✕
  </button>

        </div>
      `;
        });

        html += `</div>`;
    });

    cont.innerHTML = html;
}

async function guardarChecklistEnFirestore(evento) {
    if (!evento?.id) return;

    try {
        await updateDoc(doc(db, "events", evento.id), {
            checklist: evento.checklist || [],
        });

        const index = window.allEventsData.findIndex((e) => e.id === evento.id);
        if (index !== -1) {
            window.allEventsData[index].checklist = [...(evento.checklist || [])];
        }
    } catch (error) {
        console.error("Error al guardar checklist:", error);
    }
}

window.abrirModalChecklist = function (eventId) {
    const evento = window.allEventsData.find((e) => e.id === eventId);
    if (!evento) return;

    const modal = document.getElementById("modalChecklist");
    const titulo = document.getElementById("tituloModalChecklist");
    const resumen = document.getElementById("resumenChecklistEvento");
    const contenido = document.getElementById("contenidoChecklistEvento");

    if (!modal || !titulo || !resumen || !contenido) return;

    const fechaEvento = evento.date
        ? new Date(evento.date + "T00:00:00").toLocaleDateString("es-AR")
        : "";

    titulo.innerText = `📦 Checklist · ${fechaEvento} · ${evento.client}`;
    resumen.innerText = "Seleccioná los items necesarios para este evento";

    if (!evento.checklist) evento.checklist = [];
    window.eventoChecklistActual = evento;

    renderChecklistActual(evento);

    let html = "";

    Object.entries(ITEMS_BASE).forEach(([categoria, items]) => {
        html += `
      <div style="margin-bottom:20px;">
        <h4 style="margin:0 0 10px 0; color:#16a085;">${categoria}</h4>
        ${items
                .map(
                    (item) => `
              <div style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                padding:10px;
                border:1px solid #eee;
                border-radius:8px;
                margin-bottom:8px;
              ">
                <span>${item}</span>
                <button
                  type="button"
                  onclick="window.agregarChecklistItem('${item}', '${categoria}')"
                  style="
                    background:#16a085;
                    color:white;
                    border:none;
                    border-radius:6px;
                    padding:6px 10px;
                    cursor:pointer;
                  "
                >
                  Agregar
                </button>
              </div>
            `
                )
                .join("")}
      </div>
    `;
    });

    contenido.innerHTML = html;
    modal.style.display = "flex";
};

window.cerrarModalChecklist = function () {
    const modal = document.getElementById("modalChecklist");
    if (modal) modal.style.display = "none";
};

window.agregarChecklistItem = async function (nombre, categoria) {
    const evento = window.eventoChecklistActual;
    if (!evento) return;

    if (!evento.checklist) evento.checklist = [];

    const yaExiste = evento.checklist.some((i) => i.nombre === nombre);
    if (yaExiste) return;

    evento.checklist.push({
        nombre,
        categoria,
        cantidad: 1,
        preparado: false,
    });

    await guardarChecklistEnFirestore(evento);
    renderChecklistActual(evento);
};

window.toggleChecklistItem = async function (index) {
    const evento = window.eventoChecklistActual;
    if (!evento || !evento.checklist?.[index]) return;

    evento.checklist[index].preparado = !evento.checklist[index].preparado;

    await guardarChecklistEnFirestore(evento);
    renderChecklistActual(evento);
};

window.cambiarCantidadChecklist = async function (index, valor) {
    const evento = window.eventoChecklistActual;
    if (!evento || !evento.checklist?.[index]) return;

    evento.checklist[index].cantidad = Number(valor) || 1;

    await guardarChecklistEnFirestore(evento);
    renderChecklistActual(evento);
};

window.eliminarChecklistItem = async function (index) {
    const evento = window.eventoChecklistActual;
    if (!evento || !evento.checklist) return;

    evento.checklist.splice(index, 1);

    await guardarChecklistEnFirestore(evento);
    renderChecklistActual(evento);
};