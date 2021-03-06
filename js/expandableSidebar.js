var NAEPScoresAllStatesSeries = [];
var NAEPScoresChartYearLabels = [];

function updateCurrentCorrelation() {
	//* get current index (from list of toggleable layers in the top right of the map) of the layer that was passed to this function
	const activeOverlayIndices = getActiveOverlayIndices();

	if (activeOverlayIndices.length != 2 || activeOverlayIndices.includes(0) || activeOverlayIndices.includes(1)) {
		$("#correlation-stats").html(
			/*html*/ `<h4>Please select two policy/scores layers to view correlation data.</h4>`
		);
	} else {
		//* -2 to account for Overall Score and Summary overlays
		const correlation = layersCorrelationMatrix[activeOverlayIndices[0] - 2][activeOverlayIndices[1] - 2];
		if (correlation === null) {
			$("#correlation-stats").html(`<h4 style="font-size: x-large">N/A</h4>`);
		} else {
			$("#correlation-stats").html(`<h4 style="font-size: x-large">${correlation.toFixed(5)}</h4>`);
		}
	}
}

function setExpandableSidebarContent() {
	//* below not needed b/c set in index.html
	// $("#custom-metric-layer").html(`
	// 	<div class="layer-control-item" id="custom-metric">
	// 		<label class="switch">
	// 			<input type="checkbox"">
	// 			<span class="slider round"></span>
	// 			<div class="layer-control-item-text"><p>Overall Score</p></div>
	// 		</label>
	// 	</div>`);

	$("#arts-education-policy-layers").append(/*html*/ `<div class="layer-control-item" id="aep-summary">
			<label class="switch">
				<input type="checkbox" data-layerindex="${0}">
				<span class="slider round"></span>
				<div class="layer-control-item-text"><p>${artsEducationPolicyTitles[0]}</p></div>
			</label>
		</div>
		<hr class="solid-divider">`);

	for (let i = 0; i < 10; i++) {
		$("#arts-education-policy-layers").append(/*html*/ `
			<div class="layer-control-item">
				<label class="switch">
					<input type="checkbox" data-layerindex="${i + 1}">
					<span class="slider round"></span>
					<div class="layer-control-item-text"><p>${artsEducationPolicyTitles[i + 1]}</p></div>
				</label>
			</div>
		`);
	}

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

	$('#custom-metric-layer .layer-control-item input[type="checkbox"]').on("change", function () {
		var checkbox = $(this);

		if (checkbox.is(":checked")) {
			map.addLayer(customMetricLayer);
		} else {
			map.removeLayer(customMetricLayer);
		}
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

function initializeNAEPScoresChartDataChartJS() {
	const stateNames = statesCentersJSON.map((state) => state.state);

	var yearLabelsSet = new Set();
	for (stateName of stateNames) {
		NAEPScores = getYearlyNAEPScoresOfState(stateName);
		var series = [];
		for (const [name, scores] of Object.entries(NAEPScores)) {
			series.push({
				label: NAEPNameEnum[name],
				data: Object.values(scores),
				borderColor: getLineColor(name),
				backgroundColor: getLineColor(name),
				tension: 0.6,
				borderWidth: 5,
				pointBorderWidth: 2,
				segment: {
					borderColor: getLineColor(name),
				},
			});
			Object.keys(scores).forEach((year) => yearLabelsSet.add(year));
		}

		NAEPScoresAllStatesSeries[stateName] = series;
	}

	NAEPScoresChartYearLabels = Array.from(yearLabelsSet);
	NAEPScoresChartYearLabels.sort();
}

function createNAEPScoresChart(state) {
	$("#scores-chart").empty();
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

	var chart = new ApexCharts(document.querySelector("#scores-chart"), options);
	chart.render();
}

function createNAEPScoresChartChartJS(state) {
	$("#chart-js").remove();
	$("#scores-chart").append('<canvas id="chart-js"></canvas>');
	var chartCanvas = $("#chart-js");

	const config = {
		type: "line",
		data: {
			labels: NAEPScoresChartYearLabels,
			datasets: NAEPScoresAllStatesSeries[state],
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			animation: false,
			interaction: {
				intersect: false,
				mode: "index",
			},
			plugins: {
				legend: {
					position: "top",
					labels: {
						boxWidth: 13,
					},
				},
				title: {
					display: true,
					text: `${state}'s National Assessment Scores`,
				},
			},
			scales: {
				x: {
					title: {
						display: true,
						text: "Year",
					},
					grid: {
						display: false,
					},
				},
				y: {
					title: {
						display: true,
						text: "Score",
					},
				},
			},
		},
	};

	var chart = new Chart(chartCanvas, config);
}
