var map;
const controls = L.control.layers();
const legend = new L.Legend();

const artsEducationPolicyLayers = [];
var spG4Math2019Layer;
var spG8Math2019Layer;
var spG4Reading2019Layer;
var spG8Reading2019Layer;

var statesPolygonsJSON;
var statesCentersJSON;

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
	getStateCenters();
	readCSVs();
});

//* create the map
function createMap() {
	map = L.map("map").setView([39.8283, -98.5795], 5); // coords for center of the US

	L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	}).addTo(map);

	controls.addTo(map);

	legend.setPosition("bottomright");

	legend.onAdd = function (_) {
		var div = L.DomUtil.create("div", "activated-layers-legend");

		div.innerHTML = getNewLegendContent();

		return div;
	};

	legend.addTo(map);

	map.on("overlayadd", (_) => legend.setContent(getNewLegendContent()));
	map.on("overlayremove", (_) => legend.setContent(getNewLegendContent()));
}

function getNewLegendContent() {
	const overlays = controls.getOverlays(); //* gets all overlays and whether they're currently selected
	const activeOverlayTitles = [];

	//* if the layer controls have at least been interacted with (i.e. something has been (de)selected)
	if (Object.keys(overlays).length !== 0) {
		for (var key in overlays) {
			//* if layer is currently selected
			if (overlays[key]) {
				const index = Object.keys(overlays).indexOf(key);
				var titleObj = {};
				titleObj[key] = index;

				activeOverlayTitles.push(titleObj);
			}
		}
	}

	var newLegendContent = /*html*/ `<h3>Activated Layers</h3>`;

	//* if no layers are currently selected, we want to display 'None'
	if (activeOverlayTitles.length === 0) {
		newLegendContent += /*html*/ `<p style="width: 100%; text-align: center;">None</p>`;
	} else {
		//* display color and layer name for each activated layer
		// TODO: if active layer is one of the score ones, we want to have 2 legend entries. One that shows low color and another that shows high
		// TODO: OR - just have 2 squares next to one entry and put (Low-High) in parentheses
		activeOverlayTitles.forEach(function (activeOverlayTitle) {
			const title = Object.keys(activeOverlayTitle)[0];
			const originalIndex = Object.values(activeOverlayTitle)[0];
			// console.log(title);

			const colorBoxHTML = /*html*/ `
					<div
						class="color-box"
						style="background-color: ${getArtsEducationPolicyColor(originalIndex + 1)};"
					></div>
				`;

			newLegendContent += /*html*/ `${colorBoxHTML} <p>${title}</p> <br>`;
		});
	}

	return newLegendContent;
}

function getStatePolygons() {
	fetch("data/states-polygons-20m.json").then(async (response) => {
		statesPolygonsJSON = await response.json();
	});
}

function getStateCenters() {
	fetch("data/states-center-coords.json").then(async (response) => {
		statesCentersJSON = await response.json();
	});
}

function createLayers() {
	for (var i = 1; i < 11; i++) {
		const index = i;
		artsEducationPolicyLayers.push(
			L.geoJson(statesPolygonsJSON, {
				style: (feature) => getArtsEducationPolicyStyle(feature, index),
			})
		);
		controls.addOverlay(artsEducationPolicyLayers[i - 1], `Arts Education Policy ${i}`);
	}

	const spG4Math2019NumberLayer = L.featureGroup();
	const spG8Math2019NumberLayer = L.featureGroup();
	const spG4Reading2019NumberLayer = L.featureGroup();
	const spG8Reading2019NumberLayer = L.featureGroup();

	const scoresKey = Object.keys(csvData[2].data[0])[1];
	const scores_G4Math2019 = csvData[2].data.map((val) => val[scoresKey]);
	const scores_G8Math2019 = csvData[3].data.map((val) => val[scoresKey]);
	const scores_G4Reading2019 = csvData[4].data.map((val) => val[scoresKey]);
	const scores_G8Reading2019 = csvData[5].data.map((val) => val[scoresKey]);
	scores_G4Math2019.pop(); //* removes last element, Puerto Rico (b/c not a state)
	scores_G8Math2019.pop();
	scores_G4Reading2019.pop();
	scores_G8Reading2019.pop();

	const min_G4Math2019 = Math.min(...scores_G4Math2019);
	const max_G4Math2019 = Math.max(...scores_G4Math2019);
	const min_G8Math2019 = Math.min(...scores_G8Math2019);
	const max_G8Math2019 = Math.max(...scores_G8Math2019);
	const min_G4Reading2019 = Math.min(...scores_G4Reading2019);
	const max_G4Reading2019 = Math.max(...scores_G4Reading2019);
	const min_G8Reading2019 = Math.min(...scores_G8Reading2019);
	const max_G8Reading2019 = Math.max(...scores_G8Reading2019);

	statesCentersJSON.forEach(function (state, index) {
		function getMarker(score) {
			return L.marker([state.latitude, state.longitude], {
				icon: L.divIcon({
					iconSize: null,
					className: "score-overlay",
					html: `<div>${score}</div>`,
				}),
			});
		}

		const score_G4Math2019 = getStateScore(state.state, 2);
		const score_G8Math2019 = getStateScore(state.state, 3);
		const score_G4Reading2019 = getStateScore(state.state, 4);
		const score_G8Reading2019 = getStateScore(state.state, 5);

		const marker_G4Math2019 = getMarker(score_G4Math2019);
		const marker_G8Math2019 = getMarker(score_G8Math2019);
		const marker_G4Reading2019 = getMarker(score_G4Reading2019);
		const marker_G8Reading2019 = getMarker(score_G8Reading2019);

		spG4Math2019NumberLayer.addLayer(marker_G4Math2019);
		spG8Math2019NumberLayer.addLayer(marker_G8Math2019);
		spG4Reading2019NumberLayer.addLayer(marker_G4Reading2019);
		spG8Reading2019NumberLayer.addLayer(marker_G8Reading2019);
	});

	const spG4Math2019ColorLayer = L.geoJson(statesPolygonsJSON, {
		style: (feature) => getScoresStyle(feature, 2, min_G4Math2019, max_G4Math2019),
	});
	const spG8Math2019ColorLayer = L.geoJson(statesPolygonsJSON, {
		style: (feature) => getScoresStyle(feature, 3, min_G8Math2019, max_G8Math2019),
	});
	const spG4Reading2019ColorLayer = L.geoJson(statesPolygonsJSON, {
		style: (feature) => getScoresStyle(feature, 4, min_G4Reading2019, max_G4Reading2019),
	});
	const spG8Reading2019ColorLayer = L.geoJson(statesPolygonsJSON, {
		style: (feature) => getScoresStyle(feature, 5, min_G8Reading2019, max_G8Reading2019),
	});

	spG4Math2019Layer = L.layerGroup([spG4Math2019NumberLayer, spG4Math2019ColorLayer]);
	spG8Math2019Layer = L.layerGroup([spG8Math2019NumberLayer, spG8Math2019ColorLayer]);
	spG4Reading2019Layer = L.layerGroup([spG4Reading2019NumberLayer, spG4Reading2019ColorLayer]);
	spG8Reading2019Layer = L.layerGroup([spG8Reading2019NumberLayer, spG8Reading2019ColorLayer]);

	controls.addOverlay(spG4Math2019Layer, "Standardized Performances - Grade 4 - Math - 2019");
	controls.addOverlay(spG8Math2019Layer, "Standardized Performances - Grade 8 - Math - 2019");
	controls.addOverlay(spG4Reading2019Layer, "Standardized Performances - Grade 4 - Reading - 2019");
	controls.addOverlay(spG8Reading2019Layer, "Standardized Performances - Grade 8 - Reading - 2019");
}

function getStateScore(state, csvPathsIndex) {
	var scoresKey = Object.keys(csvData[csvPathsIndex].data[0])[1];
	const stateData = csvData[csvPathsIndex].data.find((row) => row.Jurisdiction === state);
	const stateScore = stateData[scoresKey];
	return stateScore;
}

// TODO: if scores layers are the only ones selected, we want to do heatmap. else, we should just do the numbers
function getScoresStyle(feature, csvPathsIndex, min, max) {
	const stateData = csvData[csvPathsIndex].data.find((row) => row.Jurisdiction === feature.properties.NAME);

	if (stateData) {
		var scoresKey = Object.keys(csvData[csvPathsIndex].data[0])[1];
		const stateScore = stateData[scoresKey];

		const scaledVal = (stateScore - min) / (max - min);
		const colorHSL = getHeatmapColorFromValue(scaledVal);
		const colorHex = hslToHex(colorHSL.hue, colorHSL.saturation, colorHSL.luminance);

		return {
			fillColor: colorHex,
			fillOpacity: 0.2,
			color: "black",
			weight: 0.3,
		};
	}
}

function getArtsEducationPolicyStyle(feature, index) {
	//* get the state object who's name (e.g. 'Alabama') matches the state name we're mapping now
	const state = csvData[1].data.find((row) => row.State === feature.properties.NAME);

	//* if we found a state from above and the current indexed column's result for that state is 'Yes', we want to give it a color
	if (state && state[Object.keys(state)[index]] === "Yes") {
		return {
			fillColor: getArtsEducationPolicyColor(index),
			fillOpacity: 0.2,
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
	const fillColor = index == 1  ? "#007AFF" :
					  index == 2  ? "#FF0000" :
					  index == 3  ? "#FFE600" :
					  index == 4  ? "#24FF00" :
					  index == 5  ? "#00FFA3" :
					  index == 6  ? "#DB00FF" :
					  index == 7  ? "#4200FF" :
					  index == 8  ? "#FF7A00" :
					  index == 9  ? "#5E382C" :
					  index == 10 ? "#6F4200" :
					  null;
	return fillColor;
}

async function readCSVs() {
	console.log("Downloading and parsing CSVs...");
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

//* `value` must be from 0 to 1
function getHeatmapColorFromValue(value) {
	var h = (1.0 - value) * 240;
	return { hue: h, saturation: 100, luminance: 50 };
}

function hslToHex(h, s, l) {
	l /= 100;
	const a = (s * Math.min(l, 1 - l)) / 100;
	const f = (n) => {
		const k = (n + h / 30) % 12;
		const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
		return Math.round(255 * color)
			.toString(16)
			.padStart(2, "0"); // convert to Hex and prefix "0" if needed
	};
	return `#${f(0)}${f(8)}${f(4)}`;
}
