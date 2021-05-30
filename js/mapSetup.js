//* create the map
function createMap() {
	map = L.map("map").setView([39.8283, -92.5795], 5); // coords for center of the US

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
		legend.setContent(getNewLegendContent());
		updateScoresLayersStyle();
		updateCurrentCorrelation();
	});

	map.on("overlayremove", (_) => {
		legend.setContent(getNewLegendContent());
		updateScoresLayersStyle();
		updateCurrentCorrelation();
	});
}
