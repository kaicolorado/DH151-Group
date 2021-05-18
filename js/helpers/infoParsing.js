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

function getStateScore(state, csvPathsIndex) {
	var scoresKey = Object.keys(csvData[csvPathsIndex].data[0])[1];
	const stateData = csvData[csvPathsIndex].data.find((row) => row.Jurisdiction === state);
	const stateScore = stateData[scoresKey];
	return stateScore;
}

function getStateInfoHTMLForPanel(name) {
	const stateAEPs = csvData[1].data.find((row) => row.State === name);

	var html = "";
	for (let j in stateAEPs) {
		if (j !== "State") {
			html += `${j}: ${stateAEPs[j]}<br/>`;
		}
	}

	return html;
}
