let map;
var controls = L.control.layers();

var artsEducationPolicyLayers = [];
var spG4Math2019Layer;
var spG8Math2019Layer;
var spG4Reading2019Layer;
var spG8Reading2019Layer;

var statesJSON;

var csvPaths = [
	csvPath_EducationalSpendingInPublicSchools,
	csvPath_ArtsEducationPolicies,
	csvPath_SP_G4_Math_2019,
	csvPath_SP_G8_Math_2019,
	csvPath_SP_G4_Reading_2019,
	csvPath_SP_G8_Reading_2019,
];

var csvData = [];

// REVIEW: we can either modify the colors of a single layer based on what layers the user selects,
//         or overlay multiple layers, one for each feature.

// initialize
$(function () {
	createMap();
	getStatePolygons();
	readCSVs();
});

// create the map
function createMap() {
	map = L.map("map").setView([39.8283, -98.5795], 5); // coords for center of the US

	L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
		attribution:
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	}).addTo(map);

	controls.addTo(map);
}

function getStatePolygons() {
	$.get("../data/states-polygons-20m.json")
		.then((json) => (statesJSON = json))
		.then(() => createLayers());
}

function createLayers() {
	for (var i = 0; i < 10; i++) {
		artsEducationPolicyLayers.push(L.geoJson(statesJSON));
		controls.addOverlay(artsEducationPolicyLayers[i], `Arts Education Policy ${i + 1}`);
	}

	// TODO: these 4 layers are currently empty.
	spG4Math2019Layer = L.geoJson();
	spG8Math2019Layer = L.geoJson();
	spG4Reading2019Layer = L.geoJson();
	spG8Reading2019Layer = L.geoJson();

	controls.addOverlay(spG4Math2019Layer, "Standardized Performances - Grade 4 - Math - 2019");
	controls.addOverlay(spG8Math2019Layer, "Standardized Performances - Grade 8 - Math - 2019");
	controls.addOverlay(
		spG4Reading2019Layer,
		"Standardized Performances - Grade 4 - Reading - 2019"
	);
	controls.addOverlay(
		spG8Reading2019Layer,
		"Standardized Performances - Grade 8 - Reading - 2019"
	);

	// var myStyle = {
	// 	color: "#ff7800",
	// 	weight: 5,
	// 	opacity: 0.65,
	// };
	// artPoliciesLayer.setStyle(myStyle);
}

async function readCSVs() {
	csvPaths.forEach(function (path, index) {
		Papa.parse(path, {
			header: true,
			download: true,
			complete: function (data) {
				csvData.push(data);
			},
		});
	});
}
