// TODO: use https://c0arw235.caspio.com/dp/b7f93000869e5c0fbadf42efabbc,  https://c0arw235.caspio.com/dp/b7f9300090f4ba51c9144867b01f, https://c0arw235.caspio.com/dp/b7f9300062f044d142eb469b83ba?state=California, etc. in map to give more information about each policy

const csvPaths = [
	csvPath_EducationalSpendingInPublicSchools,
	csvPath_ArtsEducationPolicies,
	csvPath_SP_G4_Math_2019,
	csvPath_SP_G8_Math_2019,
	csvPath_SP_G4_Reading_2019,
	csvPath_SP_G8_Reading_2019,
];

const artsEducationPolicyTitles = [
	"AEP1: Arts as a Core Academic Subject",
	"AEP2: Early Childhood Arts Ed Standards",
	"AEP3: Elementary & Secondary Arts Ed Standards",
	"AEP4: Arts Ed Instructional Requirement - Elementary School",
	"AEP5: Arts Ed Instructional Requirement - Middle School",
	"AEP6: Arts Ed Instructional Requirement - High School",
	"AEP7: Arts Alteratives for High School Graduation",
	"AEP8: Arts Ed Assessment Requirements",
	"AEP9: Arts Ed Requirements for State Accreditation",
	"AEP10: State Arts Ed Grant Program or School for Arts",
];

const scoresLayersTitles = [
	"Standardized Performances - Grade 4 - Math - 2019",
	"Standardized Performances - Grade 8 - Math - 2019",
	"Standardized Performances - Grade 4 - Reading - 2019",
	"Standardized Performances - Grade 8 - Reading - 2019",
];

//* change b/w 1 and 0 based on whether you want the Arts Edu policy layers to be single colored or not
const useMonoColorsForArtsEduPolicyLayers = 1;

var map;
const controls = L.control.layers();
const legend = new L.Legend();

const artsEducationPolicyLayers = [];
const scoresLayers = [];

var statesPolygonsJSON;
var statesCentersJSON;

var layersCorrelationMatrix;

const csvData = new Array(csvPaths.length);

let info_panel = L.control();

// var activeOverlays = [];

// REVIEW: we can either modify the colors of a single layer based on what layers the user selects,
//         or overlay multiple layers, one for each feature.

//* initialize
$(function () {
	createMap();
	getStatePolygons();
	getStateCenters();
	getCorrelationMatrix();
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

	map.on("overlayadd", (_) => {
		// addActiveOverlayID(event);
		legend.setContent(getNewLegendContent());
		updateScoresLayersStyle();
		updateCurrentCorrelation();
	});

	map.on("overlayremove", (_) => {
		// removeActiveOverlayID(event);
		legend.setContent(getNewLegendContent());
		updateScoresLayersStyle();
		updateCurrentCorrelation();
	});
}

// function addActiveOverlayID(event) {
// 	activeOverlays.push({ name: event.name, id: event.layer._leaflet_id });
// }

// function removeActiveOverlayID(event) {
// 	activeOverlays = activeOverlays.filter((overlay) => overlay.id !== event.layer._leaflet_id);
// }

function createLayers() {
	createArtsEduPolicyLayers();
	createScoresLayers();
	setExpandableSidebarContent();
	createInfoPanel();
}

function createInfoPanel() {
	info_panel.onAdd = function (map) {
		this._div = L.DomUtil.create("div", "info"); // create a div with a class "info"
		this.update();
		return this._div;
	};

	// method that we will use to update the control based on feature properties passed
	info_panel.update = function (properties) {
		// if feature is highlighted
		if (properties) {
			html = getStateInfo(properties.NAME);
			this._div.innerHTML = /*html*/ `
				<b>${properties.NAME}</b>
				<br/>
				${html}
			`;
		}
		// if feature is not highlighted
		else {
			this._div.innerHTML = "Hover over a country";
		}
	};

	info_panel.addTo(map);
}

function getStateInfo(name) {
	// for (let i = 1; i < csvData.length; i++) {
	// 	var stateRow;
	// 	stateRow = csvData[i].data.find((row) => row.State === name);
	// 	if (!stateRow) {
	// 		stateRow = csvData[i].data.find((row) => row.Jurisdiction === name);
	// 	}

	// console.log(stateRow);
	// }

	const stateAEPs = csvData[1].data.find((row) => row.State === name);
	// console.log(stateAEPs);
	var html = "";
	for (let j in stateAEPs) {
		if (j !== "State") {
			html += `${j}: ${stateAEPs[j]}<br/>`;
			// console.log(j);
			// console.log(stateAEPs[j]);
		}
	}
	// console.log(html);

	return html;
}

function createArtsEduPolicyLayers() {
	for (let i = 0; i < 10; i++) {
		artsEducationPolicyLayers.push(
			L.geoJson(statesPolygonsJSON, {
				style: (feature) =>
					useMonoColorsForArtsEduPolicyLayers
						? getArtsEducationPolicyStyleMono(feature, i + 1)
						: getArtsEducationPolicyStyle(feature, i + 1),
				onEachFeature: (feature, layer) => onEachFeature(feature, layer, "AEP", i),
			})
		);
		controls.addOverlay(artsEducationPolicyLayers[i], artsEducationPolicyTitles[i]);
	}
}

function onEachFeature(feature, layer, layerType, index) {
	layer.on({
		mouseover: highlightFeature,
		mouseout: (e) => resetHighlight(e, layerType, index),
		click: zoomToFeature,
	});
}

function highlightFeature(e) {
	var layer = e.target;

	// style to use on mouse over
	if (layer.options.fillOpacity === 0) {
		layer.setStyle({
			weight: 2,
		});
	} else {
		layer.setStyle({
			weight: 2,
			fillOpacity: 0.5,
		});
	}

	if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
		layer.bringToFront();
	}

	info_panel.update(layer.feature.properties);
}

function resetHighlight(e, layerType, index) {
	// geojson_layer.resetStyle(e.target);
	// e.target.resetStyle();
	// scoresLayers.forEach(function (layerGroup) {
	// 	layerGroup.eachLayer(function (layer) {
	// 		if (layer instanceof L.GeoJSON) {
	// 			layer.resetStyle();
	// 		}
	// 	});
	// });
	if (layerType === "AEP") {
		// console.log(e.target);
		// artsEducationPolicyLayers[index].eachLayer(function (layer) {
		// 	layer.resetStyle()
		// })
		artsEducationPolicyLayers[index].resetStyle(e.target);
	} else if (layerType === "Score") {
		// scoresLayers[index].resetStyle(e.target);
		scoresLayers[index].eachLayer(function (layer) {
			if (layer instanceof L.GeoJSON) {
				layer.resetStyle(e.target);
			}
		});
	}
	info_panel.update();
}

function zoomToFeature(e) {
	map.fitBounds(e.target.getBounds());
}

function createScoresLayers() {
	const scoresKey = Object.keys(csvData[2].data[0])[1];

	const scoresLayerObjects = [];
	for (let i = 0; i < 4; i++) {
		const scoresNumberLayer = L.featureGroup();

		const scores = csvData[i + 2].data.map((val) => val[scoresKey]);
		scores.pop(); //* removes last element, Puerto Rico (b/c not a state)

		const min = Math.min(...scores);
		const max = Math.max(...scores);

		scoresLayerObjects.push({ scoresNumberLayer, min, max });
	}

	statesCentersJSON.forEach(function (state, _) {
		function getMarker(score) {
			return L.marker([state.latitude, state.longitude], {
				icon: L.divIcon({
					iconSize: null,
					className: "score-overlay",
					html: `<div>${score}</div>`,
				}),
			});
		}

		for (let i = 0; i < 4; i++) {
			const score = getStateScore(state.state, i + 2);
			const marker = getMarker(score);
			scoresLayerObjects[i].scoresNumberLayer.addLayer(marker);
		}
	});

	for (let i = 0; i < 4; i++) {
		const index = i;
		const scoresColorLayer = L.geoJson(statesPolygonsJSON, {
			style: (feature) =>
				getScoresStyle(feature, index + 2, scoresLayerObjects[index].min, scoresLayerObjects[index].max),
			onEachFeature: (feature, layer) => onEachFeature(feature, layer, "Score", i),
		});
		scoresLayers.push(L.layerGroup([scoresLayerObjects[i].scoresNumberLayer, scoresColorLayer]));

		controls.addOverlay(scoresLayers[i], scoresLayersTitles[i]);
	}
}

function setExpandableSidebarContent() {
	$("#correlation-stats").html(`<h4>Please select two layers to view correlation data.</h4>`);

	artsEducationPolicyLayers.forEach(function (_, index) {
		$("#arts-education-policy-layers").append(/*html*/ `
			<div class="layer-control-item">
				<label class="switch">
					<input type="checkbox" data-layerindex="${index}">
					<span class="slider round"></span>
					<div class="layer-control-item-text"><p>${artsEducationPolicyTitles[index]}</p></div>
				</label>
			</div>
		`);
	});

	scoresLayers.forEach(function (_, index) {
		$("#scores-layers").append(/*html*/ `
			<div class="layer-control-item">
				<label class="switch">
					<input type="checkbox" data-layerindex="${index}">
					<span class="slider round"></span>
					<div class="layer-control-item-text"><p>${scoresLayersTitles[index]}</p></div>
				</label>
			</div>
		`);
	});

	$('#arts-education-policy-layers .layer-control-item input[type="checkbox"]').on("change", function () {
		var checkbox = $(this);

		const layerIndex = checkbox.data().layerindex;

		if (checkbox.is(":checked")) {
			map.addLayer(artsEducationPolicyLayers[layerIndex]);
		} else {
			map.removeLayer(artsEducationPolicyLayers[layerIndex]);
		}
	});

	$('#scores-layers .layer-control-item input[type="checkbox"]').on("change", function () {
		var checkbox = $(this);

		const layerIndex = checkbox.data().layerindex;

		if (checkbox.is(":checked")) {
			map.addLayer(scoresLayers[layerIndex]);
		} else {
			map.removeLayer(scoresLayers[layerIndex]);
		}
	});
}

function updateCurrentCorrelation() {
	//* get current index (from list of toggleable layers in the top right of the map) of the layer that was passed to this function
	const activeOverlayIndices = getActiveOverlayIndices();

	if (activeOverlayIndices.length != 2) {
		$("#correlation-stats").html(`<h4>Please select two layers to view correlation data.</h4>`);
	} else {
		const correlation = layersCorrelationMatrix[activeOverlayIndices[0]][activeOverlayIndices[1]];
		if (correlation === null) {
			$("#correlation-stats").html("<h4>N/A</h4>");
		} else {
			$("#correlation-stats").html(`<h4>${correlation.toFixed(5)}</h4>`);
		}
	}
}

function getNewLegendContent() {
	const activeOverlayTitles = getActiveOverlayTitles();

	var newLegendContent = /*html*/ `<h3>Activated Layers</h3>`;

	//* if no layers are currently selected, we want to display 'None'
	if (activeOverlayTitles.length === 0) {
		newLegendContent += /*html*/ `<p style="width: 100%; text-align: center;">None</p>`;
	} else {
		//* display color and layer name for each activated layer
		// TODO: if active layer is one of the score ones, we want to have 2 legend entries. One that shows low color and another that shows high
		// TODO: OR - just have 2 squares next to one entry and put (Low-High) in parentheses

		const activeOverlayTitlesArtsEduPolicies = getActiveOverlayTitlesArtsEduPolicies();

		if (useMonoColorsForArtsEduPolicyLayers) {
			for (let i = 1; i <= activeOverlayTitlesArtsEduPolicies.length; i++) {
				let colorBoxSingle = /*html*/ `<div class="color-box-single" style="background-color: #007aff;"></div>`;

				for (let j = 1; j < i; j++) {
					colorBoxSingle += /*html*/ `<div class="color-box-single" style="background-color: #007aff;"></div>`;
				}

				newLegendContent += /*html*/ `
					<div class="legend-layer-info">
						<div class="color-box">
							${colorBoxSingle}
						</div>
						<p>${i} ${i === 1 ? "Art Policy" : "Art Policies"} Implemented</p>
					</div>
					<br>
				`;
			}
		} else {
			activeOverlayTitlesArtsEduPolicies.forEach(function (activeOverlayTitle) {
				const title = Object.keys(activeOverlayTitle)[0];
				const originalIndex = Object.values(activeOverlayTitle)[0];

				const colorBoxHTML = /*html*/ `
					<div class="color-box">
						<div class="color-box-single" style="background-color: ${getArtsEducationPolicyColor(originalIndex + 1)};"></div>
					</div>
				`;

				newLegendContent += /*html*/ `
					<div class="legend-layer-info">
						${colorBoxHTML}
						<p>${title}</p>
					</div>
					<br>
				`;
			});
		}

		const activeOverlayTitlesScores = getActiveOverlayTitlesScores();

		activeOverlayTitlesScores.forEach(function (titleObject) {
			const title = Object.keys(titleObject)[0];
			newLegendContent += /*html*/ `
					<div class="legend-layer-info">
						<p>${title}</p>
					</div>
					<br>
				`;
		});
	}

	return newLegendContent;
}

function getActiveOverlayTitles() {
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

	return activeOverlayTitles;
}

function getActiveOverlayIndices() {
	const overlays = controls.getOverlays(); //* gets all overlays and whether they're currently selected
	const activeOverlayIndices = [];

	//* if the layer controls have at least been interacted with (i.e. something has been (de)selected)
	if (Object.keys(overlays).length !== 0) {
		for (var key in overlays) {
			//* if layer is currently selected
			if (overlays[key]) {
				const index = Object.keys(overlays).indexOf(key);
				activeOverlayIndices.push(index);
			}
		}
	}

	return activeOverlayIndices;
}

function getActiveOverlayTitlesArtsEduPolicies() {
	return getActiveOverlayTitles().filter((titleObject) => {
		const title = Object.keys(titleObject)[0];
		return title.includes("AEP");
		// REVIEW: may need to change this in the future if we stop including 'AEP' in the title
	});
}

function getActiveOverlayTitlesScores() {
	return getActiveOverlayTitles().filter((titleObject) => {
		const title = Object.keys(titleObject)[0];
		return title.includes("Standardized Performances");
		// REVIEW: may need to change this in the future if we stop including 'Standardized Performances' in the title
	});
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

//* correlation matrix indices must match the indices of the layers in the layer picker
function getCorrelationMatrix() {
	fetch("data/correlation-matrix.json").then(async (response) => {
		layersCorrelationMatrix = await response.json();
	});
}

function getStateScore(state, csvPathsIndex) {
	var scoresKey = Object.keys(csvData[csvPathsIndex].data[0])[1];
	const stateData = csvData[csvPathsIndex].data.find((row) => row.Jurisdiction === state);
	const stateScore = stateData[scoresKey];
	return stateScore;
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
			fillColor: "white",
			fillOpacity: 0,
			weight: 0,
			color: "black",
		};
	}
}

function getArtsEducationPolicyStyleMono(feature, index) {
	const state = csvData[1].data.find((row) => row.State === feature.properties.NAME);

	//* if we found a state from above and the current indexed column's result for that state is 'Yes', we want to give it a color
	if (state && state[Object.keys(state)[index]] === "Yes") {
		return {
			fillColor: "#007AFF",
			fillOpacity: 0.2,
			color: "black",
			weight: 0.3,
		};
	} else {
		return {
			fillColor: "white",
			fillOpacity: 0,
			weight: 0,
			color: "black",
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

// TODO: use ClassyBrew to get color instead
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

function updateScoresLayersStyle() {
	if (getActiveOverlayTitlesArtsEduPolicies().length > 0) {
		scoresLayers.forEach(function (layerGroup) {
			layerGroup.eachLayer(function (layer) {
				layer.setStyle({ fillOpacity: 0 });
			});
		});
	} else {
		scoresLayers.forEach(function (layerGroup) {
			layerGroup.eachLayer(function (layer) {
				if (layer instanceof L.GeoJSON) {
					layer.resetStyle();
				}
			});
		});
	}
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
