var selectedState = null;

//* called after all CSV's have been parsed
function createLayers() {
	initializeClassyBrew();
	createArtsEduPolicyLayers();
	createScoresLayers();
	setExpandableSidebarContent();
	initializeNAEPScoresChartDataChartJS();
}

function createArtsEduPolicyLayers() {
	map.createPane("AEPPane");
	map.getPane("AEPPane").style.zIndex = 300;

	for (let i = 0; i < 10; i++) {
		artsEducationPolicyLayers.push(
			L.geoJson(statesPolygonsJSON, {
				style: (feature) =>
					useMonoColorsForArtsEduPolicyLayers
						? getArtsEducationPolicyStyleMono(feature, i + 1)
						: getArtsEducationPolicyStyle(feature, i + 1),
				onEachFeature: (feature, layer) => onEachFeature(feature, layer, "AEP", i),
				pane: "AEPPane",
			})
		);
		controls.addOverlay(artsEducationPolicyLayers[i], artsEducationPolicyTitles[i]);
	}
}

function createScoresLayers() {
	const scoresLayerObjects = [];
	for (let i = 0; i < 4; i++) {
		const scoresNumberLayer = L.featureGroup();

		const scores = getScores(i + 2);

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

		//* so that scores color layers are always below AEP layers. This is so the on hover color change works properly
		map.createPane("scoresColorsPane");
		map.getPane("scoresColorsPane").style.zIndex = 200;

		const scoresColorLayer = L.geoJson(statesPolygonsJSON, {
			style: (feature) =>
				getScoresStyle(feature, index + 2, scoresLayerObjects[index].min, scoresLayerObjects[index].max),
			onEachFeature: (feature, layer) => onEachFeature(feature, layer, "Score", i),
			pane: "scoresColorsPane",
		});

		scoresLayers.push(L.layerGroup([scoresLayerObjects[i].scoresNumberLayer, scoresColorLayer]));

		controls.addOverlay(scoresLayers[i], scoresLayersTitles[i]);
	}
}

function onEachFeature(feature, layer, layerType, index) {
	layer.on({
		mouseover: (e) => highlightFeature(e.target, "mouseover"),
		mouseout: (e) => resetHighlight(e.target, layerType, index, "mouseout"),
		click: (e) => selectFeature(e.target, layerType, index),
	});
}

function highlightFeature(layer, caller = null) {
	if (selectedState && caller === "mouseover") {
		return;
	}

	//* style to use on mouse over
	//* if we want to keep this state as a clear color,
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

	infoPanel.update(layer.feature.properties);
	createNAEPScoresChartChartJS(layer.feature.properties.NAME);
}

function resetHighlight(layer, layerType, index, caller = null) {
	if (selectedState && caller === "mouseout") {
		return;
	}

	if (layerType === "AEP") {
		artsEducationPolicyLayers[index].resetStyle(layer);
	} else if (layerType === "Score") {
		if (getActiveOverlayTitlesArtsEduPolicies().length > 0) {
			scoresLayers[index].eachLayer(function (scoresLayer) {
				scoresLayer.setStyle({ fillOpacity: 0, weight: 0.3 });
			});
		} else {
			scoresLayers[index].eachLayer(function (scoresLayer) {
				if (scoresLayer instanceof L.GeoJSON) {
					scoresLayer.resetStyle(layer);
				}
			});
		}
	}
	infoPanel.update();
}

function selectFeature(clickedStateLayer, layerType, index) {
	if (selectedState) {
		resetHighlight(selectedState.layer, selectedState.layerType, selectedState.index);
		selectedState = null;
	} else {
		highlightFeature(clickedStateLayer);
		selectedState = { layer: clickedStateLayer, layerType: layerType, index: index };
	}

	// if (selectedState) {
	// 	if (selectedState.layer === clickedStateLayer) {
	// 		resetHighlight(clickedStateLayer, layerType, index);
	// 		selectedState = null;
	// 	} else {
	// 		resetHighlight(selectedState.layer, selectedState.layerType, selectedState.index);
	// 		// highlightFeature(clickedStateLayer);
	// 		// selectedState = { layer: clickedStateLayer, layerType: layerType, index: index };
	// 		selectedState = null;
	// 	}
	// } else {
	// 	highlightFeature(clickedStateLayer);
	// 	selectedState = { layer: clickedStateLayer, layerType: layerType, index: index };
	// }
}
