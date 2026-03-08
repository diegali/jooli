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

export function initCalendar(){

const calendarEl = document.getElementById("calendar");

calendar = new FullCalendar.Calendar(calendarEl,{

initialView:'dayGridMonth',

locale:'es',

height:'auto',

headerToolbar:{
left:'prev,next today',
center:'title',
right:'dayGridMonth,timeGridWeek,timeGridDay'
},

buttonText:{
today:'Hoy',
month:'Mes',
week:'Semana',
day:'Día'
},

eventClick:function(info){

const e = info.event.extendedProps;

highlightCard(info.event.id);

highlightCalendarEvent(info.event.id);

// resaltar tarjeta correspondiente
const cards = document.querySelectorAll(".card");
cards.forEach(c => c.classList.remove("selected"));

const card = document.querySelector(`[data-id="${info.event.id}"]`);
if(card){
  card.classList.add("selected");
}

// cargar datos en el formulario
fillFormForEdit(info.event.extendedProps, info.event.id);

}

});

calendar.render();

loadCalendarEvents();

}

function loadCalendarEvents(){

const q=query(collection(db,"events"),orderBy("date"));

onSnapshot(q,(snap)=>{

const events=[];

snap.forEach(d=>{

const e=d.data();

const colors={
"Presupuestado":"#f1c40f",
"Seña pagada":"#e67e22",
"Confirmado":"#27ae60",
"Realizado":"#2980b9",
"Cancelado":"#c0392b"
};

events.push({

id:d.id,
title:`${e.type} - ${e.client}`,
start:e.date,
backgroundColor:colors[e.status],
borderColor:colors[e.status],
extendedProps:e

});

});

calendar.removeAllEvents();
calendar.addEventSource(events);

});

}

function highlightCalendarEvent(id){

calendar.getEvents().forEach(ev=>{

if(ev.id === id){

ev.setProp("backgroundColor","#d4af37");
ev.setProp("borderColor","#d4af37");

}else{

const colors={
"Presupuestado":"#f1c40f",
"Seña pagada":"#e67e22",
"Confirmado":"#27ae60",
"Realizado":"#2980b9",
"Cancelado":"#c0392b"
};

ev.setProp("backgroundColor",colors[ev.extendedProps.status]);
ev.setProp("borderColor",colors[ev.extendedProps.status]);

}

});

}