/* ------------------------------- ClassyBrew ------------------------------- */

function initializeClassyBrew() {
	if (useClassyBrewColorsForScores) {
		for (const scores in scoresEnum) {
			scoresClassyBrew[scores] = new classyBrew();
		}

		//* score e.g.: Math_G4_2019, Math_G8_2019, Reading_G4_2019, Reading_G8_2019
		for (const [score, scoresCB] of Object.entries(scoresClassyBrew)) {
			const csvIndex = scoresEnum[score];
			const scores = getScores(csvIndex);

			scoresCB.setSeries(scores);
			scoresCB.setNumClasses(5);
			scoresCB.setColorCode("RdYlGn");
			scoresCB.classify("quantiles");
		}
	}
}

/* ------------------------------ Custom Layer ------------------------------ */

function getCustomMetricStyle(feature, min, max) {
	const stateData = csvData[10].data.find((row) => row.State === feature.properties.NAME);

	if (stateData) {
		const customMetric = parseFloat(stateData["Custom Metric"]);
		// const customMetricAvgd = parseFloat(stateData["Custom Metric Avg'd"]);
		const scaledVal = (customMetric - min) / (max - min);

		const color = d3.interpolatePlasma(scaledVal);

		return {
			fillColor: color,
			fillOpacity: 0.2,
			color: "black",
			weight: 0.3,
		};
	}
}

/* ---------------------- Arts Education Policy Layers ---------------------- */

function getArtsEducationPolicySummaryStyle(feature, index) {
	const stateData = csvData[1].data.find((row) => row.State === feature.properties.NAME);
	if (stateData) {
		const numOfPoliciesImplemented = parseInt(stateData["Total Policies Implemented"]);
		// const percentageOfPoliciesImplemented = stateData["% of Policies Implemented"];
		const percentageOfPoliciesImplemented = numOfPoliciesImplemented * 0.1;

		const colorRGB = d3.interpolateBlues(percentageOfPoliciesImplemented); //* can choose any palette from https://github.com/d3/d3-scale-chromatic

		const colorArr = colorRGB.match(/\d+/g);
		const hsv = RGBtoHSV(colorArr);
		hsv[1] *= 1.2;
		hsv[2] *= 1.4;
		const rgb = HSVtoRGB(hsv);
		const newColorRGB = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;

		return {
			fillColor: newColorRGB,
			fillOpacity: 0.2,
			color: "black",
			weight: 0.3,
		};
	}
}

function getArtsEducationPolicyStyle(feature, index) {
	//* get the state object who's name (e.g. 'Alabama') matches the state name we're mapping now
	const state = csvData[1].data.find((row) => row.State === feature.properties.NAME);

	//* if we found a state from above and the current indexed column's result for that state is 'Yes', we want to give it a color
	if (state && state[Object.keys(state)[index]] === "Yes") {
		return {
			fillColor: getArtsEducationPolicyColor(index),
			fillOpacity: 0.2,
			color: "black",
			weight: 0.3,
		};
	} else {
		return {
			fillColor: "white",
			fillOpacity: 0,
			weight: 0,
			color: "black",
		};
	}
}

function getArtsEducationPolicyStyleMono(feature, index) {
	const state = csvData[1].data.find((row) => row.State === feature.properties.NAME);

	//* if we found a state from above and the current indexed column's result for that state is 'Yes', we want to give it a color
	if (state && state[Object.keys(state)[index]] === "Yes") {
		return {
			fillColor: "#007AFF",
			fillOpacity: 0.2,
			color: "black",
			weight: 0.3,
		};
	} else {
		return {
			fillColor: "white",
			fillOpacity: 0,
			weight: 0,
			color: "black",
		};
	}
}

//* get color based on what art policy we specify (by index)
function getArtsEducationPolicyColor(index) {
	// prettier-ignore
	const fillColor = index == 1  ? "#007AFF" :
					  index == 2  ? "#FF0000" :
					  index == 3  ? "#FFE600" :
					  index == 4  ? "#24FF00" :
					  index == 5  ? "#00FFA3" :
					  index == 6  ? "#DB00FF" :
					  index == 7  ? "#4200FF" :
					  index == 8  ? "#FF7A00" :
					  index == 9  ? "#5E382C" :
					  index == 10 ? "#6F4200" :
					  null;
	return fillColor;
}

/* ------------------------------ Scores Layers ----------------------------- */

function updateScoresLayersStyle() {
	if (getActiveOverlayTitlesArtsEduPolicies().length > 0) {
		scoresLayers.forEach(function (layerGroup) {
			layerGroup.eachLayer(function (layer) {
				layer.setStyle({ fillOpacity: 0 });
			});
		});
	} else {
		scoresLayers.forEach(function (layerGroup) {
			layerGroup.eachLayer(function (layer) {
				if (layer instanceof L.GeoJSON) {
					layer.resetStyle();
				}
			});
		});
	}
}

function getScoresStyle(feature, csvPathsIndex, min, max) {
	const stateData = csvData[csvPathsIndex].data.find((row) => row.Jurisdiction === feature.properties.NAME);

	if (stateData) {
		const scoresKey = Object.keys(csvData[csvPathsIndex].data[0])[1];
		const stateScore = stateData[scoresKey];

		var fillColor;
		if (useClassyBrewColorsForScores) {
			const enumKey = Object.keys(scoresEnum).find((key) => scoresEnum[key] === csvPathsIndex);
			fillColor = scoresClassyBrew[enumKey].getColorInRange(stateScore);
		} else if (useD3Colors) {
			const scaledVal = (stateScore - min) / (max - min);
			const colorRGB = d3.interpolatePlasma(scaledVal); //* can choose any palette from https://github.com/d3/d3-scale-chromatic
			fillColor = colorRGB;
		} else {
			const scaledVal = (stateScore - min) / (max - min);
			const colorHSL = getHeatmapColorFromValue(scaledVal);
			const colorHex = hslToHex(colorHSL.hue, colorHSL.saturation, colorHSL.luminance);
			fillColor = colorHex;
		}

		return {
			fillColor: fillColor,
			fillOpacity: 0.4,
			color: "black",
			weight: 0.3,
		};
	}
}

//* `value` must be from 0 to 1
function getHeatmapColorFromValue(value) {
	var h = (1.0 - value) * 240;
	return { hue: h, saturation: 100, luminance: 50 };
}

function hslToHex(h, s, l) {
	l /= 100;
	const a = (s * Math.min(l, 1 - l)) / 100;
	const f = (n) => {
		const k = (n + h / 30) % 12;
		const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
		return Math.round(255 * color)
			.toString(16)
			.padStart(2, "0"); // convert to Hex and prefix "0" if needed
	};
	return `#${f(0)}${f(8)}${f(4)}`;
}

/* ---------------------------- NAEP Scores Chart --------------------------- */

function getLineColor(datasetName) {
	switch (datasetName) {
		case Object.keys(NAEPNameEnum)[0]:
			return "red";
		case Object.keys(NAEPNameEnum)[1]:
			return "orange";
		case Object.keys(NAEPNameEnum)[2]:
			return "blue";
		case Object.keys(NAEPNameEnum)[3]:
			return "green";
		default:
			break;
	}
}

RGBtoHSV = function (color) {
	var r, g, b, h, s, v;
	r = color[0];
	g = color[1];
	b = color[2];
	min = Math.min(r, g, b);
	max = Math.max(r, g, b);

	v = max;
	delta = max - min;
	if (max != 0) s = delta / max;
	else {
		s = 0;
		h = -1;
		return [h, s, undefined];
	}
	if (r === max) h = (g - b) / delta;
	else if (g === max) h = 2 + (b - r) / delta;
	else h = 4 + (r - g) / delta;
	h *= 60;
	if (h < 0) h += 360;
	if (isNaN(h)) h = 0;
	return [h, s, v];
};

HSVtoRGB = function (color) {
	var i;
	var h, s, v, r, g, b;
	h = color[0];
	s = color[1];
	v = color[2];
	if (s === 0) {
		r = g = b = v;
		return [r, g, b];
	}
	h /= 60;
	i = Math.floor(h);
	f = h - i;
	p = v * (1 - s);
	q = v * (1 - s * f);
	t = v * (1 - s * (1 - f));
	switch (i) {
		case 0:
			r = v;
			g = t;
			b = p;
			break;
		case 1:
			r = q;
			g = v;
			b = p;
			break;
		case 2:
			r = p;
			g = v;
			b = t;
			break;
		case 3:
			r = p;
			g = q;
			b = v;
			break;
		case 4:
			r = t;
			g = p;
			b = v;
			break;
		default:
			r = v;
			g = p;
			b = q;
			break;
	}
	return [r, g, b];
};
