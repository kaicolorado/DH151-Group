var NAEPScoresAllStatesSeries = [];
var NAEPScoresChartYearLabels = [];

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

/**
 * NAEPScoresAllStatesSeries {
 * 		California: [
 * 			{
 * 				name: Math_G4,
 * 				data: [276, 255, ...]
 * 			},
 * 			{
 * 				name: Math_G8,
 * 				data: [244, 255, ...]
 * 			},
 * 			...
 * 		],
 * 		Alabama: [...]
 * 		...
 * }
 */
function initializeNAEPScoresChartData() {
	const stateNames = statesCentersJSON.map((state) => state.state);

	var yearLabelsSet = new Set();
	for (stateName of stateNames) {
		NAEPScores = getYearlyNAEPScoresOfState(stateName);
		// NAEPScoresAllStatesSeries[stateName] = getYearlyNAEPScoresOfState(stateName);
		var series = [];
		for (const [name, scores] of Object.entries(NAEPScores)) {
			series.push({ name: NAEPNameEnum[name], data: Object.values(scores) });
			Object.keys(scores).forEach((year) => yearLabelsSet.add(year));
		}

		NAEPScoresAllStatesSeries[stateName] = series;
	}

	NAEPScoresChartYearLabels = Array.from(yearLabelsSet);
	NAEPScoresChartYearLabels.sort();
}

function createNAEPScoresChart(state) {
	$("#naep-scores-chart").empty();
	var options = {
		series: NAEPScoresAllStatesSeries[state],
		chart: {
			animations: {
				enabled: false,
				easing: "easeinout",
				speed: 400,
				animateGradually: {
					enabled: false,
					delay: 150,
				},
				dynamicAnimation: {
					enabled: true,
					speed: 350,
				},
			},
			height: 350,
			type: "line",
			// dropShadow: {
			// 	enabled: true,
			// 	color: "#000",
			// 	top: 18,
			// 	left: 7,
			// 	blur: 10,
			// 	opacity: 0.2,
			// },
			toolbar: {
				show: false,
			},
			zoom: {
				enabled: false,
			},
		},
		// colors: ["#77B6EA", "#545454"],
		// dataLabels: {
		// 	enabled: true,
		// },
		stroke: {
			curve: "smooth",
		},
		title: {
			text: `${state}'s National Assessment Scores`,
			align: "center",
			// margin: 40,
		},
		// grid: {
		// 	borderColor: "#e7e7e7",
		// 	row: {
		// 		colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
		// 		opacity: 0.5,
		// 	},
		// },
		markers: {
			size: 0,
		},
		xaxis: {
			categories: NAEPScoresChartYearLabels,
			labels: {
				maxHeight: 50,
			},
			title: {
				text: "Year",
			},
		},
		yaxis: {
			title: {
				text: "Score",
			},
			forceNiceScale: true,
			decimalsInFloat: 0,
		},
		legend: {
			position: "top",
			horizontalAlign: "left",
			floating: false,
		},
	};

	const startTime = performance.now();
	var chart = new ApexCharts(document.querySelector("#naep-scores-chart"), options);
	chart.render();

	const duration = performance.now() - startTime;
	console.log(`someMethodIThinkMightBeSlow took ${duration}ms`);
}
