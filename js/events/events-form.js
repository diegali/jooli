// js/events/events-form.js
import { actualizarUIFactura } from "./events-budget.js";

export function resetForm({ setEditingId, actualizarUIBudget }) {
    setEditingId(null);

    const form = document.getElementById("eventFormContainer");

    if (form) {
        form.style.display = "none";

        form.querySelectorAll("input, select, textarea").forEach((el) => {
            if (!["type", "status", "paid", "invoiceType"].includes(el.id)) {
                el.value = "";
            }

            if (el.type === "checkbox") {
                el.checked = false;
            }
            window._jornadasActuales = [];
            const jornadasContainer = document.getElementById("jornadasContainer");
            if (jornadasContainer) jornadasContainer.style.display = "none";
            const esMultidia = document.getElementById("esMultidia");
            if (esMultidia) esMultidia.checked = false;
            document.getElementById("jornadasLista").innerHTML = "";

        });

        actualizarUIBudget(null);
    }

    const formTitle = document.getElementById("formTitle");
    const updateBtn = document.getElementById("updateBtn");
    const addBtn = document.getElementById("addBtn");
    const deleteBtn = document.getElementById("deleteBtn");

    if (formTitle) formTitle.innerText = "Nuevo Evento";
    if (updateBtn) updateBtn.style.display = "none";
    if (addBtn) addBtn.style.display = "inline-block";
    if (deleteBtn) deleteBtn.style.display = "none";

    ["btnGestionarStaff", "btnGestionarChecklist", "btnSubirPresupuesto", "btnEliminarPresupuesto"].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.style.display = "";
    });
}

export function getFormData() {
    const selectedStaff = Array.from(
        document.querySelectorAll('input[name="staffSelected"]:checked')
    ).map((cb) => cb.value);

    return {
        invoiceType: document.getElementById("invoiceType")?.value || "B/C",
        date: document.getElementById("date")?.value || "",
        type: document.getElementById("type")?.value || "",
        client: document.getElementById("client")?.value || "",
        cuit: document.getElementById("cuit")?.value || "",
        place: document.getElementById("place")?.value || "",
        horaInicio: document.getElementById("horaInicio")?.value || "",
        horaFin: document.getElementById("horaFin")?.value || "",
        guests: document.getElementById("guests")?.value || "",
        staffNecesario:
            document.getElementById("staffNecesario")?.value ||
            Math.ceil((document.getElementById("guests")?.value || 0) / 15),
        total: document.getElementById("total")?.value || "",
        deposit: document.getElementById("deposit")?.value || "",
        status: document.getElementById("status")?.value || "",
        paid: document.getElementById("paid")?.value === "true",
        invoiceNumber: document.getElementById("invoiceNumber")?.value || "",
        notes: document.getElementById("notes")?.value || "",
        placeUrl: document.getElementById("placeUrl")?.value || "",
        alquileres: {
            vajilla: document.getElementById("alqVajilla")?.checked || false,
            manteleria: document.getElementById("alqManteleria")?.checked || false,
            mobiliario: document.getElementById("alqMobiliario")?.checked || false,
            mobiliarioTrabajo:
                document.getElementById("alqMobiliarioTrabajo")?.checked || false,
            notas: document.getElementById("alqNotas")?.value || "",
        },
        esMultidia: document.getElementById("esMultidia")?.checked || false,
        jornadas: window._jornadasActuales || [],
        staffAsignado: selectedStaff,
    };
}

export async function fillFormForEdit(evento, id, deps) {
    const {
        setEditingId,
        renderStaffSelection,
        puedeEditarPresupuesto,
    } = deps;

    setEditingId(id);
    window.editingId = id;

    const fields = [
        "date",
        "type",
        "client",
        "cuit",
        "place",
        "horaInicio",
        "horaFin",
        "guests",
        "staffNecesario",
        "total",
        "deposit",
        "status",
        "invoiceNumber",
        "notes",
        "invoiceType",
        "placeUrl",
        "esMultidia",
    ];

    fields.forEach((field) => {
        const el = document.getElementById(field);
        if (el) {
            el.value = evento[field] || (field === "invoiceType" ? "B/C" : "");
        }
    });

    const alq = evento.alquileres || {};

    const alqVajilla = document.getElementById("alqVajilla");
    const alqManteleria = document.getElementById("alqManteleria");
    const alqMobiliario = document.getElementById("alqMobiliario");
    const alqMobiliarioTrabajo = document.getElementById("alqMobiliarioTrabajo");
    const alqNotas = document.getElementById("alqNotas");

    if (alqVajilla) alqVajilla.checked = alq.vajilla || false;
    if (alqManteleria) alqManteleria.checked = alq.manteleria || false;
    if (alqMobiliario) alqMobiliario.checked = alq.mobiliario || false;
    if (alqMobiliarioTrabajo) {
        alqMobiliarioTrabajo.checked = alq.mobiliarioTrabajo || false;
    }
    if (alqNotas) alqNotas.value = alq.notas || "";

    const paidEl = document.getElementById("paid");
    if (paidEl) {
        paidEl.value = evento.paid ? "true" : "false";
    }

    await renderStaffSelection();

    if (evento.staffAsignado) {
        evento.staffAsignado.forEach((idMozo) => {
            const checkbox = document.querySelector(`input[value="${idMozo}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }

    const formTitle = document.getElementById("formTitle");
    const updateBtn = document.getElementById("updateBtn");
    const addBtn = document.getElementById("addBtn");
    const deleteBtn = document.getElementById("deleteBtn");
    const form = document.getElementById("eventFormContainer");

    if (formTitle) formTitle.innerText = "Editando Evento";
    if (updateBtn) updateBtn.style.display = "inline-block";
    if (addBtn) addBtn.style.display = "none";
    if (deleteBtn) deleteBtn.style.display = "inline-block";

    if (form) {
        form.style.display = "block";
        form.scrollIntoView({ behavior: "smooth" });
    }

    const verBtn = document.getElementById("btnVerPresupuesto");
    const eliminarBtn = document.getElementById("btnEliminarPresupuesto");
    const subirBtn = document.getElementById("btnSubirPresupuesto");
    const infoEl = document.getElementById("presupuestoInfo");
    const puedeEditar = puedeEditarPresupuesto();

    if (infoEl) {
        infoEl.textContent = evento.presupuestoNombre
            ? `Archivo: ${evento.presupuestoNombre}`
            : "No hay presupuesto adjunto.";
    }

    if (subirBtn) {
        subirBtn.style.display = puedeEditar ? "inline-block" : "none";
    }

    if (verBtn) {
        verBtn.style.display = evento.presupuestoURL ? "inline-block" : "none";
        verBtn.onclick = () => window.open(evento.presupuestoURL, "_blank");
    }

    if (eliminarBtn) {
        eliminarBtn.style.display =
            puedeEditar && evento.presupuestoURL ? "inline-block" : "none";
    }
    const today = new Date().toISOString().split("T")[0];
    const eventoPasado = evento.date < today;

    const btnStaff = document.getElementById("btnGestionarStaff");
    const btnChecklist = document.getElementById("btnGestionarChecklist");

    if (btnStaff) btnStaff.style.display = "";
    if (btnChecklist) btnChecklist.style.display = "";

    if (eventoPasado) {
        if (subirBtn) subirBtn.style.display = "none";
        if (eliminarBtn) eliminarBtn.style.display = "none";
    }
    // Resetear panel de selección de staff al abrir el formulario
    const panelSeleccion = document.getElementById("contenedorSeleccionStaff");
    if (panelSeleccion) panelSeleccion.style.display = "none";
    const btnAbrirSeleccion = document.getElementById("btnAbrirSeleccion");
    if (btnAbrirSeleccion) {
        btnAbrirSeleccion.innerText = "+ Agregar";
        btnAbrirSeleccion.disabled = false;
        btnAbrirSeleccion.classList.remove("completo");
    }

    // Factura
    const verFacturaBtn = document.getElementById("btnVerFactura");
    const eliminarFacturaBtn = document.getElementById("btnEliminarFactura");
    const subirFacturaBtn = document.getElementById("btnSubirFactura");
    const facturaInfoEl = document.getElementById("facturaInfo");

    if (facturaInfoEl) {
        facturaInfoEl.textContent = evento.facturaNombre
            ? `Archivo: ${evento.facturaNombre}`
            : "No hay factura adjunta.";
    }
    if (subirFacturaBtn) subirFacturaBtn.style.display = puedeEditar ? "inline-block" : "none";
    if (verFacturaBtn) verFacturaBtn.style.display = evento.facturaURL ? "inline-block" : "none";
    if (eliminarFacturaBtn) eliminarFacturaBtn.style.display = puedeEditar && evento.facturaURL ? "inline-block" : "none";

    if (verFacturaBtn && evento.facturaURL) {
        verFacturaBtn.onclick = () => window.open(evento.facturaURL, "_blank");
    }

    if (eventoPasado) {
        if (subirFacturaBtn) subirFacturaBtn.style.display = "none";
        if (eliminarFacturaBtn) eliminarFacturaBtn.style.display = "none";
    }
    // Jornadas
    const esMultidiaEl = document.getElementById("esMultidia");
    const jornadasCont = document.getElementById("jornadasContainer");
    window._jornadasActuales = evento.jornadas ? [...evento.jornadas] : [];
    if (esMultidiaEl) esMultidiaEl.checked = evento.esMultidia || false;
    if (jornadasCont) jornadasCont.style.display = evento.esMultidia ? "block" : "none";
    if (evento.esMultidia) window.renderJornadas();
}