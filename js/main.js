import { initEvents } from "./events.js";
import { initCalendar } from "./calendar.js";
import { guardarMozo, cargarListaStaff } from "./staff.js";
import { auth, db } from "./auth.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  onSnapshot,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// --- SECCIONES Y UI ---
window.showSection = function (sectionId) {
  const sections = ["calendar", "eventsList", "statsContainer"];
  const searchSection = document.getElementById("searchSection");
  const addEventContainer = document.getElementById("addEventContainer");
  const formContainer = document.getElementById("eventFormContainer");
  const summaryEl = document.getElementById("daySummary");

  if (formContainer) formContainer.style.display = "none";
  if (summaryEl) summaryEl.style.display = "none";

  sections.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = id === sectionId ? "block" : "none";
    const btn = document.getElementById(`btn-${id}`);
    if (btn) btn.classList.toggle("active", id === sectionId);
  });

  if (searchSection)
    searchSection.style.display = sectionId === "eventsList" ? "block" : "none";
  if (addEventContainer)
    addEventContainer.style.display =
      sectionId === "calendar" ? "block" : "none";

  if (sectionId === "calendar") {
    window.dispatchEvent(new Event("resize"));
    if (typeof refreshCalendar === "function") refreshCalendar();
  }
};

// --- GESTIÓN DE MODAL DE STAFF (NUEVO) ---
window.abrirModalGestionStaff = async function (eventId) {
  const evento = window.allEventsData.find(e => e.id === eventId);
  if (!evento) return;

  const modal = document.getElementById("modalGestionStaff");
  const container = document.getElementById("listaGestionStaffContenido");

  if (!modal || !container) return;
  modal.dataset.eventId = eventId
  // Título del modal con el cliente
  document.getElementById("tituloModalStaff").innerText = `Staff: ${evento.client}`;

  // Renderizado de la lista de mozos asignados y sus estados
  const mensajes = evento.mensajesEnviados || [];

  if (mensajes.length === 0) {
    container.innerHTML = "<p style='text-align:center; color:#666;'>No hay staff con mensajes enviados aún.</p>";
  } else {
    container.innerHTML = mensajes.map((m) => {
      const nombre = typeof m === 'object' ? m.nombre : m;
      const estado = typeof m === 'object' ? m.estado : 'pendiente';
      const colores = { pendiente: '#f39c12', confirmado: '#27ae60', rechazado: '#c0392b' };

      return `
        <div style="display:flex; justify-content:space-between; align-items:center; padding: 8px 0; border-bottom:1px solid #f9f9f9;">
            <div style="display: flex; flex-direction: column;">
                <span style="font-size: 14px; font-weight: 500; color: #333;">${nombre}</span>
                <span style="font-size: 10px; color: ${colores[estado]}; font-weight: bold; text-transform:uppercase;">${estado}</span>
            </div>
            
            <div style="display:flex; gap: 15px; align-items:center;">
                <button onclick="window.rotarEstado('${eventId}', '${nombre}')" 
                        style="background:none; border:none; cursor:pointer; color:#ccc; font-size: 14px;" 
                        title="Cambiar estado">🔄</button>
                
                <button onclick="window.quitarStaff('${eventId}', '${nombre}')" 
                        style="background:none; border:none; cursor:pointer; color:#ccc; font-size: 18px;" 
                        title="Quitar">×</button>
            </div>
        </div>
    `;
    }).join("");
  }

  modal.style.display = "flex";
};

// --- RENDER SELECCIÓN EN FORMULARIO ---
export async function renderStaffSelection() {
  const container = document.getElementById("staffCheckboxes");
  if (!container) return;

  const q = query(collection(db, "staff"), orderBy("nombre"));
  try {
    const querySnapshot = await getDocs(q);
    container.innerHTML = "";
    if (querySnapshot.empty) {
      container.innerHTML = "<small style='padding:10px;'>No hay staff cargado</small>";
      return;
    }
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      container.innerHTML += `
        <label style="display: block; margin-bottom: 5px; cursor:pointer;">
          <input type="checkbox" name="staffSelected" value="${doc.id}" 
                 data-nombre="${data.nombre}" data-tel="${data.telefono}" style="margin-right: 8px;">
          ${data.nombre}
        </label>`;
    });
  } catch (e) {
    console.error("Error cargando staff:", e);
  }
}

function updateUserNameDisplay() {
  const userNameDisplay = document.getElementById("userNameDisplay");
  if (!userNameDisplay) return;
  const email = auth.currentUser?.email;
  const usuariosMap = {
    "almos2712@hotmail.com": "Laura",
    "mariano@a.com": "Mariano",
    "seba@a.com": "Sebastián",
  };
  userNameDisplay.innerText = usuariosMap[email] || "Usuario";
}

document.addEventListener("DOMContentLoaded", () => {
  const showFormBtn = document.getElementById("showFormBtn");
  showFormBtn?.addEventListener("click", () => renderStaffSelection());

  // Cerrar modales al hacer clic fuera
  window.addEventListener("click", (e) => {
    const modalStaff = document.getElementById("modalGestionStaff");
    const modalEnvio = document.getElementById("modalEnvio");
    if (e.target === modalStaff) modalStaff.style.display = "none";
    if (e.target === modalEnvio) modalEnvio.style.display = "none";
  });

  const notifSound = new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3");
  let inicializado = false;
  let cantidadAnterior = 0;
  let isProcessing = false;

  const notifWrapper = document.getElementById("notificationWrapper");
  const notifPanel = document.getElementById("notificationPanel");

  if (notifWrapper) {
    notifWrapper.onclick = (e) => {
      if (isProcessing) return;
      isProcessing = true;
      e.stopPropagation();
      const estaAbierto = notifPanel.style.display === "block";
      notifPanel.style.display = estaAbierto ? "none" : "block";
      if (!estaAbierto) marcarNotificacionesComoLeidas();
      setTimeout(() => { isProcessing = false; }, 300);
    };
  }

  document.onclick = (e) => {
    if (notifPanel && !notifWrapper?.contains(e.target)) {
      notifPanel.style.display = "none";
    }
  };

  // --- Lógica de Notificaciones ---
  function formatarHora(timestamp) {
    if (!timestamp) return "";
    return timestamp.toDate().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  }

  function iniciarEscuchadorNotificaciones() {
    const userEmail = auth.currentUser?.email;
    const countEl = document.getElementById("notifCount");
    const q = query(collection(db, "notificaciones"), where("leida", "==", false));

    onSnapshot(q, (snapshot) => {
      const filtradas = snapshot.docs.filter((d) => d.data().creadoPorEmail !== userEmail);
      const cantidadActual = filtradas.length;
      if (inicializado && cantidadActual > cantidadAnterior) {
        notifSound.play().catch(() => { });
      }
      if (countEl) {
        countEl.innerText = cantidadActual;
        countEl.style.display = cantidadActual > 0 ? "flex" : "none";
      }
      cantidadAnterior = cantidadActual;
      inicializado = true;
    });
  }

  async function marcarNotificacionesComoLeidas() {
    const userEmail = auth.currentUser?.email;
    try {
      const q = query(collection(db, "notificaciones"), where("leida", "==", false), orderBy("fecha", "desc"));
      const snapshot = await getDocs(q);
      const paraMostrar = snapshot.docs
        .filter((d) => d.data().creadoPorEmail !== userEmail)
        .sort((a, b) => (b.data().fecha?.seconds || 0) - (a.data().fecha?.seconds || 0));

      const notifList = document.getElementById("notifList");
      if (notifList) {
        notifList.innerHTML = paraMostrar.length === 0 ? "<li style='color:#888; text-align:center; padding:10px;'>Sin novedades</li>" : "";
        paraMostrar.forEach((d) => {
          const data = d.data();
          const li = document.createElement("li");
          li.innerHTML = `<div style="padding:10px; border-bottom:1px solid #eee;">
                            <span>${data.mensaje}</span><br>
                            <small style="color:#d4af37;">${formatarHora(data.fecha)}</small>
                          </div>`;
          notifList.appendChild(li);
        });
      }

      if (paraMostrar.length > 0) {
        setTimeout(async () => {
          const updatePromises = paraMostrar.map((d) => updateDoc(doc(db, "notificaciones", d.id), { leida: true }));
          await Promise.all(updatePromises);
        }, 3000);
      }
    } catch (e) { console.error("Error:", e); }
  }

  // --- Auth ---
  document.getElementById("loginBtn")?.addEventListener("click", async () => {
    const email = document.getElementById("email")?.value;
    const pass = document.getElementById("password")?.value;
    if (email && pass) {
      try { await signInWithEmailAndPassword(auth, email, pass); }
      catch (e) { alert("Error: " + e.message); }
    }
  });

  document.getElementById("logoutBtn")?.addEventListener("click", async () => {
    await signOut(auth);
    location.reload();
  });

  onAuthStateChanged(auth, (user) => {
    const loginDiv = document.getElementById("loginDiv");
    const appDiv = document.getElementById("appDiv");
    if (user) {
      if (loginDiv) loginDiv.style.display = "none";
      if (appDiv) appDiv.style.display = "block";
      updateUserNameDisplay();
      initEvents();
      initCalendar();
      iniciarEscuchadorNotificaciones();
      window.showSection("calendar");
    } else {
      if (loginDiv) loginDiv.style.display = "block";
      if (appDiv) appDiv.style.display = "none";
    }
  });
});

// --- LÓGICA DE ASIGNACIÓN DENTRO DEL MODAL ---

// 1. Mostrar/Ocultar el panel de selección de mozos
document.getElementById("btnAbrirSeleccion")?.addEventListener("click", async () => {
  const panel = document.getElementById("contenedorSeleccionStaff");
  const listado = document.getElementById("listadoCheckboxesCompleto");
  const modal = document.getElementById("modalGestionStaff");
  const eventId = modal.dataset.eventId;

  // Obtenemos el evento actual para saber quiénes ya están asignados
  const evento = window.allEventsData.find(e => e.id === eventId);
  const staffYaAsignado = evento.mensajesEnviados ? evento.mensajesEnviados.map(m => m.nombre) : [];

  if (panel.style.display === "none") {
    const q = query(collection(db, "staff"), orderBy("nombre"));
    const snapshot = await getDocs(q);

    listado.innerHTML = "";
    let hayDisponibles = false;

    snapshot.forEach(docSnap => {
      const data = docSnap.data();

      // SOLO mostramos si NO está en el array de ya asignados
      if (!staffYaAsignado.includes(data.nombre)) {
        hayDisponibles = true;
        listado.innerHTML += `
                    <label style="
        display: flex; 
        align-items: center; 
        gap: 15px; 
        padding: 12px; 
        border-bottom: 1px solid #f0f0f0; 
        cursor: pointer;
        transition: background 0.2s;">
        
        <input type="checkbox" class="check-staff-asignar" 
               data-nombre="${data.nombre}" data-tel="${data.telefono}"
               style="width: 18px; height: 18px; cursor: pointer;">
        
        <span style="font-size: 15px; font-weight: 500; color: #444;">${data.nombre}</span>
    </label>`;
      }
    });

    if (!hayDisponibles) {
      listado.innerHTML = "<p style='padding:10px; color:#888;'>Todos los mozos ya han sido asignados a este evento.</p>";
    }

    panel.style.display = "block";
  } else {
    panel.style.display = "none";
  }
});

// 2. Guardar la selección en el evento y abrir convocatoria
document.getElementById("btnConfirmarAsignacion")?.addEventListener("click", async () => {
  const modal = document.getElementById("modalGestionStaff");
  const eventId = modal.dataset.eventId;

  if (!eventId) {
    console.error("Error: eventId no definido en el modal.");
    return;
  }

  const checks = document.querySelectorAll(".check-staff-asignar:checked");

  if (checks.length === 0) return alert("Seleccioná al menos a alguien.");

  const nuevosAsignados = Array.from(checks).map(c => ({
    nombre: c.dataset.nombre,
    telefono: c.dataset.tel,
    estado: 'pendiente'
  }));

  // Actualizar Firestore
  const eventoRef = doc(db, "events", eventId);
  try {
    // Obtenemos el evento actual para no borrar a los que ya estaban
    const evento = window.allEventsData.find(e => e.id === eventId);
    const staffExistente = evento.mensajesEnviados || [];

    // Filtramos para no duplicar nombres
    const staffFinal = [...staffExistente];
    nuevosAsignados.forEach(nuevo => {
      if (!staffFinal.find(s => s.nombre === nuevo.nombre)) {
        staffFinal.push(nuevo);
      }
    });

    await updateDoc(eventoRef, { mensajesEnviados: staffFinal });

    // Actualizar data local y UI
    evento.mensajesEnviados = staffFinal;
    document.getElementById("contenedorSeleccionStaff").style.display = "none";

    // Abrir panel de WhatsApp para estos nuevos
    window.lanzarConvocatoriaWhatsApp(nuevosAsignados, evento);

    // Refrescar la lista del modal
    window.abrirModalGestionStaff(eventId);

  } catch (e) {
    console.error("Error asignando staff:", e);
  }
});

window.quitarStaff = async function (eventId, nombreMozo) {
  if (!confirm(`¿Estás seguro de quitar a ${nombreMozo} del evento?`)) return;

  const eventoRef = doc(db, "events", eventId);
  const evento = window.allEventsData.find(e => e.id === eventId);

  try {
    // Filtramos el array para excluir al mozo seleccionado
    const nuevoStaff = evento.mensajesEnviados.filter(m =>
      (typeof m === 'object' ? m.nombre : m) !== nombreMozo
    );

    // Actualizamos Firestore
    await updateDoc(eventoRef, { mensajesEnviados: nuevoStaff });

    // Actualizamos localmente y refrescamos el modal
    evento.mensajesEnviados = nuevoStaff;
    window.abrirModalGestionStaff(eventId);

  } catch (e) {
    console.error("Error al quitar al staff:", e);
    alert("No se pudo quitar al mozo. Intenta de nuevo.");
  }
};

// 3. Función auxiliar para mandar WhatsApps
window.lanzarConvocatoriaWhatsApp = function (staff, evento) {
  const modal = document.getElementById("modalEnvio");
  const container = document.getElementById("listaEnvioContenido");

  container.innerHTML = staff.map(s => {
    const msg = `Hola ${s.nombre}, te escribo de JOOLI. Tenemos evento: ${evento.date} - ${evento.client}. ¿Estás disponible?`;
    const url = `https://wa.me/${s.telefono}?text=${encodeURIComponent(msg)}`;
    return `
            <div style="padding:10px; border-bottom:1px solid #eee;">
                <strong>${s.nombre}</strong><br>
                <a href="${url}" target="_blank" class="btn-wa">Enviar WhatsApp</a>
            </div>`;
  }).join("");

  modal.style.display = "flex";
};