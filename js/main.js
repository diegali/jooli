import { initAuth } from "./auth.js";
import { initEvents } from "./events.js";
import { initCalendar, refreshCalendar } from "./calendar.js"; // Importamos refresh
import { initUI } from "./ui.js";

const loginDiv = document.getElementById("loginDiv");
const appDiv = document.getElementById("appDiv");

document.getElementById("darkBtn").onclick =
  () => document.body.classList.toggle("dark");

initAuth((user) => {
  loginDiv.style.display = "none";
  appDiv.style.display = "block";

  initUI();
  initEvents();
  
  // Vamos a darle un poco más de tiempo para asegurar que el DOM esté pintado
  requestAnimationFrame(() => {
    setTimeout(() => {
      initCalendar();
    }, 300);
  });
});