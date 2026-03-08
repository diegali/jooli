import { db } from "./auth.js";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let editingId = null;

// Función auxiliar de formato definida fuera para ser accesible globalmente en el módulo
function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("es-AR");
}

export function initEvents() {
  const eventsList = document.getElementById("eventsList");
  const monthFilter = document.getElementById("monthFilter");
  const formContainer = document.getElementById("eventFormContainer");
  const showFormBtn = document.getElementById("showFormBtn");
  const cancelFormBtn = document.getElementById("cancelFormBtn");
  const addBtn = document.getElementById("addBtn");
  const updateBtn = document.getElementById("updateBtn");

  loadEvents();

  if (addBtn) addBtn.onclick = () => saveEvent(false);
  if (updateBtn) updateBtn.onclick = () => saveEvent(true);
  
  if (showFormBtn) {
    showFormBtn.onclick = () => {
      resetForm();
      if (formContainer) {
        formContainer.style.display = "block";
        formContainer.scrollIntoView({ behavior: "smooth" });
      }
    };
  }

  if (cancelFormBtn) {
    cancelFormBtn.onclick = () => {
      if (formContainer) formContainer.style.display = "none";
    };
  }

  if (monthFilter) {
    monthFilter.addEventListener("change", loadEvents);
  }

  async function saveEvent(isUpdate = false) {
    const data = {
      date: document.getElementById("date").value,
      type: document.getElementById("type").value,
      client: document.getElementById("client").value,
      cuit: document.getElementById("cuit").value,
      place: document.getElementById("place").value,
      guests: Number(document.getElementById("guests").value) || 0,
      total: Number(document.getElementById("total").value) || 0,
      deposit: Number(document.getElementById("deposit").value) || 0,
      status: document.getElementById("status").value,
      paid: document.getElementById("paid").value === "true",
      invoiceNumber: document.getElementById("invoiceNumber").value,
      notes: document.getElementById("notes").value
    };

    try {
      if (isUpdate && editingId) {
        await updateDoc(doc(db, "events", editingId), data);
      } else {
        await addDoc(collection(db, "events"), data);
      }
      resetForm();
    } catch (e) {
      alert("Error guardando evento: " + e.message);
    }
  }

function loadEvents() {
    const q = query(collection(db, "events"), orderBy("date"));

    onSnapshot(q, (snap) => {
      if (!eventsList) return;
      eventsList.innerHTML = "";
      const allEvents = [];

      snap.forEach(d => {
        const e = d.data();
        allEvents.push(e);

        // Mapeo de colores para los estados
        const colors = {
          "Presupuestado": "#f1c40f",
          "Seña pagada": "#e67e22",
          "Confirmado": "#27ae60",
          "Realizado": "#2980b9",
          "Cancelado": "#c0392b"
        };
        const estadoColor = colors[e.status] || "#ccc";

        const card = document.createElement("div");
        card.className = "card";
        card.dataset.id = d.id;

        // Estructura completa de la tarjeta
        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <strong>${formatDate(e.date)}</strong> - ${e.type}<br>
              <small>Cliente: ${e.client} | Lugar: ${e.place}</small>
            </div>
            <span class="status-badge" style="background-color: ${estadoColor}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.8em;">
              ${e.status}
            </span>
          </div>
          <p style="margin:10px 0; font-size:0.9em;">
            👥 ${e.guests} pers. | 💰 $${Number(e.total).toLocaleString()} 
            (Seña: $${Number(e.deposit).toLocaleString()})
          </p>
          <button class="deleteBtn">Eliminar</button>
        `;

        card.querySelector(".deleteBtn").onclick = (ev) => {
          ev.stopPropagation();
          if (confirm("¿Eliminar evento?")) {
            deleteDoc(doc(db, "events", d.id));
          }
        };

        card.onclick = () => fillFormForEdit(e, d.id);
        eventsList.appendChild(card);
      });
      updateStats(allEvents);
    });
  }

  function updateStats(events) {
    const selectedMonth = monthFilter ? monthFilter.value : "";
    let total = 0, senas = 0, cantidad = 0;

    events.forEach(e => {
      if (!selectedMonth || e.date.startsWith(selectedMonth)) {
        total += Number(e.total) || 0;
        senas += Number(e.deposit) || 0;
        cantidad++;
      }
    });

    const elTotal = document.getElementById("totalMes");
    const elSenas = document.getElementById("senasMes");
    const elSaldo = document.getElementById("saldoMes");
    const elEventos = document.getElementById("eventosMes");

    if (elTotal) elTotal.innerText = `$${total.toLocaleString()}`;
    if (elSenas) elSenas.innerText = `$${senas.toLocaleString()}`;
    if (elSaldo) elSaldo.innerText = `$${(total - senas).toLocaleString()}`;
    if (elEventos) elEventos.innerText = cantidad;
  }
}

export function fillFormForEdit(e, id) {
  const formContainer = document.getElementById("eventFormContainer");
  
  const fields = {
    "date": e.date,
    "type": e.type,
    "client": e.client,
    "cuit": e.cuit || "",
    "place": e.place,
    "guests": e.guests || 0,
    "total": e.total || 0,
    "deposit": e.deposit || 0,
    "status": e.status,
    "paid": e.paid ? "true" : "false",
    "invoiceNumber": e.invoiceNumber || "",
    "notes": e.notes || ""
  };

  Object.keys(fields).forEach(key => {
    const el = document.getElementById(key);
    if (el) el.value = fields[key];
  });

  editingId = id;
  
  const updateBtn = document.getElementById("updateBtn");
  const addBtn = document.getElementById("addBtn");
  
  if (updateBtn) updateBtn.style.display = "inline-block";
  if (addBtn) addBtn.style.display = "none";
  
  if (formContainer) {
    formContainer.style.display = "block";
    formContainer.scrollIntoView({ behavior: "smooth" });
  }
}

function resetForm() {
  editingId = null;
  const formContainer = document.getElementById("eventFormContainer");
  document.querySelectorAll("#eventFormContainer input, #eventFormContainer textarea").forEach(el => {
    el.value = "";
  });
  
  const statusEl = document.getElementById("status");
  const paidEl = document.getElementById("paid");
  if (statusEl) statusEl.value = "Presupuestado";
  if (paidEl) paidEl.value = "false";
  
  document.getElementById("updateBtn").style.display = "none";
  document.getElementById("addBtn").style.display = "inline-block";
  if (formContainer) formContainer.style.display = "none";
}