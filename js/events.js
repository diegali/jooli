import { db } from "./auth.js";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  addDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let editingId = null;

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("es-AR");
}

function getMonthLabel(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function initEvents() {
  const eventsList = document.getElementById("eventsList");
  const monthFilter = document.getElementById("monthFilter");
  const formContainer = document.getElementById("eventFormContainer");
  const showFormBtn = document.getElementById("showFormBtn");
  const cancelFormBtn = document.getElementById("cancelFormBtn");
  const addBtn = document.getElementById("addBtn");
  const updateBtn = document.getElementById("updateBtn");
  const toggleStatsBtn = document.getElementById("toggleStatsBtn");
  const statsContainer = document.getElementById("statsContainer");

  loadEvents();

  if (toggleStatsBtn && statsContainer) {
    toggleStatsBtn.onclick = () => {
      const isHidden = statsContainer.style.display === "none";
      statsContainer.style.display = isHidden ? "block" : "none";
      toggleStatsBtn.innerText = isHidden
        ? "Ocultar Estadísticas"
        : "Ver Estadísticas y Filtros";
      toggleStatsBtn.style.background = isHidden ? "#c0392b" : "#3498db";
    };
  }

  if (showFormBtn) {
    showFormBtn.onclick = () => {
      resetForm();
      formContainer.style.display = "block";
      document.getElementById("formTitle").innerText = "Nuevo Evento";
      formContainer.scrollIntoView({ behavior: "smooth" });
    };
  }

  if (cancelFormBtn) cancelFormBtn.onclick = () => resetForm();
  if (addBtn) addBtn.onclick = () => saveEvent(false);
  if (updateBtn) updateBtn.onclick = () => saveEvent(true);
  if (monthFilter) monthFilter.addEventListener("change", loadEvents);

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
      notes: document.getElementById("notes").value,
    };

    if (!data.date || !data.client) {
      alert("Por favor completa Fecha y Cliente");
      return;
    }

    try {
      if (isUpdate && editingId) {
        await updateDoc(doc(db, "events", editingId), data);
      } else {
        await addDoc(collection(db, "events"), data);
      }
      resetForm();
    } catch (e) {
      alert("Error: " + e.message);
    }
  }

  function loadEvents() {
    const q = query(collection(db, "events"), orderBy("date"));
    onSnapshot(q, (snap) => {
      if (!eventsList) return;
      eventsList.innerHTML = "";
      const allEvents = [];
      const today = new Date().toISOString().split("T")[0];

      const upcomingGroups = {};
      const pastGroups = {};

      snap.forEach((d) => {
        const e = d.data();
        allEvents.push(e);
        const monthKey = getMonthLabel(e.date);
        const isPast = e.date < today;

        if (isPast) {
          if (!pastGroups[monthKey]) pastGroups[monthKey] = [];
          pastGroups[monthKey].push(createCard(e, d.id));
        } else {
          if (!upcomingGroups[monthKey]) upcomingGroups[monthKey] = [];
          upcomingGroups[monthKey].push(createCard(e, d.id));
        }
      });

      renderGroup(upcomingGroups, "📅 Próximos Eventos", "#27ae60");
      renderGroup(pastGroups, "📜 Historial", "#7f8c8d");

      updateStats(allEvents);
    });
  }

  function renderGroup(groups, sectionTitle, color) {
    if (Object.keys(groups).length === 0) return;
    eventsList.innerHTML += `<h3 style="color:${color}; margin-top:30px;">${sectionTitle}</h3>`;
    for (const month in groups) {
      eventsList.innerHTML += `<h4 style="margin: 15px 0 5px 0; color: #d4af37;">${month}</h4>`;
      groups[month].forEach((card) => (eventsList.innerHTML += card));
    }
  }

  function createCard(e, id) {
    const colors = {
      Presupuestado: "#f1c40f",
      "Seña pagada": "#e67e22",
      Confirmado: "#27ae60",
      Realizado: "#2980b9",
      Cancelado: "#c0392b",
    };
    const statusStyle = `background:${colors[e.status] || "#666"}; color:white; padding:4px 10px; border-radius:12px; font-size:0.75em; font-weight:bold; display:inline-block; min-width:80px; text-align:center;`;

    return `
      <div class="card" onclick="fillFormForEdit(${JSON.stringify(e).replace(/"/g, "'")}, '${id}')" style="cursor:pointer; border:1px solid #ddd; padding:12px; border-radius:8px; margin-bottom:10px; background:white;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <strong>${formatDate(e.date)}</strong> - ${e.type}<br>
            <small style="color:#555;">Cliente: ${e.client} | Lugar: ${e.place}</small>
          </div>
          <span style="${statusStyle}">${e.status}</span>
        </div>
        <div style="margin-top:8px; font-size:0.9em; color:#333;">
          👥 ${e.guests} pers. | 💰 $${Number(e.total).toLocaleString()} 
          (Seña: $${Number(e.deposit).toLocaleString()})
        </div>
      </div>
    `;
  }

  function updateStats(events) {
    const selectedMonth = monthFilter.value;
    let total = 0,
      senas = 0,
      cantidad = 0;
    events.forEach((e) => {
      if (!selectedMonth || e.date.startsWith(selectedMonth)) {
        total += Number(e.total) || 0;
        senas += Number(e.deposit) || 0;
        cantidad++;
      }
    });
    if (document.getElementById("totalMes"))
      document.getElementById("totalMes").innerText =
        `$${total.toLocaleString()}`;
    if (document.getElementById("senasMes"))
      document.getElementById("senasMes").innerText =
        `$${senas.toLocaleString()}`;
    if (document.getElementById("saldoMes"))
      document.getElementById("saldoMes").innerText =
        `$${(total - senas).toLocaleString()}`;
    if (document.getElementById("eventosMes"))
      document.getElementById("eventosMes").innerText = cantidad;
  }
}

export function fillFormForEdit(e, id) {
  const fields = [
    "date",
    "type",
    "client",
    "cuit",
    "place",
    "guests",
    "total",
    "deposit",
    "status",
    "invoiceNumber",
    "notes",
  ];
  fields.forEach((f) => {
    if (document.getElementById(f))
      document.getElementById(f).value = e[f] || "";
  });
  if (document.getElementById("paid"))
    document.getElementById("paid").value = e.paid ? "true" : "false";
  editingId = id;
  document.getElementById("formTitle").innerText = "Editando Evento";
  document.getElementById("updateBtn").style.display = "inline-block";
  document.getElementById("addBtn").style.display = "none";
  document.getElementById("eventFormContainer").style.display = "block";
  document
    .getElementById("eventFormContainer")
    .scrollIntoView({ behavior: "smooth" });
}

function resetForm() {
  editingId = null;
  document.getElementById("eventFormContainer").style.display = "none";
  document.getElementById("updateBtn").style.display = "none";
  document.getElementById("addBtn").style.display = "inline-block";
}
