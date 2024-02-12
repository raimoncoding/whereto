
// config.js
const API_KEYS = {
    openWeatherMap: 'c150a831aa1a7257aab64e99dea14985',
    // Voeg hier andere API-sleutels toe indien nodig
};

// Maakt API_KEYS globaal beschikbaar
if (typeof window !== 'undefined') {
    window.API_KEYS = API_KEYS;
}
