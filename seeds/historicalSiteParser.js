// npsToCampgroundsJson.js
const fs = require('fs');

// --- helper functions ---
function parseLatLong(latLongStr) {
    if (!latLongStr) return null;
    const latMatch = latLongStr.match(/lat\s*:\s*([-+]?\d+(\.\d+)?)/i);
    const lonMatch = latLongStr.match(/long\s*:\s*([-+]?\d+(\.\d+)?)/i);
    if (!latMatch || !lonMatch) return null;
    return [parseFloat(lonMatch[1]), parseFloat(latMatch[1])]; // [lng, lat]
}

function bestLocation(addresses = [], fallbackStates = "") {
    const a = addresses.find(a => (a.type || "").toLowerCase() === "physical") || addresses[0];
    if (a) {
        const parts = [a.line1, a.line2, a.city, a.stateCode, a.postalCode].filter(Boolean).join(", ");
        if (parts) return parts;
    }
    return fallbackStates || "USA";
}

function mapImages(npsImages = []) {
    return npsImages.map(img => {
        let filename = "";
        try {
            const u = new URL(img.url);
            filename = u.pathname.split("/").filter(Boolean).pop() || "";
        } catch { }
        return { url: img.url, filename };
    });
}

// --- main transform ---
function transformParksJson(input, authorId) {
    return input.map(park => {
        const coords = parseLatLong(park.latLong);
        if (!coords) return null;

        return {
            title: park.fullName || park.name || "Untitled",
            images: mapImages(park.images || []),
            geometry: {
                type: "Point",
                coordinates: coords
            },
            price: Math.floor(Math.random() * 30) + 10, // random price 10–39
            description: park.description || "",
            location: bestLocation(park.addresses, park.states),
            author: { "$oid": "68518b3897e220ce8d35d19d" },
            reviews: []
        };
    }).filter(Boolean);
}

// --- usage example ---
const parks = require('./parks.json'); // your raw NPS JSON array
const authorId = "PUT-YOUR-USER-ID-HERE";

const campgrounds = transformParksJson(parks, authorId);

// Write to file
fs.writeFileSync('campgrounds.json', JSON.stringify(campgrounds, null, 2));
console.log(`Wrote ${campgrounds.length} campgrounds to campgrounds.json`);
