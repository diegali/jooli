import { db } from "./auth.js"; //
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"; //

let editingId = null; //

export function initEvents() {
  const eventsList = document.getElementById("eventsList"); //
  const monthFilter = document.getElementById("monthFilter"); //

  loadEvents(); //

  document.getElementById("addBtn").onclick = () => saveEvent(false); //
  document.getElementById("updateBtn").onclick = () => saveEvent(true); //
  document.getElementById("newBtn").onclick = resetForm; //

  if (monthFilter) {
    monthFilter.addEventListener("change", loadEvents); //
  }

  // --- FUNCIÓN PARA ACTUALIZAR ESTADÍSTICAS ---
  function updateStats(events) {
    const selectedMonth = monthFilter.value; // Obtiene el valor del filtro (YYYY-MM)
    let total = 0, senas = 0, cantidad = 0; //

    events.forEach(e => {
      // Si no hay filtro o si la fecha del evento coincide con el mes seleccionado
      if (!selectedMonth || e.date.startsWith(selectedMonth)) {
        total += Number(e.total) || 0; //
        senas += Number(e.deposit) || 0; //
        cantidad++; //
      }
    });

    // Inyecta los valores en el HTML del index
    document.getElementById("totalMes").innerText = `$${total.toLocaleString()}`; //
    document.getElementById("senasMes").innerText = `$${senas.toLocaleString()}`; //
    document.getElementById("saldoMes").innerText = `$${(total - senas).toLocaleString()}`; //
    document.getElementById("eventosMes").innerText = cantidad; //
  }

  async function saveEvent(isUpdate = false) {
    const data = {
      date: document.getElementById("date").value, //
      type: document.getElementById("type").value, //
      client: document.getElementById("client").value, //
      cuit: document.getElementById("cuit").value, //
      place: document.getElementById("place").value, //
      guests: Number(document.getElementById("guests").value) || 0, //
      total: Number(document.getElementById("total").value) || 0, //
      deposit: Number(document.getElementById("deposit").value) || 0, //
      status: document.getElementById("status").value, //
      paid: document.getElementById("paid").value === "true", //
      invoiceNumber: document.getElementById("invoiceNumber").value, //
      notes: document.getElementById("notes").value //
    };

    try {
      if (isUpdate && editingId) {
        await updateDoc(doc(db, "events", editingId), data); //
        editingId = null; //
        document.getElementById("updateBtn").style.display = "none"; //
        document.getElementById("addBtn").style.display = "inline-block"; //
      } else {
        await addDoc(collection(db, "events"), data); //
      }
      resetForm(); // Usamos la función reset para limpiar todo correctamente
    } catch (e) {
      alert("Error guardando evento: " + e.message); //
    }
  }

  function loadEvents() {
    const q = query(collection(db, "events"), orderBy("date")); //

    onSnapshot(q, (snap) => {
      eventsList.innerHTML = ""; //
      const allEvents = []; // Array temporal para las estadísticas

      snap.forEach(d => {
        const e = d.data(); //
        allEvents.push(e); // Guardamos los datos para calcular

        const card = document.createElement("div"); //
        card.className = "card"; //
        card.dataset.id = d.id; //

        card.innerHTML = `
          <strong>${formatDate(e.date)}</strong> - ${e.type} (${e.client})<br>
          Estado: <span class="status-badge">${e.status}</span><br>
          📍 ${e.place} | 👥 ${e.guests}<br>
          💰 Total: $${e.total.toLocaleString()} | 💵 Seña: $${e.deposit.toLocaleString()}<br>
          <button class="deleteBtn">Eliminar</button>
        `; //

        card.querySelector(".deleteBtn").onclick = (ev) => {
          ev.stopPropagation(); //
          if (confirm("Eliminar evento?")) {
            deleteDoc(doc(db, "events", d.id)); //
          }
        };

        card.onclick = () => fillForm(e, d.id); //
        eventsList.appendChild(card); //
      });

      updateStats(allEvents); // Calculamos las estadísticas después de cargar las tarjetas
    });
  }

  function fillForm(e, id) {
    editingId = id; //
    document.getElementById("date").value = e.date; //
    document.getElementById("type").value = e.type; //
    document.getElementById("client").value = e.client; //
    document.getElementById("cuit").value = e.cuit || ""; //
    document.getElementById("place").value = e.place; //
    document.getElementById("guests").value = e.guests || 0; //
    document.getElementById("total").value = e.total || 0; //
    document.getElementById("deposit").value = e.deposit || 0; //
    document.getElementById("status").value = e.status; //
    document.getElementById("paid").value = e.paid ? "true" : "false"; //
    document.getElementById("invoiceNumber").value = e.invoiceNumber || ""; //
    document.getElementById("notes").value = e.notes || ""; //

    document.getElementById("updateBtn").style.display = "inline-block"; //
    document.getElementById("addBtn").style.display = "none"; //
  }

  function resetForm() {
    editingId = null; //
    document.querySelectorAll("#appDiv input, #appDiv textarea").forEach(el => {
      if (el.id !== "monthFilter") el.value = ""; // No borramos el filtro de mes
    });
    document.getElementById("status").value = "Presupuestado"; //
    document.getElementById("paid").value = "false"; //
    document.getElementById("updateBtn").style.display = "none"; //
    document.getElementById("addBtn").style.display = "inline-block"; //
  }
}

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00"); // Forzamos hora local para evitar desfases de zona horaria
  return d.toLocaleDateString("es-AR"); //
}

// Mantener esta función por si el calendario la necesita
export function fillFormForEdit(e, id) {
  editingId = id; //
  // ... (puedes llamar internamente a fillForm para no repetir código)
}