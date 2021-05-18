/* --------------------------------- Legend --------------------------------- */

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

/* ---------------------------- Hover Info Panel ---------------------------- */

function createInfoPanel() {
	infoPanel.onAdd = function (_) {
		this._div = L.DomUtil.create("div", "info"); //* create a div with a class "info"
		this.update();
		return this._div;
	};

	//* method that we will use to update the control based on feature properties passed
	infoPanel.update = function (properties) {
		//* if feature is highlighted
		if (properties) {
			html = getStateInfoHTMLForPanel(properties.NAME);
			this._div.innerHTML = /*html*/ `
				<b>${properties.NAME}</b>
				<br/>
				${html}
			`;
		}
		//* if feature is not highlighted
		else {
			this._div.innerHTML = "Hover over a country";
		}
	};

	infoPanel.addTo(map);
}
