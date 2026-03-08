import { db } from "./auth.js";
import { fillFormForEdit } from "./events.js";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let calendar;

export function initCalendar() {
  const calendarEl = document.getElementById("calendar");
  if (!calendarEl) return;

  if (calendar) {
    calendar.destroy();
  }

  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    // --- FORZAMOS EL IDIOMA ESPAÑOL ---
    locale: "es",
    // ----------------------------------
    height: "auto",
    headerToolbar: {
      left: "prev,next",
      center: "title",
      right: "dayGridMonth",
    },
    buttonText: {
      today: "Hoy",
      month: "Mes",
      week: "Semana",
    },
    dateClick: function (info) {
      const showFormBtn = document.getElementById("showFormBtn");
      if (showFormBtn) showFormBtn.click();

      const dateInput = document.getElementById("date");
      if (dateInput) dateInput.value = info.dateStr;
    },
    eventClick: function (info) {
      fillFormForEdit(info.event.extendedProps, info.event.id);
    },
  });

  calendar.render();
  loadCalendarEvents();

  setTimeout(() => {
    calendar.updateSize();
  }, 500);
}

export function refreshCalendar() {
  if (calendar) calendar.updateSize();
}

function loadCalendarEvents() {
  const q = query(collection(db, "events"), orderBy("date"));

  onSnapshot(q, (snap) => {
    if (!calendar) return;
    const events = [];

    snap.forEach((d) => {
      const e = d.data();
      const colors = {
        Presupuestado: "#f1c40f",
        "Seña pagada": "#e67e22",
        Confirmado: "#27ae60",
        Realizado: "#2980b9",
        Cancelado: "#c0392b",
      };

      events.push({
        id: d.id,
        title: e.client,
        start: e.date,
        backgroundColor: colors[e.status] || "#ccc",
        borderColor: colors[e.status] || "#ccc",
        extendedProps: e,
      });
    });

    calendar.removeAllEvents();
    calendar.addEventSource(events);
  });
}
