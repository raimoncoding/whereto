document.addEventListener('DOMContentLoaded', function() {
    // Test of API_KEYS uit config.js direct gebruikt kunnen worden
    console.log(API_KEYS.openWeatherMap); // Zou de API-sleutel moeten loggen

    const submitBtn = document.getElementById('submitBtn');
    const cityInput = document.getElementById('cityInput');
    const resultsDiv = document.getElementById('results');

    submitBtn.addEventListener('click', function() {
        const city = cityInput.value.trim();
        if (city === '') {
            alert('Voer alstublieft een stad in.');
            return;
        }

        // Wis de oude resultaten voordat nieuwe resultaten worden toegevoegd
        resultsDiv.innerHTML = '';

        // API-calls voor het weer en Overpass API voor plaatsgegevens
        fetchWeather(city);
    });

    function fetchWeather(city) {
        const apiKey = window.API_KEYS.openWeatherMap;
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Er is een probleem opgetreden bij het ophalen van het weer.');
                }
                return response.json();
            })
            .then(data => {
                displayWeather(data);
                // Haal hier de coördinaten uit de data en gebruik die voor de fetchPlaces aanroep
                const latitude = data.coord.lat;
                const longitude = data.coord.lon;
                fetchPlaces(latitude, longitude); // Voer deze functie uit met de juiste coördinaten
            })
            .catch(error => {
                alert(error.message);
            });
    }
    

    function displayWeather(data) {
        const weatherDescription = data.weather[0].description;
        const temperature = Math.round(data.main.temp - 273.15); // Omzetten van Kelvin naar Celsius
    
        let weatherIcon = ''; // Definieer een lege variabele voor het weericoon
    
        // Bepaal het weericoon op basis van de weersomstandigheden
        switch (data.weather[0].main) {
            case 'Clear':
                weatherIcon = '☀️'; // Zon
                break;
            case 'Clouds':
                weatherIcon = '☁️'; // Bewolkt
                break;
            case 'Rain':
                weatherIcon = '🌧️'; // Regen
                break;
            case 'Snow':
                weatherIcon = '❄️'; // Sneeuw
                break;
            case 'Thunderstorm':
                weatherIcon = '⛈️'; // Onweer
                break;
            default:
                weatherIcon = ''; // Geen specifiek icoon voor andere weersomstandigheden
        }
    
        const weatherInfo = `
            <div class="weather-container">
                <h2>Weer in ${data.name}</h2>
                <p>Beschrijving: ${weatherDescription}</p>
                <p>Temperatuur: ${temperature} °C</p>
                <p>${weatherIcon}</p> <!-- Voeg het weericoon toe aan de resultaten -->
            </div>
        `;
    
        resultsDiv.innerHTML = weatherInfo;
    }
    

    function fetchCoordinates(city) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            fetchPlaces(latitude, longitude);
        }, function(error) {
            alert('Kan de locatie van uw apparaat niet verkrijgen. Controleer of de locatiediensten zijn ingeschakeld.');
        });
    }

    function fetchPlaces(latitude, longitude) {
        // Maak de Overpass API-aanroep met de verkregen coördinaten
        const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];
                             (node["amenity"="restaurant"](around:1000,${latitude},${longitude});
                             way["amenity"="restaurant"](around:1000,${latitude},${longitude}););
                             out;`;
                             
    
        // Voer de Overpass API-aanroep uit
        fetch(overpassUrl)
            .then(response => response.json())
            .then(data => {
                displayPlaces(data);
            })
            .catch(error => {
                alert('Er is een probleem opgetreden bij het ophalen van plaatsgegevens.');
            });
    }
    function displayPlaces(data) {
        // Verwerk de ontvangen plaatsgegevens en sorteer op basis van recensiescores
        const sortedPlaces = data.elements.sort((a, b) => {
            const ratingA = parseFloat(a.tags['stars']) || 0;
            const ratingB = parseFloat(b.tags['stars']) || 0;
            return ratingB - ratingA;
        });
    
        // Neem alleen de top vijf restaurants
        const topFivePlaces = sortedPlaces.slice(0, 5);
    
        // Toon de top vijf restaurants in de resultatenDiv
        const placesHTML = topFivePlaces.map(element => {
            let name = element.tags.name || 'Onbekend';
            let cuisine = element.tags.cuisine || 'Onbekend';
            let openingHours = element.tags.opening_hours || 'Onbekend';
            let rating = parseFloat(element.tags['stars']) || 'Onbekend';
    
            return `
                <div class="restaurant">
                    <p class="name">Naam: ${name}</p>
                    <p class="cuisine">Cuisine: ${cuisine}</p>
                    <p class="opening">Openingstijden: ${openingHours}</p>
                    <p class="rating">Beoordeling: ${rating}</p>
                </div>
            `;
        });
    
        resultsDiv.innerHTML += `<h3>Top 5 Restaurants:</h3>` + placesHTML.join('');
    }
    
});