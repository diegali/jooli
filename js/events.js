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

export function initEvents() {

  const eventsList = document.getElementById("eventsList");
  const monthFilter = document.getElementById("monthFilter");

  loadEvents();

  document.getElementById("addBtn").onclick = () => saveEvent(false);
  document.getElementById("updateBtn").onclick = () => saveEvent(true);
  document.getElementById("newBtn").onclick = resetForm;

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

        editingId = null;

        document.getElementById("updateBtn").style.display = "none";
        document.getElementById("addBtn").style.display = "inline-block";

      } else {

        await addDoc(collection(db, "events"), data);

      }

      document.querySelectorAll("#appDiv input,#appDiv textarea")
        .forEach(el => el.value = "");

    } catch (e) {

      alert("Error guardando evento: " + e.message);

    }

  }

  function loadEvents() {

    const q = query(collection(db, "events"), orderBy("date"));

    onSnapshot(q, (snap) => {

      eventsList.innerHTML = "";

      snap.forEach(d => {

        const e = d.data();

        const card = document.createElement("div");

        card.className = "card";
        card.dataset.id = d.id;

        card.innerHTML = `

<strong>${formatDate(e.date)}</strong> - ${e.type} (${e.client})<br>

CUIT: ${e.cuit || ""}<br>
📍 ${e.place}<br>
👥 ${e.guests}<br>
💰 $${e.total}<br>
💵 Seña $${e.deposit}<br>
Pagado: ${e.paid ? "Sí" : "No"}<br>
Factura: ${e.invoiceNumber || ""}<br><br>

<button class="deleteBtn">Eliminar</button>

`;

        card.querySelector(".deleteBtn").onclick = (ev) => {

          ev.stopPropagation();

          if (confirm("Eliminar evento?")) {
            deleteDoc(doc(db, "events", d.id));
          }

        };

        card.onclick = () => fillForm(e, d.id);

        eventsList.appendChild(card);

      });

    });

  }

  function fillForm(e, id) {

    editingId = id;

    document.getElementById("date").value = e.date;
    document.getElementById("type").value = e.type;
    document.getElementById("client").value = e.client;
    document.getElementById("cuit").value = e.cuit || "";
    document.getElementById("place").value = e.place;
    document.getElementById("guests").value = e.guests || 0;
    document.getElementById("total").value = e.total || 0;
    document.getElementById("deposit").value = e.deposit || 0;
    document.getElementById("status").value = e.status;
    document.getElementById("paid").value = e.paid ? "true" : "false";
    document.getElementById("invoiceNumber").value = e.invoiceNumber || "";
    document.getElementById("notes").value = e.notes || "";

    document.getElementById("updateBtn").style.display = "inline-block";
    document.getElementById("addBtn").style.display = "none";

  }

  function resetForm(){

editingId = null;

// limpiar campos
document.querySelectorAll("#appDiv input,#appDiv textarea")
.forEach(el=>el.value="");

document.getElementById("status").value="Presupuestado";
document.getElementById("paid").value="false";

// botones
document.getElementById("updateBtn").style.display="none";
document.getElementById("addBtn").style.display="inline-block";

// quitar selección de tarjetas
document.querySelectorAll(".card")
.forEach(c=>c.classList.remove("selected"));

}

}

function formatDate(dateStr) {

  const d = new Date(dateStr);

  return d.toLocaleDateString("es-AR");

}

export function fillFormForEdit(eventData, id){

  const e = eventData;

  document.getElementById("date").value = e.date;
 document.getElementById("type").scrollIntoView({ behavior: "smooth",
  block: "center"
});  document.getElementById("client").value = e.client;
  document.getElementById("cuit").value = e.cuit || "";
  document.getElementById("place").value = e.place;
  document.getElementById("guests").value = e.guests || 0;
  document.getElementById("total").value = e.total || 0;
  document.getElementById("deposit").value = e.deposit || 0;
  document.getElementById("status").value = e.status;
  document.getElementById("paid").value = e.paid ? "true" : "false";
  document.getElementById("invoiceNumber").value = e.invoiceNumber || "";
  document.getElementById("notes").value = e.notes || "";

  editingId = id;

  document.getElementById("updateBtn").style.display = "inline-block";
  document.getElementById("addBtn").style.display = "none";

  // SCROLL al formulario de edición
  document.getElementById("date").scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

}