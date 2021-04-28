let map;
let markers = L.featureGroup();

let statesJSON;

// initialize
$(function () {
	createMap();
});

// create the map
async function createMap() {
	map = L.map("map").setView([39.8283, -98.5795], 5); // coords for center of the US

	L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
		attribution:
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	}).addTo(map);

	// map.fitBounds(markers.getBounds());

	await setUpGeoJSON().then(() => L.geoJson(statesJSON).addTo(map)); // waits until this line finishes before continuing function
}

async function setUpGeoJSON() {
	await $.get("../data/states-polygons-20m.json").then((json) => (statesJSON = json));
}
