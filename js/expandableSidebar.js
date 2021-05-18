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
