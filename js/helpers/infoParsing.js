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
		return artsEducationPolicyTitles.includes(title);
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

function getStateInfo(name) {
	var stateInfo;

	const stateAEPRow = csvData[1].data.find((row) => row.State === name);

	var stateAEPs = [];

	Object.keys(stateAEPRow).forEach(function (key) {
		if (key != "State") {
			stateAEPs.push(stateAEPRow[key]);
		}
	});

	const stateScores = {
		"Grade 4 - Math - 2019": csvData[2].data.find((row) => row.Jurisdiction === name)["Score (MN)"],
		"Grade 8 - Math - 2019": csvData[3].data.find((row) => row.Jurisdiction === name)["Score (MN)"],
		"Grade 4 - Reading - 2019": csvData[4].data.find((row) => row.Jurisdiction === name)["Score (MN)"],
		"Grade 8 - Reading - 2019": csvData[5].data.find((row) => row.Jurisdiction === name)["Score (MN)"],
	};

	const stateCustomMetric = csvData[10].data.find((row) => row.State === name);

	stateInfo = { AEPs: stateAEPs, scores: stateScores, customMetric: stateCustomMetric };

	return stateInfo;
}

function getScores(csvIndex) {
	const scores = csvData[csvIndex].data.map((val) => val["Score (MN)"]);
	scores.pop(); //* removes last element, Puerto Rico (b/c not a state)
	scores.pop(); //* removes 'National public'
	scores.pop(); //* removes DoDEA
	return scores;
}

function getArtsEduPolicyPercentages() {
	//* e.g. 0.1, 0.4, 1
	const percentages = csvData[1].data.map((val) => parseFloat(val["% of Policies Implemented"]));
	return percentages;
}

function getCustomMetric() {
	const customMetric = csvData[10].data.map((val) => parseFloat(val["Custom Metric"]));
	return customMetric;
}

function getCustomMetricAvgd() {
	const customMetricAvgd = csvData[10].data.map((val) => parseFloat(val["Custom Metric Avg'd"]));
	return customMetricAvgd;
}

function getYearlyNAEPScoresOfState(state) {
	var NAEPScores = {};

	for (const datasetName in NAEP_CSVIndexEnum) {
		index = NAEP_CSVIndexEnum[datasetName];

		//* [0] b/c we know there's only one row per state and want to unwrap it from the array
		const { State, ...scores } = csvData[index].data.filter((row) => row["State"] == state)[0];

		//* delete state's name from the row of data b/c we don't need it.
		NAEPScores[datasetName] = scores;
	}

	//* get a set of all years from the four different datasets. This is because the datasets don't have all the same years
	var yearLabelsSet = new Set();
	for (const [name, scores] of Object.entries(NAEPScores)) {
		Object.keys(scores).forEach((year) => yearLabelsSet.add(year));
	}
	yearLabels = Array.from(yearLabelsSet);
	yearLabels.sort();

	var newNAEPScores = {};
	for (const [name, scores] of Object.entries(NAEPScores)) {
		const newScores = {};
		for (year of yearLabels) {
			if (scores[year]) newScores[year] = scores[year];
			else newScores[year] = null;
		}
		newNAEPScores[name] = newScores;
	}

	return newNAEPScores;
}
