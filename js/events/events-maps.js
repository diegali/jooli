// js/events/events-maps.js

export function initMaps({ mostrarAvisoSimple }) {

  window.abrirModalMaps = async function () {
    const modal = document.getElementById("modalMaps");
    if (!modal) return;
    modal.style.display = "flex";

    const { Map }                  = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    const { PlaceAutocompleteElement, Place } = await google.maps.importLibrary("places");

    window._selectedPlace = null;
    document.getElementById("mapPlaceInfo").textContent = "";

    const map = new Map(document.getElementById("mapContainer"), {
      center: { lat: -31.4135, lng: -64.1811 },
      zoom: 13,
      mapId: "JOOLI_MAP",
    });
    window._mapInstance = map;

    const marker        = new AdvancedMarkerElement({ map });
    const searchContainer = document.getElementById("mapsSearchContainer");
    searchContainer.innerHTML = "";

    const autocomplete = new PlaceAutocompleteElement({
      componentRestrictions: { country: "ar" },
    });
    autocomplete.style.width        = "100%";
    autocomplete.style.marginBottom = "12px";
    searchContainer.appendChild(autocomplete);

    autocomplete.addEventListener("gmp-select", async (e) => {
      const place = new Place({ id: e.placePrediction.placeId });

      await place.fetchFields({
        fields: ["displayName", "formattedAddress", "location", "googleMapsURI"],
      });

      const location = place.location;
      map.setCenter(location);
      map.setZoom(16);
      marker.position = location;

      window._selectedPlace = {
        nombre:    place.displayName,
        direccion: place.formattedAddress,
        url:       place.googleMapsURI,
      };

      document.getElementById("mapPlaceInfo").textContent =
        `📍 ${place.displayName} — ${place.formattedAddress}`;
    });
  };

  window.cerrarModalMaps = function () {
    document.getElementById("modalMaps").style.display = "none";
  };

  window.confirmarUbicacion = function () {
    const place = window._selectedPlace;
    if (!place) {
      mostrarAvisoSimple("Sin selección", "Buscá y seleccioná un lugar primero.", "⚠️");
      return;
    }

    const placeInput = document.getElementById("place");
    if (placeInput) placeInput.value = place.nombre || place.direccion;

    let hidden = document.getElementById("placeUrl");
    if (!hidden) {
      hidden      = document.createElement("input");
      hidden.type = "hidden";
      hidden.id   = "placeUrl";
      document.getElementById("eventFormContainer").appendChild(hidden);
    }
    hidden.value = place.url || "";

    window.cerrarModalMaps();
  };

  window.abrirModalMapsJornada = function (jornadaIndex) {
    window._jornadaMapsActual = jornadaIndex;
    window.abrirModalMaps();

    const confirmarOriginal  = window.confirmarUbicacion;
    window.confirmarUbicacion = function () {
      const place = window._selectedPlace;
      if (!place) {
        mostrarAvisoSimple("Sin selección", "Buscá y seleccioná un lugar primero.", "⚠️");
        return;
      }

      const input = document.getElementById(`jornadaLugar_${jornadaIndex}`);
      if (input) input.value = place.nombre || place.direccion;

      window.actualizarJornada(jornadaIndex, "lugar",    place.nombre || place.direccion);
      window.actualizarJornada(jornadaIndex, "placeUrl", place.url    || "");

      window.cerrarModalMaps();
      window.confirmarUbicacion = confirmarOriginal;
    };
  };
}
