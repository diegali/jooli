# 🧠 CONTEXTO PARA IA – JOOLI CateringDesk (v4 — actualizado 27/03/2026)

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
La usa un equipo chico (Laura, Mariano, Sebastián). Reemplaza papeles, WhatsApp, Excel y memoria del equipo.
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
- FullCalendar 6.1.8 (solo `index.global.min.js`, los locales vienen incluidos — NO agregar locales-all.global.min.js, no existe en esa versión)
- Google Maps (ubicación)
- Chart.js (estadísticas)
- jsPDF (exportar PDF — usado en ART de staff, checklist y presupuesto)

**Firebase versión:** `10.12.0` (importado desde CDN de gstatic)

---

## 🧱 ESTRUCTURA DE ARCHIVOS

```
index.html              ← estructura general + registro del SW al final del body
manifest.json           ← config PWA
sw.js                   ← service worker (versión jooli-v6)

css/
  base.css              ← variables globales de color y tipografía
  layout.css            ← estructura general
  login.css             ← pantalla de acceso
  events.css            ← estilos de eventos
  staff.css             ← personal
  checklist.css         ← checklist
  modals.css            ← ventanas modales

js/
  auth.js               ← Firebase config + login
  main.js               ← coordina toda la app
  calendar.js           ← calendario (FullCalendar)
  events.js             ← lógica principal de eventos
  staff.js              ← gestión de personal
  lista.js              ← checklist y catálogo
  ui.js                 ← utilidades visuales menores

  events/               ← submódulos de eventos
    events-form.js      ← formulario alta/edición
    events-render.js    ← renderizado de tarjetas
    events-jornadas.js  ← lógica de eventos multidia
    events-maps.js      ← integración Google Maps
    events-budget.js    ← presupuesto/factura/alquileres
    events-avisos.js    ← alertas y confirmaciones
    events-utils.js     ← helpers compartidos

images/
  presupuesto-asado.png
  presupuesto-catering.jpg / .png
  presupuesto-coffee.png
```

---

## 🔥 BASE DE DATOS FIRESTORE

| Colección           | Qué guarda                            |
|---------------------|---------------------------------------|
| `events`            | Todos los eventos de catering         |
| `staff`             | Lista de personal (mozos, etc.)       |
| `catalogoChecklist` | Ítems base del catálogo de checklist  |
| `notificaciones`    | Avisos entre usuarios en tiempo real  |

---

## 👤 USUARIOS

Mapeados en `js/events/events-utils.js` (hardcodeado, no está en Firestore):

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
- Lista de eventos con:
  - Filtro por **estado** (Todos / Presupuestado / Confirmado / Realizado / Cancelado / Cerrado)
  - Filtro por **mes** — segunda fila de botones, aparece solo si hay eventos en más de un mes. Funciona combinado con el filtro de estado.
  - Búsqueda por cliente (campo de texto, filtra por `data-cliente`)
- Crear / editar / eliminar eventos
- **Duplicar evento** desde el modal de detalle
- Eventos de un día y de varios días (jornadas)
- **Countdown en tarjetas**: badge de días que faltan en eventos próximos
- **Indicador visual "evento hoy"**: tarjeta con fondo rosado, nombre en rojo, "🔴 HOY —" antes de la fecha (puro CSS)
- **Aviso al salir sin guardar**: al tocar Cancelar o ＋ si hay cliente, fecha, lugar o notas cargadas
- Confirmación visual cuando un evento pasado no fue confirmado

### Modal de detalle (mejorado)
- Información agrupada en bloques visuales con fondo suave
- Clases: `detail-bloque`, `detail-bloque-fila`, `detail-bloque-icono`, `detail-bloque-texto`
- Bloques: lugar/horario — dinero/factura — staff/checklist — notas — alquileres — jornadas

### Jornadas (eventos multidia)
- Cada jornada tiene fecha, tipo, lugar, invitados, staff, horarios, notas y alquileres
- Nueva jornada hereda datos de la anterior

### Staff / Personal
- Alta, edición y baja con nombre, teléfono, DNI, categoría
- Asignación a eventos, estados (pendiente / confirmado / rechazado)
- Conteo de faltantes, envío de WhatsApp con vista previa
- PDF tipo ART con lista de personal

### Checklist
- Por evento, con catálogo base reutilizable
- Exportación PDF

### Administración / Presupuesto
- Total, saldo, estado de pago, tipo de factura
- Adjuntos en Firebase Storage
- Generación PDF de presupuesto con imagen de fondo
- Estadísticas por mes (Chart.js)

### Notificaciones
- Tiempo real con Firestore `onSnapshot`
- Sonido, panel, se marcan como leídas automáticamente

### PWA / Service Worker
- `sw.js` en versión `jooli-v6`
- Cachea todos los archivos CSS y JS reales del proyecto
- Firebase, gstatic y googleapis van siempre a la red (nunca se cachean)
- Registrado en `index.html` al final del `<body>`
- ⚠️ Cada vez que se suben cambios a GitHub, hay que incrementar `CACHE_NAME` en `sw.js` (jooli-v7, v8...) para que los celulares descarguen los archivos nuevos

---

## 🧠 RESPONSABILIDAD DE CADA ARCHIVO JS

### `auth.js`
Inicializa Firebase. Exporta `auth`, `db`, `storage`. No tocar.

### `main.js`
Arranca la app, maneja navegación entre secciones (`showSection`), avisa si hay edición en curso al cambiar de sección, maneja notificaciones. No agregar lógica de negocio acá.

### `events.js`
Lógica CRUD de eventos. Escucha Firestore → llena `window.allEventsData`. Llama a `actualizarFiltrosMes()` y `rerenderEvents()` en cada cambio. Funciones globales: `mostrarAvisoSimple`, `resetFormConfirmado`, `confirmarEliminarEvento`.

### `events-form.js`
`resetForm()`, `getFormData()`, `fillFormForEdit()`. Formatea CUIT.

### `events-render.js`
`renderFilteredEvents()` y `createCard()`. Cada tarjeta tiene `data-cliente` y `data-mes` (formato `"2026-04"`). Incluye badge countdown. `registerEventDetailModal()` genera el modal de detalle con bloques visuales.

### `events-utils.js`
Helpers: `formatDate`, `formatDateShort`, `getMonthLabel`, `getCurrentUserName`, `STATUS_COLORS`, `USUARIOS_MAP`.

### `events-jornadas.js`
`initJornadas()` → `window.toggleMultidia`, `window.agregarJornada`.
Usa `window.mostrarAvisoSimple` directamente (no como parámetro).

### `events-budget.js`
Presupuesto, factura, alquileres. Subida a Firebase Storage.

### `events-avisos.js`
Modal de confirmación de eventos pasados.

### `staff.js`
CRUD de personal, asignación a eventos, rotación de estados, WhatsApp, historial, PDF ART.

### `lista.js`
Checklist por evento, catálogo en Firestore, PDF checklist.

### `calendar.js`
Calendario FullCalendar. Lee eventos de Firestore.

---

## 🗂️ ESTRUCTURA DE UN EVENTO EN FIRESTORE

```js
{
  client: "Nombre del cliente",
  date: "2026-04-15",
  type: "Catering Completo",
  place: "Salón El Ombú",
  placeUrl: "https://maps.google.com/...",
  guests: 120,
  staffNecesario: 5,
  horaInicio: "19:00",
  horaFin: "23:00",
  horaPresentacion: "18:30",
  notes: "...",
  status: "Confirmado",       // Presupuestado / Confirmado / Realizado / Cancelado / Cerrado
  paid: false,
  total: 150000,
  // NOTA: el campo deposit (seña) fue eliminado de la app pero puede existir
  // en eventos viejos de Firestore — se ignora sin problema
  invoiceType: "B/C",
  invoiceNumber: "",
  cuit: "",
  mensajesEnviados: [         // staff asignado al evento
    { nombre: "Juan", estado: "confirmado", telefono: "...", whatsappEnviado: true, categoria: "Mozo" }
  ],
  checklist: [
    { nombre: "Mantelería", categoria: "Ropa", preparado: true }
  ],
  alquileres: {
    vajilla: false, manteleria: false, mobiliario: false, mobiliarioTrabajo: false, notas: ""
  },
  esMultidia: false,
  jornadas: [],               // si esMultidia = true, array de objetos jornada
  realizacionConfirmada: false,
  presupuestoURL: "",
  presupuestoNombre: "",
  presupuestoPath: "",
  facturaURL: "",
  createdBy: "Laura",
  createdAt: Timestamp,
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
  alquileres: { vajilla: false, manteleria: false, mobiliario: false, mobiliarioTrabajo: false, notas: "" },
  mensajesEnviados: []
}
```

---

## 🎨 CLASES CSS IMPORTANTES

### Tarjetas (`css/events.css`)
- `.event-card--hoy` → fondo rosado `#fff5f5`, sombra rojiza, borde rojo
- `.event-card--hoy .event-card__fecha::before` → agrega "🔴 HOY — " via CSS puro
- `.event-card--hoy .event-card__cliente` → texto en rojo
- `.badge-countdown` → gris (eventos lejanos)
- `.badge-countdown--hoy` → rojo
- `.badge-countdown--manana` → naranja
- `.badge-countdown--pronto` → dorado (≤7 días)
- `.filtro-estado` / `.filtro-mes` → botones de filtro (mismo estilo visual)
- `.filtros-mes-wrap` → fila de filtros por mes (oculta si hay un solo mes)

### Modal de detalle (`css/modals.css`)
- `.detail-bloque` → bloque con fondo suave (`var(--bg-secondary)`), border-radius 10px
- `.detail-bloque-fila` → fila flex: icono + texto
- `.detail-bloque-icono` → ancho fijo 20px
- `.detail-bloque-texto` → texto del bloque

---

## ⚠️ DECISIONES TÉCNICAS TOMADAS

- **Cálculo automático de staff eliminado**: el campo "personal necesario" se carga a mano, sin calcular en base a invitados. La lógica que existía en `events.js` fue removida.
- **Bug de zona horaria corregido**: todas las comparaciones de fecha usan `new Date().toLocaleDateString("sv").split("T")[0]` en lugar de `new Date().toISOString().split("T")[0]`. El motivo: `toISOString()` devuelve hora UTC y Argentina es UTC-3, lo que causaba que después de las 21hs el "hoy" y el countdown se adelantaran un día. Archivos corregidos: `events-render.js`, `events.js`, `events-form.js`, `events-avisos.js`, `staff.js`, `lista.js`.
- **Campo `deposit` (seña) eliminado de la app**: los eventos viejos en Firestore pueden tener ese campo pero se ignora sin problema.

---



1. **Paso a paso** → nada de cambios gigantes
2. **Sin romper lo que funciona** → cambios seguros primero
3. **Instrucciones concretas** → "Abrí X, buscá Y, pegá debajo de Z"
4. **Explicación simple** → sin tecnicismos innecesarios
5. **Respetar estructura** → no mezclar todo en un archivo
6. **No duplicar lógica** → usar el archivo correcto
7. **No sobrecargar `main.js`** → la lógica va en el módulo que corresponde
8. **Separar lógica de render** → lógica en `events.js`, HTML en `events-render.js`

---

## 🚀 CONTEXTO FINAL

App de uso interno para equipo chico de catering.
Debe ser simple, rápida, clara y usable desde el celular.
Apunta a resolver tareas reales del día a día.

---

*Fin del contexto — v4, actualizado 27/03/2026*
