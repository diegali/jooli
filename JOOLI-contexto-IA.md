# 🧠 CONTEXTO PARA IA – JOOLI CateringDesk

> Pegá este archivo al inicio de cada chat nuevo para trabajar sin subir el proyecto.

---

## ⚠️ CÓMO TRABAJAR CONMIGO

Soy principiante. Necesito ayuda **paso a paso**, sin romper lo que ya funciona.

**Formato de respuesta que quiero siempre:**

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

## 🎯 QUÉ ES ESTA APP

**JOOLI CateringDesk** es una app interna para gestionar eventos de catering.  
La usa un equipo chico. Reemplaza papeles, WhatsApp, Excel y memoria del equipo.  
Se usa principalmente desde el **celular**.

---

## 🧰 TECNOLOGÍAS

- HTML + CSS + JavaScript (vanilla, sin frameworks)
- Firebase Auth (login)
- Firestore (base de datos en tiempo real)
- Firebase Storage (archivos adjuntos)
- GitHub Pages (hosting)
- PWA (manifest.json + sw.js)

**Librerías externas:**
- FullCalendar (calendario)
- Google Maps (ubicación)
- Chart.js (estadísticas)
- jsPDF (exportar PDF)

**Firebase versión:** `10.12.0` (importado desde CDN de gstatic)

---

## 🧱 ESTRUCTURA DE ARCHIVOS

```
index.html              ← estructura general de la app (28KB)
manifest.json           ← config PWA
sw.js                   ← service worker

css/
  base.css              ← estilos globales
  layout.css            ← estructura general
  login.css             ← pantalla de acceso
  events.css            ← estilos de eventos (el más grande, 17KB)
  staff.css             ← personal (12KB)
  checklist.css         ← checklist
  modals.css            ← ventanas modales

js/
  auth.js               ← Firebase config + login
  main.js               ← coordina toda la app
  calendar.js           ← calendario (FullCalendar)
  events.js             ← lógica principal de eventos (50KB, el más grande)
  staff.js              ← gestión de personal (49KB)
  lista.js              ← checklist y catálogo (19KB)
  ui.js                 ← utilidades visuales menores

  events/               ← submódulos de eventos
    events-form.js      ← formulario alta/edición (13KB)
    events-render.js    ← renderizado de tarjetas (22KB)
    events-jornadas.js  ← lógica de eventos multidia (10KB)
    events-maps.js      ← integración Google Maps (3KB)
    events-budget.js    ← presupuesto/factura/alquileres (9KB)
    events-avisos.js    ← alertas y confirmaciones (6KB)
    events-utils.js     ← helpers compartidos (1KB)

images/
  presupuesto-asado.png
  presupuesto-catering.jpg / .png
  presupuesto-coffee.png
```

---

## 🔥 BASE DE DATOS FIRESTORE

Colecciones usadas:

| Colección           | Qué guarda                            |
|---------------------|---------------------------------------|
| `events`            | Todos los eventos de catering         |
| `staff`             | Lista de personal (mozos, etc.)       |
| `catalogoChecklist` | Ítems base del catálogo de checklist  |
| `notificaciones`    | Avisos entre usuarios en tiempo real  |

---

## 👤 USUARIOS

Los usuarios están mapeados en `js/events/events-utils.js`:

```js
export const USUARIOS_MAP = {
  "almos2712@hotmail.com": "Laura",
  "mariano@a.com": "Mariano",
  "seba@a.com": "Sebastián",
};
```

---

## ⚙️ FUNCIONALIDADES IMPLEMENTADAS

### Eventos
- Calendario mensual (FullCalendar)
- Lista de eventos con filtros por estado y búsqueda
- Crear / editar / eliminar eventos
- Eventos de un día y de varios días (jornadas)
- Cada evento tiene: cliente, fecha, tipo, lugar, invitados, staff necesario, hora inicio/fin, notas
- Estados: `Presupuestado` / `Seña pagada` / `Confirmado` / `Realizado` / `Cancelado`
- Confirmación visual cuando un evento ya pasó
- Aviso antes de salir si hay cambios sin guardar

### Jornadas (eventos multidia)
- Checkbox "Evento de varios días" en el formulario
- Cada jornada tiene su fecha, tipo, lugar, invitados, staff necesario, horarios, notas y alquileres
- Nueva jornada hereda datos de la anterior automáticamente

### Staff / Personal
- Alta, edición y baja de personal con nombre, teléfono, DNI, categoría
- Asignación de staff a eventos
- Estados por persona en cada evento: `pendiente` / `confirmado` / `rechazado`
- Conteo de faltantes de staff
- Envío de mensajes de WhatsApp prearmados
- Vista de eventos por mozo

### Checklist
- Checklist por evento (ítems que se marcan)
- Catálogo base reutilizable con categorías
- Buscador de ítems
- Modal con pestañas: Checklist / Catálogo

### Administración / Presupuesto
- Total, seña y saldo del evento
- Estado de pago (`paid: true/false`)
- Tipo de factura
- Adjuntos: presupuesto, factura, alquiler (imágenes subidas a Firebase Storage)
- Estadísticas (Chart.js)

### Notificaciones
- Sistema en tiempo real con Firestore (`onSnapshot`)
- Sonido al recibir nueva notificación
- Panel de notificaciones con hora formateada
- Se marcan como leídas automáticamente al abrir el panel

---

## 🧠 RESPONSABILIDAD DE CADA ARCHIVO JS

### `auth.js`
- Inicializa Firebase (Auth, Firestore, Storage)
- Exporta: `auth`, `db`, `storage`
- **No tocar a menos que sea necesario**

### `main.js`
- Arranca la app al detectar login (`onAuthStateChanged`)
- Llama a `initEvents()`, `initCalendar()`, `initStaff()`, `initLista()`
- Maneja navegación entre secciones (`showSection`)
- Maneja notificaciones en tiempo real
- **No agregar lógica de negocio acá**

### `events.js`
- Lógica principal de eventos: guardar, editar, eliminar
- Escucha Firestore con `onSnapshot` → llena `window.allEventsData`
- Funciones globales: `mostrarAvisoSimple`, `resetFormConfirmado`, `confirmarEliminarEvento`
- Coordina los submódulos de `js/events/`

### `events-form.js`
- Formulario de alta/edición de evento
- `resetForm()` → limpia el formulario
- `getFormData()` → lee todos los campos del formulario
- `fillFormForEdit(evento)` → carga datos de un evento para editar
- Formatea CUIT automáticamente

### `events-render.js`
- Renderiza las tarjetas de eventos en la lista
- `renderFilteredEvents(events, deps)` → genera el HTML de todos los eventos
- Crea cards con botones de editar, checklist, staff, etc.
- Filtra por estado activo y separa en "próximos" y "pasados"

### `events-jornadas.js`
- `initJornadas()` → registra `window.toggleMultidia` y `window.agregarJornada`
- Maneja la lista de jornadas dentro del formulario

### `events-maps.js`
- Integración con Google Maps para seleccionar ubicación del evento

### `events-budget.js`
- Lógica de presupuesto, factura y alquileres
- Subida/eliminación de archivos a Firebase Storage
- `actualizarUIBudget(evento)` → actualiza los botones de adjuntos

### `events-avisos.js`
- `initAvisos()` → controla el modal de confirmación de realización
- Verifica si hay eventos pasados que necesiten ser confirmados

### `events-utils.js`
- Helpers compartidos: `formatDate`, `formatDateShort`, `getMonthLabel`, `getCurrentUserName`
- `STATUS_COLORS` → colores por estado de evento
- `USUARIOS_MAP` → mapa de email → nombre

### `staff.js`
- CRUD completo de personal en Firestore (`staff`)
- Asignación de staff a eventos
- Rotación de estados (pendiente → confirmado → rechazado)
- Envío de WhatsApp
- Modal de gestión de staff por evento (`abrirModalGestionStaff`)
- Vista de historial de eventos por mozo

### `lista.js`
- Modal de checklist por evento
- Catálogo base en Firestore (`catalogoChecklist`)
- Pestañas: Checklist / Catálogo
- Buscar ítems, agregar al catálogo, marcar/desmarcar

### `calendar.js`
- Calendario con FullCalendar
- Lee eventos de Firestore y los muestra en el calendario
- Al hacer clic en un día → muestra resumen de eventos
- Al hacer clic en un evento → abre modal de detalle

### `ui.js`
- Utilidades visuales menores (actualmente pequeño, 611 bytes)

---

## 🗂️ ESTRUCTURA DE UN EVENTO EN FIRESTORE

```js
{
  client: "Nombre del cliente",
  date: "2026-04-15",           // para eventos de un día
  type: "Catering Completo",
  place: "Salón El Ombú",
  guests: 120,
  staffNeeded: 5,
  timeStart: "19:00",
  timeEnd: "23:00",
  timePresentation: "18:30",
  notes: "...",
  status: "Confirmado",         // Presupuestado / Seña pagada / Confirmado / Realizado / Cancelado
  paid: false,
  total: 150000,
  sena: 50000,
  invoiceType: "Factura A",
  staff: [                      // array de staff asignado
    { nombre: "Juan", estado: "confirmado", telefono: "...", whatsappEnviado: true }
  ],
  checklist: [                  // array de ítems del checklist
    { nombre: "Mantelería", categoria: "Ropa", checked: true }
  ],
  esMultidia: false,
  jornadas: [],                 // si esMultidia = true
  realizacionConfirmada: false,
  createdBy: "Laura",
  createdAt: Timestamp,
  // archivos adjuntos (URLs de Firebase Storage):
  presupuestoURL: "...",
  facturaURL: "...",
}
```

---

## 🧩 ESTRUCTURA DE UNA JORNADA

```js
{
  fecha: "2026-04-15",
  tipo: "Catering Completo",
  lugar: "...",
  invitados: 80,
  staffNecesario: 4,
  horaInicio: "19:00",
  horaFin: "23:00",
  horaPresentacion: "18:30",
  notas: "...",
  alquileres: {
    vajilla: false,
    manteleria: false,
    mobiliario: false,
    mobiliarioTrabajo: false,
    notas: ""
  },
  mensajesEnviados: []
}
```

---

## 📌 REGLAS PARA AYUDARME

1. **Paso a paso** → nada de cambios gigantes
2. **Sin romper lo que funciona** → cambios seguros primero
3. **Instrucciones concretas** → "Abrí X, buscá Y, pegá debajo de Z"
4. **Explicación simple** → sin tecnicismos innecesarios
5. **Respetar estructura** → no mezclar todo en un archivo
6. **No duplicar lógica** → usar el archivo correcto
7. **No sobrecargar `main.js`** → la lógica va en el módulo que corresponde
8. **Separar lógica de render** → la lógica en `events.js`, el HTML en `events-render.js`

---

## 🚀 CONTEXTO FINAL

App de uso interno para equipo chico de catering.  
Debe ser simple, rápida, clara y usable desde el celular.  
Apunta a resolver tareas reales del día a día.

---

*Fin del contexto — versión generada el 25/03/2026*
