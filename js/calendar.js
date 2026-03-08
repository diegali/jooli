import { db } from "./auth.js";
import { highlightCard } from "./ui.js";
import { fillFormForEdit } from "./events.js";
import {
  collection,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let calendar;

export function initCalendar() {
  const calendarEl = document.getElementById("calendar");
  
  if (!calendarEl) return; // Seguridad

  // Destruir si ya existe
  if (calendar) { calendar.destroy(); }

 calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'es',
    height: 'auto',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek'
    },
    buttonText: {
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana'
    },
    // --- ESTO ES LO QUE FALTABA ---
    eventClick: function(info) {
      console.log("Clic en evento:", info.event.id);
      
      // 1. Cargamos los datos en el formulario usando la función que ya tenías
      fillFormForEdit(info.event.extendedProps, info.event.id);
      
      // 2. Mostramos el contenedor del formulario que ocultamos antes
      const formContainer = document.getElementById("eventFormContainer");
      if (formContainer) {
        formContainer.style.display = "block";
        formContainer.scrollIntoView({ behavior: "smooth" });
      }
    }
    // -------------------------------
  });

  calendar.render();
  loadCalendarEvents();
  
  // Forzar un refresco extra un poco más tarde
  setTimeout(() => {
    calendar.updateSize();
  }, 500);
}

// Nueva función para forzar el re-dibujado
export function refreshCalendar() {
  if (calendar) {
    calendar.updateSize();
  }
}

function loadCalendarEvents() {
  const q = query(collection(db, "events"), orderBy("date"));

  onSnapshot(q, (snap) => {
    const events = [];
    snap.forEach(d => {
      const e = d.data();
      const colors = {
        "Presupuestado": "#f1c40f",
        "Seña pagada": "#e67e22",
        "Confirmado": "#27ae60",
        "Realizado": "#2980b9",
        "Cancelado": "#c0392b"
      };

      events.push({
        id: d.id,
        title: `${e.type} - ${e.client}`,
        start: e.date,
        backgroundColor: colors[e.status] || "#ccc",
        borderColor: colors[e.status] || "#ccc",
        extendedProps: e
      });
    });

    calendar.removeAllEvents();
    calendar.addEventSource(events);
  });
}