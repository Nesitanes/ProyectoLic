document.addEventListener("DOMContentLoaded", () => {
    // 1. Buscador global (desde index.html)
    const globalSearchBtn = document.getElementById("search-btn");
    if (globalSearchBtn) {
        globalSearchBtn.addEventListener("click", () => {
            const query = document.getElementById("global-search").value.trim();
            if (query) {
                window.location.href = `destinos.html?pais=${encodeURIComponent(query)}`;
            }
        });
    }

    // 2. Vista de Destinos: Búsqueda por API con respaldo local JSON
    const countrySearchBtn = document.getElementById("country-search-btn");
    if (countrySearchBtn) {
        const urlParams = new URLSearchParams(window.location.search);
        const paisParam = urlParams.get("pais");
        if (paisParam) {
            const inputField = document.getElementById("country-input");
            if (inputField) inputField.value = paisParam;
            fetchCountryData(paisParam);
        }

        countrySearchBtn.addEventListener("click", () => {
            const paisInput = document.getElementById("country-input");
            const pais = paisInput ? paisInput.value.trim() : "";
            if (pais) {
                fetchCountryData(pais);
            } else {
                alert("Por favor ingresa el nombre de un país.");
            }
        });
    }

    // 3. Renderizar Favoritos si estamos en favoritos.html
    const favoritesContainer = document.getElementById("favorites-container");
    if (favoritesContainer) {
        renderFavorites();
    }

    // 4. Botón de búsqueda por presupuesto establecido
    const budgetSearchBtn = document.getElementById("calc-budget-btn");
    if (budgetSearchBtn) {
        budgetSearchBtn.addEventListener("click", () => {
            searchDestinationsByBudget();
        });
    }

    // 5. Formulario de creación de presupuesto (segundo sub-apartado)
    const budgetForm = document.getElementById("create-budget-form");
    if (budgetForm) {
        budgetForm.addEventListener("submit", (e) => {
            e.preventDefault();
            calculateTripBudget();
        });
    }

    // 6. Control del Menú Lateral (Drawer) de Vuelos en la barra de navegación
   const openCartNav = document.getElementById("open-flights-cart");
    const drawer = document.getElementById("flight-drawer");
    const overlay = document.getElementById("drawer-overlay");
    const closeDrawerBtn = document.querySelector(".close-drawer-btn"); // <- Usamos selector por clase

    if (openCartNav && drawer && overlay) {
        openCartNav.addEventListener("click", (e) => {
            e.preventDefault();
            drawer.classList.add("open");
            overlay.classList.add("active");
            updateDrawerContent();
        });

        const closeAction = () => {
            drawer.classList.remove("open");
            overlay.classList.remove("active");
        };

        if (closeDrawerBtn) closeDrawerBtn.addEventListener("click", closeAction);
        overlay.addEventListener("click", closeAction);
    }

    // 7. Botón de confirmar compra dentro del drawer
    const confirmBtn = document.getElementById("confirm-purchase-btn");
    if (confirmBtn) {
        confirmBtn.addEventListener("click", () => {
            showSuccessCheckout();
        });
    }

    // Inicializar el estado del carrito al cargar cualquier página
    updateFlightCartUI();
});

// ==========================================
// BÚSQUEDA DE PAÍS (API CON RESPALDO INTELIGENTE)
// ==========================================
async function fetchCountryData(countryName) {
    const searchTerm = countryName.toLowerCase().trim();
    let countryData = null;

    try {
        console.log(`Buscando país: ${countryName}`);
        const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`);

        if (!response.ok) throw new Error("API no disponible");
        
        const data = await response.json();
        const country = data[0];

        countryData = {
            name: country.translations?.spa?.common || country.name.common,
            capital: (country.capital && country.capital.length > 0) ? country.capital[0] : "No disponible",
            currency: country.currencies ? `${Object.values(country.currencies)[0].name}` : "No disponible",
            area: country.area ? `${country.area.toLocaleString()} km²` : "No disponible",
            languages: country.languages ? Object.values(country.languages).join(", ") : "No disponible",
            flag: country.flags?.svg || country.flags?.png || ""
        };

    } catch (error) {
                
        if (typeof paisesDB !== 'undefined' && paisesDB[searchTerm]) {
            countryData = paisesDB[searchTerm];
        } else {
            countryData = {
                name: countryName,
                capital: "No disponible",
                currency: "No disponible",
                area: "No disponible",
                languages: "No disponible",
                flag: "https://flagcdn.com/un.svg"
            };
        }
    }

    safeSetText("country-name", countryData.name);
    safeSetText("country-capital", countryData.capital);
    safeSetText("country-currency", countryData.currency);
    safeSetText("country-area", countryData.area);
    safeSetText("country-language", countryData.languages);
    
    const flagImg = document.getElementById("country-flag");
    if (flagImg) {
        flagImg.src = countryData.flag;
        flagImg.style.display = "block";
    }

    fetchWeatherAPI(countryData.capital !== "No disponible" ? countryData.capital : countryData.name);
    renderTouristPlaces(searchTerm, countryData.name);
}

function safeSetText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

// ==========================================
// CONSUMO DE API DE CLIMA
// ==========================================
async function fetchWeatherAPI(city) {
    const weatherDesc = document.getElementById("weather-desc");
    if (!weatherDesc) return;

    weatherDesc.innerHTML = `<p>Consultando clima para ${city}...</p>`;

    try {
        const response = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
        if (!response.ok) throw new Error("Error de clima");

        const data = await response.json();
        const current = data.current_condition[0];
        
        const tempC = current.temp_C;
        const descClima = current.weatherDesc[0].value;
        const humedad = current.humidity;
        const viento = current.windspeedKmph;

        weatherDesc.innerHTML = `
            <div style="display:flex; align-items:center; gap:15px; margin-top: 5px;">
                <span style="font-size:2.2rem;"> 🌎 </span>
                <div>
                    <h3 style="font-size: 1.4rem; margin: 0;">${tempC}°C</h3>
                    <p style="text-transform: capitalize; margin: 0;"><strong>${descClima}</strong></p>
                    <small>Humedad: ${humedad}% | Viento: ${viento} km/h</small>
                </div>
            </div>
        `;
    } catch (error) {
        console.error("Error clima:", error);
        weatherDesc.innerHTML = `
            <div style="display:flex; align-items:center; gap:15px; margin-top: 5px;">
                <span style="font-size:2.2rem;">🌤️</span>
                <div>
                    <h3 style="font-size: 1.4rem; margin: 0;">28°C</h3>
                    <p style="margin: 0;"><strong>Parcialmente nublado</strong></p>
                    <small>Humedad: 45% | Viento: 10 km/h</small>
                </div>
            </div>
        `;
    }
}

// ==========================================
// RENDERIZAR LUGARES TURÍSTICOS
// ==========================================
function renderTouristPlaces(searchTerm, countryName) {
    const container = document.getElementById("tourist-places-container");
    if (!container) return;

    let places = null;
    if (typeof paisesDB !== 'undefined' && paisesDB[searchTerm] && paisesDB[searchTerm].attractions) {
        places = paisesDB[searchTerm].attractions;
    }
    
    if (!places || places.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; background: var(--secondary-color); border-radius: 12px;">
                <p style="font-size: 1.1rem; color: var(--text-color); font-weight: 500;">Por el momento no tenemos lugares que mostrarte</p>
            </div>
        `;
        return;
    }

    // Obtener la lista actual de favoritos guardados
    let favorites = JSON.parse(localStorage.getItem("pvi_favorites")) || [];

    container.innerHTML = "";
    places.forEach((place) => {
        // Verificar si el lugar ya está en favoritos
        const isFav = favorites.some(fav => fav.title === place.title);
        const btnText = isFav ? " Quitar de favoritos" : " Añadir a favoritos";
        const btnClass = isFav ? "favorite-btn is-favorite" : "favorite-btn";

        container.innerHTML += `
            <div class="card">
                <img src="${place.img}" alt="${place.title}" onerror="this.src='https://via.placeholder.com/300x160?text=Foto+Turistica'">
                <div class="card-body">
                    <h3>${place.title}</h3>
                    <p>${place.desc}</p>
                    <button class="${btnClass}" onclick='toggleFavorite(${JSON.stringify(place)}, this, "${searchTerm}", "${countryName}")'>
                        ${btnText}
                    </button>
                </div>
            </div>
        `;
    });
}

function toggleFavorite(place, searchTerm = null, countryName = null) {
    let favorites = JSON.parse(localStorage.getItem("pvi_favorites")) || [];
    const index = favorites.findIndex(fav => fav.title === place.title);

    if (index !== -1) {
        // Si ya existe, lo eliminamos de favoritos
        favorites.splice(index, 1);
        localStorage.setItem("pvi_favorites", JSON.stringify(favorites));
        alert(`"${place.title}" ha sido eliminado de tus favoritos.`);
    } else {
        // Si no existe, lo agregamos a favoritos
        favorites.push(place);
        localStorage.setItem("pvi_favorites", JSON.stringify(favorites));
        alert(`"${place.title}" se agregó a tus favoritos.`);
    }

    // Si la función fue llamada desde la vista de Destinos, refrescamos el estado de las tarjetas
    if (searchTerm && countryName) {
        renderTouristPlaces(searchTerm, countryName);
    } else {
        // Si fue llamada desde favoritos.html, re-renderizamos la vista
        renderFavorites();
    }
}

function renderFavorites() {
    const container = document.getElementById("favorites-container");
    if (!container) return;

    let favorites = JSON.parse(localStorage.getItem("pvi_favorites")) || [];

    if (favorites.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                <p style="font-size: 1.1rem; color: #666;">No tienes destinos ni lugares favoritos guardados por el momento.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = "";
    favorites.forEach((place) => {
        container.innerHTML += `
            <div class="card">
                <img src="${place.img}" alt="${place.title}" onerror="this.src='https://via.placeholder.com/300x160?text=Foto+Turistica'">
                <div class="card-body">
                    <h3>${place.title}</h3>
                    <p>${place.desc}</p>
                    <button class="favorite-btn is-favorite" onclick='toggleFavorite(${JSON.stringify(place)})' style="color: #c0392b;">
                         Quitar de favoritos
                    </button>
                </div>
            </div>
        `;
    });
}

// ==========================================
// 1. BUSCAR DESTINOS SEGÚN PRESUPUESTO ESTABLECIDO (SOLO IDA)
// ==========================================
function searchDestinationsByBudget() {
    const budgetInput = document.getElementById("user-budget").value;
    const budgetType = document.getElementById("budget-type").value; // 'nacional' o 'internacional'
    const resultsContainer = document.getElementById("budget-results");

    if (!budgetInput || budgetInput <= 0) {
        alert("Por favor ingresa un monto de presupuesto válido.");
        return;
    }

    const userBudget = parseFloat(budgetInput);

    if (typeof paisesDB === 'undefined') {
        resultsContainer.innerHTML = "<p style='color: red;'>Base de datos de países no disponible.</p>";
        return;
    }

    const currentMonth = new Date().getMonth() + 1;
    const isHighSeason = [6, 7, 12].includes(currentMonth);

    let matchingDestinations = [];

    for (let key in paisesDB) {
        const country = paisesDB[key];
        const isNational = country.name.toLowerCase() === "el salvador";

        if (budgetType === "nacional" && !isNational) continue;
        if (budgetType === "internacional" && isNational) continue;

        let oneWayPrice = isNational ? 45 : 350;
        if (isHighSeason) {
            oneWayPrice *= 1.35;
        }

        if (userBudget >= oneWayPrice) {
            matchingDestinations.push({
                name: country.name,
                capital: country.capital,
                flag: country.flag,
                price: oneWayPrice.toFixed(2),
                img: country.attractions && country.attractions.length > 0 ? country.attractions[0].img : "img/default1.jpg",
                desc: `Capital: ${country.capital} - Moneda: ${country.currency}`
            });
        }
    }

    resultsContainer.innerHTML = "";

    if (matchingDestinations.length === 0) {
        resultsContainer.innerHTML = `
            <div style="padding: 1rem; background: #ffe6e6; border-radius: 8px; color: #c0392b; margin-top: 1rem;">
                <p>No encontramos destinos <strong>${budgetType}s</strong> para un presupuesto de $${userBudget.toFixed(2)} USD en la temporada actual. ¡Prueba aumentando tu presupuesto!</p>
            </div>
        `;
        return;
    }

    let htmlOutput = `
        <h3 style="margin-top: 1.5rem; margin-bottom: 1rem; font-size: 1.2rem;">Destinos ideales para tu presupuesto de $${userBudget.toFixed(2)} USD (Solo Ida):</h3>
        <div class="cards-grid">
    `;

    matchingDestinations.forEach(dest => {
        htmlOutput += `
            <div class="card">
                <img src="${dest.img}" alt="${dest.name}" onerror="this.src='https://via.placeholder.com/300x160?text=Destino'">
                <div class="card-body">
                    <h3>${dest.name}</h3>
                    <p>${dest.desc}</p>
                    <p style="color: #2c4782; font-weight: 600; margin-top: 5px;">Vuelo de ida aprox: $${dest.price} USD</p>
                    
                    <div style="display: flex; gap: 0.5rem; margin-top: 10px; flex-wrap: wrap;">
                        <button onclick="selectFlightToCart('${dest.name}', '${dest.price}')" style="background: #27ae60; color: white; border: none; padding: 0.6rem 1rem; border-radius: 6px; font-weight: 600; cursor: pointer; flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px;">
                            Agregar al carrito
                        </button>
                        <button onclick='window.location.href="destinos.html?pais=${encodeURIComponent(dest.name)}"' style="background: #e3eeff; color: #2c4782; border: 1px solid #2c4782; padding: 0.6rem 1rem; border-radius: 6px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                            Ver detalles 
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    htmlOutput += `</div>`;
    resultsContainer.innerHTML = htmlOutput;
}

// ==========================================
// 2. GESTIÓN DEL MENÚ LATERAL Y CARRITO
// ==========================================
function updateFlightCartUI() {
    const savedFlight = JSON.parse(localStorage.getItem("pvi_selected_flight"));
    const counter = document.getElementById("cart-counter");
    if (counter) {
        counter.textContent = savedFlight ? "1" : "0";
    }
}

function selectFlightToCart(destinationName, price) {
    const flightData = {
        origin: "San Salvador",
        destination: destinationName,
        totalPrice: price,
        passengers: 1
    };
    localStorage.setItem("pvi_selected_flight", JSON.stringify(flightData));
    updateFlightCartUI();
    
    // Abrir automáticamente el menú lateral derecho al agregar
    const drawer = document.getElementById("flight-drawer");
    const overlay = document.getElementById("drawer-overlay");
    if (drawer && overlay) {
        drawer.classList.add("open");
        overlay.classList.add("active");
        updateDrawerContent();
    }
}

function updateDrawerContent() {
    const contentContainer = document.getElementById("drawer-content");
    const footerContainer = document.getElementById("drawer-footer");
    const savedFlight = JSON.parse(localStorage.getItem("pvi_selected_flight"));

    if (!contentContainer) return;

    if (!savedFlight) {
        contentContainer.innerHTML = `<p style="text-align: center; color: #666;">No hay ningún vuelo seleccionado todavía.</p>`;
        if (footerContainer) footerContainer.style.display = "none";
        return;
    }

    contentContainer.innerHTML = `
        <div style="background: #e3eeff; padding: 1rem; border-radius: 8px; border-left: 4px solid #2c4782;">
            <p style="margin: 0 0 5px 0;"><strong>Origen:</strong> ${savedFlight.origin}</p>
            <p style="margin: 0 0 5px 0;"><strong>Destino:</strong> ${savedFlight.destination}</p>
            <p style="margin: 0 0 5px 0;"><strong>Pasajeros:</strong> ${savedFlight.passengers}</p>
            <p style="margin: 0; color: #27ae60; font-weight: 600; font-size: 1.1rem;">Total: $${savedFlight.totalPrice} USD</p>
        </div>
        <button onclick="removeFlightFromCart()" style="background: #e74c3c; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; margin-top: 1rem; cursor: pointer; width: 100%;">Eliminar vuelo</button>
    `;

    if (footerContainer) footerContainer.style.display = "block";
}

function removeFlightFromCart() {
    localStorage.removeItem("pvi_selected_flight");
    updateFlightCartUI();
    updateDrawerContent();
}

function showSuccessCheckout() {
    const contentContainer = document.getElementById("drawer-content");
    const footerContainer = document.getElementById("drawer-footer");

    if (footerContainer) footerContainer.style.display = "none";
    if (contentContainer) {
        contentContainer.innerHTML = `
            <div class="success-container">
                <div class="success-checkmark">
                    <span>✓</span>
                </div>
                <h3 style="color: #27ae60; margin-bottom: 0.5rem;">¡Compra Finalizada!</h3>
                <p style="color: #555; font-size: 0.95rem;">Tu reserva de vuelo ha sido procesada exitosamente.</p>
            </div>
        `;
    }
    localStorage.removeItem("pvi_selected_flight");
    updateFlightCartUI();
}

// ==========================================
// 3. CÁLCULO DE PRESUPUESTO (SEGUNDO SUB-APARTADO)
// ==========================================
function calculateTripBudget() {
    const origin = document.getElementById("origin") ? document.getElementById("origin").value : "San Salvador";
    const dest = document.getElementById("dest").value;
    const depDateStr = document.getElementById("departure-date").value;
    const passengers = parseInt(document.getElementById("passengers").value) || 1;
    const tripTypeElem = document.querySelector('input[name="trip-type"]:checked');
    const tripType = tripTypeElem ? tripTypeElem.value : 'ida-vuelta';

    if (!dest) {
        alert("Por favor ingresa un país o ciudad de destino.");
        return;
    }

    if (!depDateStr) {
        alert("Selecciona una fecha de salida.");
        return;
    }

    const depDate = new Date(depDateStr);
    const month = depDate.getMonth() + 1;

    let basePrice = 350; 
    if ([6, 7, 12].includes(month)) {
        basePrice *= 1.35; 
    }

    if (tripType === 'ida-vuelta') {
        basePrice *= 1.8; 
    }

    const totalCost = (basePrice * passengers).toFixed(2);
    const resultDiv = document.getElementById("generated-budget-result");
    if (resultDiv) {
        resultDiv.innerHTML = `Presupuesto estimado: <strong>$${totalCost} USD</strong> <br><small>(${passengers} pasajero(s), tarifa ajustada por temporada)</small>`;
    }

    const flightData = {
        origin: origin.split(',')[0],
        destination: dest,
        totalPrice: totalCost,
        passengers: passengers
    };
    localStorage.setItem("pvi_selected_flight", JSON.stringify(flightData));
    updateFlightCartUI();
}