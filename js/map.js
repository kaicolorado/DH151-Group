var map;
const controls = L.control.layers();

const artsEducationPolicyLayers = [];
var spG4Math2019Layer;
var spG8Math2019Layer;
var spG4Reading2019Layer;
var spG8Reading2019Layer;

var statesJSON;

const csvPaths = [
	csvPath_EducationalSpendingInPublicSchools,
	csvPath_ArtsEducationPolicies,
	csvPath_SP_G4_Math_2019,
	csvPath_SP_G8_Math_2019,
	csvPath_SP_G4_Reading_2019,
	csvPath_SP_G8_Reading_2019,
];

const csvData = new Array(csvPaths.length);

// REVIEW: we can either modify the colors of a single layer based on what layers the user selects,
//         or overlay multiple layers, one for each feature.

//* initialize
$(function () {
	createMap();
	getStatePolygons();
	readCSVs();
});

//* create the map
function createMap() {
	map = L.map("map").setView([39.8283, -98.5795], 5); // coords for center of the US

	L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
		attribution:
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	}).addTo(map);

	controls.addTo(map);
}

function getStatePolygons() {
	$.get("data/states-polygons-20m.json").then((json) => (statesJSON = json));
}

function createLayers() {
	for (var i = 1; i < 11; i++) {
		const index = i;
		artsEducationPolicyLayers.push(
			L.geoJson(statesJSON, {
				style: (feature) => getArtsEducationPolicyStyle(feature, index),
			})
		);
		controls.addOverlay(artsEducationPolicyLayers[i - 1], `Arts Education Policy ${i}`);
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
}

function getArtsEducationPolicyStyle(feature, index) {
	//* get the state object who's name (e.g. 'Alabama') matches the state name we're mapping now
	const state = csvData[1].data.find((row) => row.State === feature.properties.NAME);

	//* if we found a state from above and the current indexed column's result for that state is 'Yes', we want to give it a color
	if (state && state[Object.keys(state)[index]] === "Yes") {
		return {
			fillColor: getArtsEducationPolicyColor(index),
			color: "black",
			weight: 0.3,
		};
	} else {
		return {
			fillOpacity: 0,
			weight: 0,
		};
	}
}

//* get color based on what art policy we specify (by index)
function getArtsEducationPolicyColor(index) {
	// prettier-ignore
	const fillColor = index == 1 ? "#007AFF" :
					  index == 2 ? "#FF0000" :
					  index == 3 ? "#FFE600" :
					  index == 4 ? "#24FF00" :
					  index == 5 ? "#00FFA3" :
					  index == 6 ? "#DB00FF" :
					  index == 7 ? "#4200FF" :
					  index == 8 ? "#FF7A00" :
					  index == 9 ? "#5E382C" :
					 			   "#6F4200";
	return fillColor;
}

async function readCSVs() {
	csvPaths.forEach(function (path, index) {
		Papa.parse(path, {
			header: true,
			download: true,
			complete: function (data) {
				//* inserts data at a specified index so its index matches the index at csvPath
				csvData[index] = data;

				//* if the csvData array has no empty elements (meaning all csvPaths have been processed)
				if (!csvData.includes(undefined)) {
					//* run this function once all csv files have been loaded
					createLayers();
				}
			},
		});
	});
}
