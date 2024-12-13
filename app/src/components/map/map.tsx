import { createSignal, createEffect, onMount, onCleanup } from "solid-js";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./map.css";

const debounce = (fn: any, delay: any) => {
  let timeoutId: any;
  return (...args: any) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

interface Coordinates {
  lat: number;
  lng: number;
  alt?: number | null;
}

interface MapComponentProps {
  onCoordinatesChange: (coords: Coordinates) => void;
  baseCoordinates?: Coordinates;
  trackingMode?: boolean;
  fixedCoordinates?: Coordinates;
}

const MapComponent = (props: MapComponentProps) => {
  const [map, setMap] = createSignal<L.Map | null>(null);
  const [marker, setMarker] = createSignal<L.Marker | null>(null);
  const [geoMarker, setGeoMarker] = createSignal<L.Marker | null>(null);
  const [searchInput, setSearchInput] = createSignal<string>("");
  const [currentZoom, setCurrentZoom] = createSignal(0);

  // Custom marker icon using SVG
  const customMarkerIcon = L.divIcon({
    html: `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="32"
        height="32"
        fill="#007BFF"
      >
        <circle cx="12" cy="12" r="10" fill="#007BFF" />
        <circle cx="12" cy="12" r="6" fill="#fff" />
      </svg>
    `,
    className: "custom-marker-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  const droneMarkerIcon = L.divIcon({
    html: `
<svg fill="#000000" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
	 viewBox="-124 -124 744 744" xml:space="preserve">
    <!-- Circle with an outline -->
    <circle cx="248" cy="248" r="356" fill="#FFFFFF" stroke="#007BFF" stroke-width="32" />
<g>
	<g>
		<g>
			<path d="M496,48V32h-48v-8c0-13.232-10.768-24-24-24s-24,10.768-24,24v8h-48v16h64v32h-16v16h-36l-24-32H156l-24,32H96V80H80V48
				h64V32H96v-8C96,10.768,85.232,0,72,0S48,10.768,48,24v8H0v16h64v32H48v80h48v-16h32v51.056L70.112,224
				C56.472,230.832,48,244.528,48,259.776V432h32v64h336v-64h32V259.776c0-15.24-8.472-28.944-22.112-35.776L368,195.056V144h32v16
				h48V80h-16V48H496z M64,24c0-4.416,3.584-8,8-8s8,3.584,8,8v8H64V24z M80,144H64V96h16V144z M192,80h112v24H192V80z M144,176h176
				v-16H144v-48v-5.336L164,80h12v24c0,8.824,7.176,16,16,16h112c8.824,0,16-7.176,16-16V80h12l20,26.664V112v48h-16v16h16v16H144
				V176z M320,208v16h-24v-16H320z M200,208v16h-24v-16H200z M96,128v-16h32v16H96z M400,416v16v48H96v-48v-16V288h104v112h96V288
				h104V416z M216,384v-96h64v96H216z M418.736,238.312c8.176,4.096,13.264,12.32,13.264,21.464V416h-16V272H296h-96H80v144H64
				V259.776c0-9.144,5.088-17.368,13.264-21.464L137.888,208H160v32h56v-32h64v32h56v-32h22.112L418.736,238.312z M400,128h-32v-16
				h32V128z M432,144h-16V96h16V144z M416,32v-8c0-4.416,3.584-8,8-8c4.416,0,8,3.584,8,8v8H416z"/>
			<rect x="368" y="448" width="16" height="16"/>
			<rect x="304" y="448" width="48" height="16"/>
			<rect x="256" y="416" width="128" height="16"/>
		</g>
	</g>
</g>
</svg>

    `,
    className: "drone-marker-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  // Initialize the map once
  onMount(() => {
    const mapInstance = L.map("map").setView([55.7558, 37.6173], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(mapInstance);
    setMap(mapInstance);

    // Use Geolocation API to set the marker with altitude
    if (navigator.geolocation && !props.trackingMode) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, altitude } = position.coords;
          const coords: Coordinates = {
            lat: latitude,
            lng: longitude,
            alt: altitude || 100, // Altitude may be null, so provide a default value
          };

          if (marker()) {
            marker()?.setLatLng([coords.lat, coords.lng]);
          } else {
            const newMarker = L.marker([coords.lat, coords.lng], {
              icon: customMarkerIcon,
              draggable: false,
            }).addTo(mapInstance);

            newMarker.on("dragend", () => {
              const { lat, lng } = newMarker.getLatLng();
              props.onCoordinatesChange?.({ lat, lng, alt: altitude || 0 });
            });

            setMarker(newMarker);
          }

          mapInstance.setView([coords.lat, coords.lng], 13);
          props.onCoordinatesChange?.(coords);
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              console.error("User denied the request for Geolocation.");
              break;
            case error.POSITION_UNAVAILABLE:
              console.error("Location information is unavailable.");
              break;
            case error.TIMEOUT:
              console.error("The request to get user location timed out.");
              break;
            default:
              console.error("An unknown error occurred:", error.message);
              break;
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000, // 10 seconds timeout
          maximumAge: 0, // Don't use cached location
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }

    // if (!props.trackingMode) {
    //   mapInstance.on("click", (e: L.LeafletMouseEvent) => {
    //     const coords: Coordinates = { lat: e.latlng.lat, lng: e.latlng.lng };

    //     if (marker()) {
    //       marker()?.setLatLng([coords.lat, coords.lng]);
    //     } else {
    //       const newMarker = L.marker([coords.lat, coords.lng], {
    //         icon: customMarkerIcon,
    //         draggable: true,
    //       }).addTo(mapInstance);

    //       newMarker.on("dragend", () => {
    //         const { lat, lng } = newMarker.getLatLng();
    //         props.onCoordinatesChange?.({ lat, lng });
    //       });

    //       setMarker(newMarker);
    //     }

    //     props.onCoordinatesChange?.(coords);
    //   });
    // }

    onCleanup(() => mapInstance.remove());
  });

  // Update marker based on props
  createEffect(() => {
    if (!map()) return;

    if (props.trackingMode && props.fixedCoordinates) {
      // In tracking mode, update or create the fixed marker
      if (!marker()) {
        const newMarker = L.marker(
          [props.fixedCoordinates.lat, props.fixedCoordinates.lng],
          { icon: droneMarkerIcon, zIndexOffset: 1000 }
        ).addTo(map()!);
        setMarker(newMarker);
      } else {
        marker()?.setLatLng([
          props.fixedCoordinates.lat,
          props.fixedCoordinates.lng,
        ]);
      }

      // Center the map on the fixed coordinates
      if (currentZoom() <= 10) {
        map()?.setView(
          [props.fixedCoordinates.lat, props.fixedCoordinates.lng],
          13
        );
        console.log(map()?.getZoom());
      }

      setCurrentZoom(map()?.getZoom() || 1);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;

            // Add or update the geolocation marker
            let destinationMarker = geoMarker(); // Assume geoMarker is managed via createSignal
            if (!destinationMarker) {
              destinationMarker = L.marker([latitude, longitude], {
                icon: customMarkerIcon, // Use a different icon for geolocation
              }).addTo(map()!);
              setGeoMarker(destinationMarker);
            } else {
              destinationMarker.setLatLng([latitude, longitude]);
            }
          },
          (error) => {
            console.error("Geolocation error:", error.message);
          }
        );
      }
    }
  });

  // Handle search and geocoding
  const handleSearch = async () => {
    if (!searchInput()) return;

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchInput()
      )}`
    );
    const data = await response.json();

    if (data.length > 0) {
      const { lat, lon } = data[0];
      const coords: Coordinates = {
        lat: parseFloat(lat),
        lng: parseFloat(lon),
      };

      map()?.setView([coords.lat, coords.lng], 13);
      if (marker()) {
        marker()?.setLatLng([coords.lat, coords.lng]);
      } else {
        const newMarker = L.marker([coords.lat, coords.lng], {
          icon: customMarkerIcon,
          draggable: true,
        }).addTo(map()!);

        newMarker.on("dragend", () => {
          const { lat, lng } = newMarker.getLatLng();
          props.onCoordinatesChange?.({ lat, lng });
        });

        setMarker(newMarker);
      }

      props.onCoordinatesChange?.(coords);
    }
  };
  const debouncedSearch = debounce(handleSearch, 500);
  return (
    <div style={{ display: "flex", "flex-direction": "column", gap: "10px" }}>
      {/* {!props.trackingMode && (
        <input
          type="text"
          value={searchInput()}
          onInput={(e) => {
            setSearchInput(e.currentTarget.value);
            debouncedSearch();
          }}
          onKeyPress={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          placeholder="Введите адрес"
          class="map__input"
        />
      )} */}
      <div id="map" class="custom-map"></div>
    </div>
  );
};

export default MapComponent;
