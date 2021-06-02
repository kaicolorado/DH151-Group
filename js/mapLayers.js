var selectedState = null;

//* called after all CSV's have been parsed
function createLayers() {
	initializeClassyBrew();
	createCustomMetricLayer();
	createArtsEduPolicyLayers();
	createScoresLayers();
	setExpandableSidebarContent();
	initializeNAEPScoresChartDataChartJS();
}

//* custom metric: % of Arts Edu Policies Implemented * All 2019 scores added up
//* custom metric avg'd: % of Arts Edu Policies Implemented * (All 2019 scores added up / 4)
function createCustomMetricLayer() {
	const customMetric = getCustomMetric();
	const min = Math.min(...customMetric);
	const max = Math.max(...customMetric);

	customMetricLayer = L.geoJson(statesPolygonsJSON, {
		style: (feature) => getCustomMetricStyle(feature, min, max),
		onEachFeature: (feature, layer) => onEachFeature(feature, layer, "CUS"),
	});
	controls.addOverlay(customMetricLayer, "Custom Metric");
}

function createArtsEduPolicyLayers() {
	map.createPane("AEPPane");
	map.getPane("AEPPane").style.zIndex = 300;

	artsEducationPolicyLayers.push(
		L.geoJson(statesPolygonsJSON, {
			style: (feature) => getArtsEducationPolicySummaryStyle(feature),
			onEachFeature: (feature, layer) => onEachFeature(feature, layer, "AEP", 0),
			pane: "AEPPane",
		})
	);
	controls.addOverlay(artsEducationPolicyLayers[0], artsEducationPolicyTitles[0]);

	for (let i = 0; i < 10; i++) {
		artsEducationPolicyLayers.push(
			L.geoJson(statesPolygonsJSON, {
				style: (feature) =>
					useMonoColorsForArtsEduPolicyLayers
						? getArtsEducationPolicyStyleMono(feature, i + 1)
						: getArtsEducationPolicyStyle(feature, i + 1),
				onEachFeature: (feature, layer) => onEachFeature(feature, layer, "AEP", i + 1), //* `i + 1` b/c of the summary layer
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
		for (let i = 0; i < 4; i++) {
			const score = parseInt(getStateScore(state.state, i + 2));
			const min = scoresLayerObjects[i].min;
			const max = scoresLayerObjects[i].max;
			const marker = getMarker(score, min, max);
			scoresLayerObjects[i].scoresNumberLayer.addLayer(marker);
		}
		function getMarker(score, min, max) {
			return L.marker([state.latitude, state.longitude], {
				icon: L.divIcon({
					iconSize: null,
					className: "score-overlay",
					html: /*html*/ `
						<div>
							${score === max ? bestStateIcon : score === min ? worstStateIcon : ""} ${score}
						</div>`,
				}),
				interactive: false, //* so that you can click the underlying polygon when clicking on the number icon
			});
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

function onEachFeature(feature, layer, layerType, index = null) {
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
	createNAEPScoresChartChartJS(layer.feature.properties.NAME); //TODO: causes lag, maybe only show chart if use clicks state
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
	} else if (layerType === "CUS") {
		customMetricLayer.resetStyle(layer);
	}
	infoPanel.update();
	$("#chart-js").remove();
}

function selectFeature(clickedStateLayer, layerType, index) {
	if (selectedState) {
		resetHighlight(selectedState.layer, selectedState.layerType, selectedState.index);
		selectedState = null;
	} else {
		highlightFeature(clickedStateLayer);
		selectedState = { layer: clickedStateLayer, layerType: layerType, index: index };
	}
}
