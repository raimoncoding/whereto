document.addEventListener('DOMContentLoaded', function() {

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
        // Aanpassing: URL wijst nu naar je Netlify serverless functie
        const apiUrl = `/.netlify/functions/weather?city=${city}`;
    
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Er is een probleem opgetreden bij het ophalen van het weer.');
                }
                return response.json();
            })
            .then(data => {
                displayWeather(data);
                // Omdat de serverless functie al de benodigde data teruggeeft,
                // hoef je niet opnieuw coördinaten te extraheren voor verdere API-aanroepen,
                // tenzij je serverless functie deze ook teruggeeft en je ze nodig hebt voor andere doeleinden.
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