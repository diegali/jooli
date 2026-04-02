// js/events/events-budget.js

import {
    doc,
    updateDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

export function puedeEditarPresupuesto(auth) {
    const email = auth.currentUser?.email;
    return email === "almos2712@hotmail.com" || email === "mariano@a.com";
}

export function actualizarUIBudget(evento, deps) {
    const { auth } = deps;

    const verBtn = document.getElementById("btnVerPresupuesto");
    const eliminarBtn = document.getElementById("btnEliminarPresupuesto");
    const subirBtn = document.getElementById("btnSubirPresupuesto");
    const infoEl = document.getElementById("presupuestoInfo");

    const puedeEditar = puedeEditarPresupuesto(auth);

    if (infoEl) {
        infoEl.textContent = evento?.presupuestoNombre
            ? `Archivo: ${evento.presupuestoNombre}`
            : "No hay presupuesto adjunto.";
    }

    if (subirBtn) {
        subirBtn.style.display = puedeEditar ? "inline-block" : "none";
    }

    if (verBtn) {
        verBtn.style.display = evento?.presupuestoURL ? "inline-block" : "none";
        verBtn.onclick = evento?.presupuestoURL
            ? () => window.open(evento.presupuestoURL, "_blank")
            : null;
    }

    if (eliminarBtn) {
        eliminarBtn.style.display =
            puedeEditar && evento?.presupuestoURL ? "inline-block" : "none";
    }
}

export async function subirPresupuestoEvento(editingId, deps) {
    const { storage, db, auth } = deps;

    if (!editingId) {
        window.mostrarAvisoSimple(
            "Evento sin guardar",
            "Primero guardá el evento antes de subir un presupuesto.",
            "⚠️"
        );
        return null;
    }

    const input = document.getElementById("presupuestoFile");
    const file = input?.files?.[0];

    if (!file) {
        window.mostrarAvisoSimple(
            "Sin archivo",
            "Seleccioná un archivo PDF.",
            "⚠️"
        );
        return null;
    }

    const filePath = `presupuestos/${editingId}/${file.name}`;
    const storageRef = ref(storage, filePath);

    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    const eventoRef = doc(db, "events", editingId);
    const presupuestoData = {
        presupuestoURL: url,
        presupuestoNombre: file.name,
        presupuestoPath: filePath,
    };

    await updateDoc(eventoRef, presupuestoData);
    const eventoEnMemoria = (window.allEventsData || []).find(e => e.id === editingId);
    if (eventoEnMemoria) {
        eventoEnMemoria.presupuestoURL = url;
        eventoEnMemoria.presupuestoNombre = file.name;
        eventoEnMemoria.presupuestoPath = filePath;
    }

    actualizarUIBudget(presupuestoData, { auth });

    window.mostrarAvisoSimple(
        "Presupuesto subido",
        "El presupuesto se adjuntó correctamente.",
        "✅"
    );

    return presupuestoData;
}

export async function eliminarPresupuestoEvento(editingId, deps) {
    const { db, storage, auth } = deps;

    if (!editingId) return;

    const evento = (window.allEventsData || []).find((e) => e.id === editingId);
    if (!evento?.presupuestoPath) return;

    try {
        const fileRef = ref(storage, evento.presupuestoPath);
        await deleteObject(fileRef);

        const eventoRef = doc(db, "events", editingId);
        await updateDoc(eventoRef, {
            presupuestoURL: "",
            presupuestoNombre: "",
            presupuestoPath: "",
        });

        actualizarUIBudget(null, { auth });

        window.mostrarAvisoSimple(
            "Presupuesto eliminado",
            "El presupuesto se eliminó correctamente.",
            "✅"
        );
    } catch (error) {
        console.error("Error eliminando presupuesto:", error);
        window.mostrarAvisoSimple(
            "Error",
            "No se pudo eliminar el presupuesto.",
            "❌"
        );
    }
}

export function actualizarUIFactura(evento, deps) {
    const { auth } = deps;
    const verBtn = document.getElementById("btnVerFactura");
    const eliminarBtn = document.getElementById("btnEliminarFactura");
    const subirBtn = document.getElementById("btnSubirFactura");
    const infoEl = document.getElementById("facturaInfo");
    const puedeEditar = puedeEditarPresupuesto(auth);

    if (infoEl) {
        infoEl.textContent = evento?.facturaNombre
            ? `Archivo: ${evento.facturaNombre}`
            : "No hay factura adjunta.";
    }
    if (subirBtn) subirBtn.style.display = puedeEditar ? "inline-block" : "none";
    if (verBtn) verBtn.style.display = evento?.facturaURL ? "inline-block" : "none";
    if (eliminarBtn) eliminarBtn.style.display = puedeEditar && evento?.facturaURL ? "inline-block" : "none";

    if (verBtn && evento?.facturaURL) {
        verBtn.onclick = () => window.open(evento.facturaURL, "_blank");
    }
}

export async function subirFacturaEvento(editingId, deps) {
    const { storage, db, auth } = deps;
    if (!editingId) {
        window.mostrarAvisoSimple("Evento sin guardar", "Primero guardá el evento antes de subir la factura.", "⚠️");
        return;
    }

    const input = document.getElementById("facturaFile");
    const file = input?.files?.[0];
    if (!file) return;

    const filePath = `facturas/${editingId}/${file.name}`;
    const storageRef = ref(storage, filePath);

    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    const eventoRef = doc(db, "events", editingId);
    const facturaData = { facturaURL: url, facturaNombre: file.name, facturaPath: filePath };

    await updateDoc(eventoRef, facturaData);

    const eventoEnMemoria = (window.allEventsData || []).find(e => e.id === editingId);
    if (eventoEnMemoria) Object.assign(eventoEnMemoria, facturaData);

    actualizarUIFactura(facturaData, { auth });
    window.mostrarAvisoSimple("Factura subida", "La factura se adjuntó correctamente.", "✅");
}

export async function eliminarFacturaEvento(editingId, deps) {
    const { db, storage, auth } = deps;
    if (!editingId) return;

    const evento = (window.allEventsData || []).find(e => e.id === editingId);
    if (!evento?.facturaPath) return;

    try {
        await deleteObject(ref(storage, evento.facturaPath));
        await updateDoc(doc(db, "events", editingId), { facturaURL: "", facturaNombre: "", facturaPath: "" });
        actualizarUIFactura(null, { auth });
        window.mostrarAvisoSimple("Factura eliminada", "La factura se eliminó correctamente.", "✅");
    } catch (error) {
        window.mostrarAvisoSimple("Error", "No se pudo eliminar la factura.", "❌");
    }
}

export function actualizarUIAlquiler(evento, deps) {
    const { auth } = deps;
    const verBtn = document.getElementById("btnVerAlquiler");
    const eliminarBtn = document.getElementById("btnEliminarAlquiler");
    const subirBtn = document.getElementById("btnSubirAlquiler");
    const infoEl = document.getElementById("alquilerInfo");
    const puedeEditar = puedeEditarPresupuesto(auth);

    if (infoEl) {
        infoEl.textContent = evento?.alquilerNombre
            ? `Archivo: ${evento.alquilerNombre}`
            : "No hay archivo adjunto.";
    }
    if (subirBtn) subirBtn.style.display = puedeEditar ? "inline-block" : "none";
    if (verBtn) verBtn.style.display = evento?.alquilerURL ? "inline-block" : "none";
    if (eliminarBtn) eliminarBtn.style.display = puedeEditar && evento?.alquilerURL ? "inline-block" : "none";
    if (verBtn && evento?.alquilerURL) {
        verBtn.onclick = () => window.open(evento.alquilerURL, "_blank");
    }
}

export async function subirAlquilerEvento(editingId, deps) {
    const { storage, db, auth } = deps;
    if (!editingId) {
        window.mostrarAvisoSimple("Evento sin guardar", "Primero guardá el evento antes de subir el archivo.", "⚠️");
        return;
    }

    const input = document.getElementById("alquilerFile");
    const file = input?.files?.[0];
    if (!file) return;

    const filePath = `alquileres/${editingId}/${file.name}`;
    const storageRef = ref(storage, filePath);

    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    const eventoRef = doc(db, "events", editingId);
    const alquilerData = { alquilerURL: url, alquilerNombre: file.name, alquilerPath: filePath };

    await updateDoc(eventoRef, alquilerData);

    const eventoEnMemoria = (window.allEventsData || []).find(e => e.id === editingId);
    if (eventoEnMemoria) Object.assign(eventoEnMemoria, alquilerData);

    actualizarUIAlquiler(alquilerData, { auth });
    window.mostrarAvisoSimple("Archivo subido", "El archivo de alquileres se adjuntó correctamente.", "✅");
}

export async function eliminarAlquilerEvento(editingId, deps) {
    const { db, storage, auth } = deps;
    if (!editingId) return;

    const evento = (window.allEventsData || []).find(e => e.id === editingId);
    if (!evento?.alquilerPath) return;

    try {
        await deleteObject(ref(storage, evento.alquilerPath));
        await updateDoc(doc(db, "events", editingId), { alquilerURL: "", alquilerNombre: "", alquilerPath: "" });
        actualizarUIAlquiler(null, { auth });
        window.mostrarAvisoSimple("Archivo eliminado", "El archivo de alquileres se eliminó correctamente.", "✅");
    } catch (error) {
        window.mostrarAvisoSimple("Error", "No se pudo eliminar el archivo.", "❌");
    }
}

// ─── PAGOS PARCIALES ──────────────────────────────────────────────

// Estado en memoria de los pagos mientras se edita el formulario
let _pagosEnEdicion = [];
let _pagosEditingId = null;
let _pagosDeps = null;

window._getPagosEnEdicion = () => _pagosEnEdicion;

export function initPagosForm(editingId, deps) {
    _pagosEditingId = editingId;
    _pagosDeps = deps;

    const evento = (window.allEventsData || []).find(e => e.id === editingId);
    _pagosEnEdicion = JSON.parse(JSON.stringify(evento?.pagos || []));

    renderPagosForm();
}

export function resetPagosForm() {
    _pagosEnEdicion = [];
    _pagosEditingId = null;
    renderPagosForm();
}

function renderPagosForm() {
    const contenedor = document.getElementById("pagos-lista-form");
    if (!contenedor) return;

    if (_pagosEnEdicion.length === 0) {
        contenedor.innerHTML = "";
        return;
    }

    contenedor.innerHTML = _pagosEnEdicion.map((pago, i) => `
        <div class="pago-fila" data-idx="${i}">
            <div class="pago-fila-top">
                <input
                    type="text"
                    inputmode="numeric"
                    class="pago-monto-input"
                    placeholder="$0"
                    value="${pago.monto ? Number(pago.monto).toLocaleString('es-AR') : ''}"
                    onfocus="this.value=this.value.replace(/\./g,'')"
                    onblur="this.value=this.value.replace(/\D/g,'') ? Number(this.value.replace(/\D/g,'')).toLocaleString('es-AR') : ''"
                    onchange="window._onPagoMontoCambio(${i}, this.value.replace(/\./g,''))"
                />
                <select class="pago-estado-select" onchange="window._onPagoEstadoCambio(${i}, this.value)">
                    <option value="pendiente" ${pago.estado === "pendiente" ? "selected" : ""}>⏳ Pendiente</option>
                    <option value="pagado" ${pago.estado === "pagado" ? "selected" : ""}>✔ Pagado</option>
                </select>
                <button type="button" class="btn-adjunto btn-adjunto--eliminar" onclick="window._eliminarPago(${i})">🗑</button>
            </div>
            <div class="pago-fila-factura">
                <select class="adjunto-select pago-factura-tipo" onchange="window._onPagoFacturaTipoCambio(${i}, this.value)">
                    <option value="B/C" ${(pago.facturaTipo || "B/C") === "B/C" ? "selected" : ""}>B/C</option>
                    <option value="A" ${pago.facturaTipo === "A" ? "selected" : ""}>A</option>
                </select>
                <input
                    type="text"
                    class="adjunto-input pago-factura-numero"
                    placeholder="Nº factura (opcional)"
                    value="${pago.facturaNumero || ""}"
                    onchange="window._onPagoFacturaNumCambio(${i}, this.value)"
                />
                <button type="button" class="btn-adjunto" onclick="window._triggerSubirFacturaPago(${i})">📎</button>
                ${pago.facturaURL
            ? `<button type="button" class="btn-adjunto btn-adjunto--ver" onclick="window.open('${pago.facturaURL}', '_blank')">👁</button>
                       <button type="button" class="btn-adjunto btn-adjunto--eliminar" onclick="window._eliminarFacturaPago(${i})">🗑</button>`
            : ""
        }
                <input type="file" id="facturaFilePago_${i}" accept=".pdf,image/*" class="presupuesto-file-input"
                    onchange="window._subirFacturaPago(${i})">
            </div>
            ${pago.facturaNombre ? `<div class="presupuesto-info">📎 ${pago.facturaNombre}</div>` : ""}
        </div>
    `).join("");
}

// Callbacks para cambios en cada fila
window._onPagoMontoCambio = (i, val) => { _pagosEnEdicion[i].monto = Number(val) || 0; };
window._onPagoEstadoCambio = (i, val) => { _pagosEnEdicion[i].estado = val; };
window._onPagoFacturaTipoCambio = (i, val) => { _pagosEnEdicion[i].facturaTipo = val; };
window._onPagoFacturaNumCambio = (i, val) => { _pagosEnEdicion[i].facturaNumero = val; };

window._eliminarPago = (i) => {
    _pagosEnEdicion.splice(i, 1);
    renderPagosForm();
};

window._triggerSubirFacturaPago = (i) => {
    document.getElementById(`facturaFilePago_${i}`)?.click();
};

window._subirFacturaPago = async (i) => {
    if (!_pagosEditingId || !_pagosDeps) {
        window.mostrarAvisoSimple("Evento sin guardar", "Primero guardá el evento antes de subir una factura.", "⚠️");
        return;
    }
    const { storage, db } = _pagosDeps;
    const file = document.getElementById(`facturaFilePago_${i}`)?.files?.[0];
    if (!file) return;

    const pagoId = _pagosEnEdicion[i].id || `pago_${Date.now()}`;
    _pagosEnEdicion[i].id = pagoId;

    const filePath = `facturas/${_pagosEditingId}/${pagoId}_${file.name}`;
    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    _pagosEnEdicion[i].facturaURL = url;
    _pagosEnEdicion[i].facturaNombre = file.name;
    _pagosEnEdicion[i].facturaPath = filePath;

    // Guardar en Firestore inmediatamente
    const eventoRef = doc(db, "events", _pagosEditingId);
    await updateDoc(eventoRef, { pagos: _pagosEnEdicion });

    const eventoEnMemoria = (window.allEventsData || []).find(e => e.id === _pagosEditingId);
    if (eventoEnMemoria) eventoEnMemoria.pagos = JSON.parse(JSON.stringify(_pagosEnEdicion));

    renderPagosForm();
    window.mostrarAvisoSimple("Factura subida", "La factura se adjuntó correctamente.", "✅");
};

window._eliminarFacturaPago = async (i) => {
    if (!_pagosEditingId || !_pagosDeps) return;
    const { storage, db } = _pagosDeps;
    const pago = _pagosEnEdicion[i];
    if (!pago?.facturaPath) return;

    try {
        await deleteObject(ref(storage, pago.facturaPath));
    } catch (e) {
        console.warn("No se pudo borrar el archivo de Storage:", e);
    }

    _pagosEnEdicion[i].facturaURL = "";
    _pagosEnEdicion[i].facturaNombre = "";
    _pagosEnEdicion[i].facturaPath = "";

    const eventoRef = doc(db, "events", _pagosEditingId);
    await updateDoc(eventoRef, { pagos: _pagosEnEdicion });

    const eventoEnMemoria = (window.allEventsData || []).find(e => e.id === _pagosEditingId);
    if (eventoEnMemoria) eventoEnMemoria.pagos = JSON.parse(JSON.stringify(_pagosEnEdicion));

    renderPagosForm();
};

export function agregarPago() {
    _pagosEnEdicion.push({
        id: `pago_${Date.now()}`,
        monto: 0,
        estado: "pendiente",
        facturaTipo: "B/C",
        facturaNumero: "",
        facturaURL: "",
        facturaNombre: "",
        facturaPath: "",
    });
    renderPagosForm();
}

export async function guardarPagos(editingId, deps) {
    if (!editingId) {
        window.mostrarAvisoSimple("Evento sin guardar", "Primero guardá el evento y luego agregá los pagos.", "⚠️");
        return;
    }
    const { db } = deps;

    const eventoRef = doc(db, "events", editingId);
    await updateDoc(eventoRef, { pagos: _pagosEnEdicion });

    const eventoEnMemoria = (window.allEventsData || []).find(e => e.id === editingId);
    if (eventoEnMemoria) eventoEnMemoria.pagos = JSON.parse(JSON.stringify(_pagosEnEdicion));

    window.mostrarAvisoSimple("Pagos guardados", "Los pagos se guardaron correctamente.", "✅");
}