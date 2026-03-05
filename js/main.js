<<<<<<< HEAD
import { initAuth } from "./auth.js";
import { initEvents } from "./events.js";
import { initCalendar } from "./calendar.js";
import { initUI } from "./ui.js";

const loginDiv = document.getElementById("loginDiv");
const appDiv = document.getElementById("appDiv");

document.getElementById("darkBtn").onclick =
  ()=>document.body.classList.toggle("dark");

initAuth(()=>{

  loginDiv.style.display="none";
  appDiv.style.display="block";

  initUI();
  initEvents();
  initCalendar();

});

if("serviceWorker" in navigator){
  navigator.serviceWorker.register("./sw.js")
  .then(()=>console.log("Service Worker activo"))
  .catch(err=>console.log("SW error",err));
=======
import { initAuth } from "./auth.js";
import { initEvents } from "./events.js";
import { initCalendar } from "./calendar.js";
import { initUI } from "./ui.js";

const loginDiv = document.getElementById("loginDiv");
const appDiv = document.getElementById("appDiv");

document.getElementById("darkBtn").onclick =
  ()=>document.body.classList.toggle("dark");

initAuth(()=>{

  loginDiv.style.display="none";
  appDiv.style.display="block";

  initUI();
  initEvents();
  initCalendar();

});

if("serviceWorker" in navigator){
  navigator.serviceWorker.register("./sw.js")
  .then(()=>console.log("Service Worker activo"))
  .catch(err=>console.log("SW error",err));
>>>>>>> fcda53b8105f9871b9706217fffbb0d0338283dd
}