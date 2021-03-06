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

		const activeTitles = activeOverlayTitles.map((titleObj) => Object.keys(titleObj)[0]);

		if (activeTitles.includes("Overall Score")) {
			newLegendContent += /*html*/ `
				<div class="legend-layer-info">
					<p>Overall Score</p>
				</div>
				<br>`;
		}

		const activeOverlayTitlesArtsEduPolicies = getActiveOverlayTitlesArtsEduPolicies();
		const activeArtsEduTitles = activeOverlayTitlesArtsEduPolicies.map((titleObj) => Object.keys(titleObj)[0]);

		if (activeArtsEduTitles.includes(artsEducationPolicyTitles[0])) {
			newLegendContent += /*html*/ `
				<div class="legend-layer-info">
					<p>${artsEducationPolicyTitles[0]}</p>
				</div>
				<br>`;
		}

		if (useMonoColorsForArtsEduPolicyLayers) {
			var activeOverlayTitlesArtsEduPoliciesLength = activeOverlayTitlesArtsEduPolicies.length;
			if (activeArtsEduTitles.includes(artsEducationPolicyTitles[0])) activeOverlayTitlesArtsEduPoliciesLength--; //* hack. if summary layer is active,

			for (let i = 1; i <= activeOverlayTitlesArtsEduPoliciesLength; i++) {
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
					<br>`;
			}
		} else {
			//TODO: clause doesn't work with new summary layer. Fix if going to use.
			activeOverlayTitlesArtsEduPolicies.forEach(function (activeOverlayTitle) {
				const title = Object.keys(activeOverlayTitle)[0];
				const originalIndex = Object.values(activeOverlayTitle)[0];

				const colorBoxHTML = /*html*/ `
					<div class="color-box">
						<div class="color-box-single" style="background-color: ${getArtsEducationPolicyColor(originalIndex + 1)};"></div>
					</div>`;

				newLegendContent += /*html*/ `
					<div class="legend-layer-info">
						${colorBoxHTML}
						<p>${title}</p>
					</div>
					<br>`;
			});
		}

		const activeOverlayTitlesScores = getActiveOverlayTitlesScores();

		activeOverlayTitlesScores.forEach(function (titleObject) {
			const title = Object.keys(titleObject)[0];
			newLegendContent += /*html*/ `
					<div class="legend-layer-info">
						<p>${title}</p>
					</div>
					<br>`;
		});

		if (activeOverlayTitlesScores.length > 0) {
			newLegendContent += /*html*/ `
				<div class="legend-layer-info" style="display: flex">
					<p style="flex: 1">${bestStateIcon}: Best State</p>
					<p style="flex: 1">${worstStateIcon}: Worst State</p>
				</div>`;
		}
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
			stateInfo = getStateInfo(properties.NAME);

			var html = "";

			html += `<h3>Overall Score</h3>`;
			html += `<ul id="custom-metric-list">`;
			html += `<li>${stateInfo.customMetric["Custom Metric"]}</li>`;
			html += `</ul>`;

			html += `<h3>Arts Policies</h3>`;
			html += `<ul id="arts-policies-list">`;
			for (let i = 0; i < 10; i++) {
				//* 10 b/c first 10 columns are the indiv. policies
				if (stateInfo.AEPs[i] === "Yes") {
					html += `<li>AEP${i + 1}&ensp;&#9989;</li>`;
				} else {
					html += `<li>AEP${i + 1}&ensp;&#10060;</li>`;
				}
			}
			html += `</ul>`;

			html += `<h3>Standardized Scores</h3>`;
			html += `<ul id="scores-list">`;
			for (const key in stateInfo.scores) {
				html += `<li>${key}: <strong>${stateInfo.scores[key]}</strong>`;
			}
			html += `</ul>`;

			this._div.innerHTML = `
				<h2>${properties.NAME}</h2>
				${html}`;
		}
		//* if feature is not highlighted
		else {
			this._div.innerHTML = /*html*/ `
				<p>Hover over or click a state</p>
				<p style="font-size: 11pt">
					(with at least one layer active)
				</p>`;
		}
	};

	infoPanel.addTo(map);
}
