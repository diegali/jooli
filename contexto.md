# 🧠 CONTEXTO BASE PARA IA – JOOLI CATERINGDESK

Estoy desarrollando una app llamada **JOOLI CateringDesk** para una empresa de catering donde trabaja mi esposa.

⚠️ **IMPORTANTE:** Soy principiante.
Necesito ayuda **paso a paso**, sin romper lo que ya funciona.

---

## 🎯 OBJETIVO DE LA APP

Centralizar la gestión de eventos de catering en una sola herramienta.

Reemplaza:

* papeles
* WhatsApp desordenado
* Excel
* memoria del equipo

Se usa principalmente desde **celular**.

---

## 🧰 TECNOLOGÍAS

* HTML
* CSS
* JavaScript (vanilla)
* Firebase Auth
* Firestore
* Firebase Storage (o Google Drive)
* GitHub Pages
* PWA (manifest.json + service worker)

Librerías:

* FullCalendar
* Google Maps
* Chart.js
* jsPDF

---

## ⚙️ FUNCIONALIDADES PRINCIPALES

### Eventos

* calendario
* lista de eventos
* crear / editar / eliminar
* eventos de varios días (jornadas)
* duplicar eventos
* ubicación con mapa

### Staff

* alta/baja de personal
* asignación a eventos
* estados: pendiente / confirmado / rechazado
* conteo de faltantes
* mensajes de WhatsApp

### Checklist

* checklist por evento
* checklist por jornada
* catálogo base reutilizable
* buscador
* progreso
* exportación PDF

### Administración

* total
* seña
* saldo
* estado de pago
* estadísticas
* adjuntos (presupuesto / factura)

---

## 🧱 ESTRUCTURA DEL PROYECTO

```
index.html
manifest.json
sw.js

css/
base.css
layout.css
login.css
events.css
staff.css
checklist.css
modals.css

js/
main.js
auth.js
calendar.js
events.js
staff.js
lista.js
ui.js

events/
events-form.js
events-render.js
events-jornadas.js
events-maps.js
events-budget.js
events-avisos.js
events-utils.js
```

---

## 🧠 RESPONSABILIDAD DE CADA PARTE

### HTML

* `index.html` → estructura general de la app

### CSS

* base → estilos globales
* layout → estructura
* events → eventos
* staff → personal
* checklist → checklist
* modals → ventanas
* login → acceso

### JS

* `main.js` → coordina toda la app
* `auth.js` → Firebase + login
* `calendar.js` → calendario
* `events.js` → lógica principal de eventos
* `staff.js` → personal
* `lista.js` → checklist / catálogo
* `ui.js` → utilidades visuales

### Submódulos de eventos

* `events-form.js` → formulario
* `events-render.js` → render de eventos
* `events-jornadas.js` → múltiples días
* `events-maps.js` → mapas
* `events-budget.js` → presupuestos
* `events-avisos.js` → alertas
* `events-utils.js` → helpers

---

## 🧭 FORMA DE TRABAJO QUE NECESITO

Quiero que me ayudes así:

### 1. Paso a paso

Nada de cambios gigantes.

### 2. Sin romper lo que funciona

Priorizar cambios seguros.

### 3. Instrucciones concretas

Ejemplo:

* Abrí `events.js`
* Buscá X función
* Pegá esto abajo de...
* Reemplazá solo este bloque

### 4. Explicación simple

Sin tecnicismos innecesarios.

### 5. Respetar estructura actual

No mezclar todo en un solo archivo.

---

## ⚠️ REGLAS IMPORTANTES

* no duplicar lógica
* no sobrecargar `main.js`
* usar el archivo correcto
* separar lógica de render
* mantener código simple
* mejorar de forma progresiva (no refactor gigante)

---

## 🧑‍💻 TIPO DE AYUDA QUE NECESITO

* corregir errores
* agregar funciones
* mejorar UX/UI
* ordenar código
* trabajar con Firebase
* manejar datos en Firestore
* modales
* WhatsApp
* funcionamiento en móvil

---

## 📌 FORMATO DE RESPUESTA QUE QUIERO

Cuando me ayudes, usá este formato:

### Qué vamos a hacer

Breve explicación

### Archivo a tocar

Nombre exacto

### Qué buscar

Función o bloque

### Qué pegar o reemplazar

Código exacto

### Dónde va

Ubicación clara

### Qué debería pasar

Resultado esperado

---

## 🧾 PEDIDO BASE

"Explicame como principiante, respetando la estructura actual, y decime exactamente qué archivo tocar, qué código agregar o reemplazar y dónde pegarlo."

---

## 🚀 CONTEXTO FINAL

Esta app es de uso interno para un equipo chico de catering.

Debe ser:

* simple
* rápida
* clara
* usable desde el celular

Apunta a resolver tareas reales del día a día, no a ser un producto genérico.

---

FIN DEL CONTEXTO
