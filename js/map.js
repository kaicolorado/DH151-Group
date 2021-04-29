let map;
let artsEducationPoliciesLayer = L.geoJson();
let spG4Math2019Layer = L.geoJson();
let spG8Math2019Layer = L.geoJson();
let spG4Reading2019Layer = L.geoJson();
let spG8Reading2019Layer = L.geoJson();

let statesJSON;

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
	setUpStatePolygons();
	readCSVs();
});

// create the map
function createMap() {
	map = L.map("map").setView([39.8283, -98.5795], 5); // coords for center of the US

	L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
		attribution:
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	}).addTo(map);

	var layers = {
		"Arts Education Policies": artsEducationPoliciesLayer,
		"Standardized Performances - Grade 4 - Math - 2019": spG4Math2019Layer,
		"Standardized Performances - Grade 8 - Math - 2019": spG8Math2019Layer,
		"Standardized Performances - Grade 4 - Reading - 2019": spG4Reading2019Layer,
		"Standardized Performances - Grade 8 - Reading - 2019": spG8Reading2019Layer,
	};

	L.control.layers(null, layers).addTo(map);
}

function setUpStatePolygons() {
	$.get("../data/states-polygons-20m.json")
		.then((json) => (statesJSON = json))
		.then(() => mapStatePolygons());
}

function mapStatePolygons() {
	artsEducationPoliciesLayer.addData(statesJSON);
	// var myStyle = {
	// 	color: "#ff7800",
	// 	weight: 5,
	// 	opacity: 0.65,
	// };
	// artPoliciesLayer.setStyle(myStyle);

	// var layers = {
	// 	hi: artPoliciesLayer,
	// };
	// L.control.layers(layers).addTo(map);
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
