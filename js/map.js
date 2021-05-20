// TODO: use https://c0arw235.caspio.com/dp/b7f93000869e5c0fbadf42efabbc,  https://c0arw235.caspio.com/dp/b7f9300090f4ba51c9144867b01f, https://c0arw235.caspio.com/dp/b7f9300062f044d142eb469b83ba?state=California, etc. in map to give more information about each policy

/* ----------------------------- Choices to Make ---------------------------- */

//* change b/w 1 and 0 based on whether you want the Arts Edu policy layers to be single colored or not
const useMonoColorsForArtsEduPolicyLayers = 1;

//* change b/w 1 and 0 based on whether you want to use ClassyBrew colors or custom heatmap colors
const useClassyBrewColors = 0;

/* ---------------------------- Global Variables ---------------------------- */

const csvPaths = [
	csvPath_EducationalSpendingInPublicSchools,
	csvPath_ArtsEducationPolicies,
	csvPath_SP_G4_Math_2019,
	csvPath_SP_G8_Math_2019,
	csvPath_SP_G4_Reading_2019,
	csvPath_SP_G8_Reading_2019,
];

const artsEducationPolicyTitles = [
	"AEP1: Arts as a Core Academic Subject",
	"AEP2: Early Childhood Arts Ed Standards",
	"AEP3: Elementary & Secondary Arts Ed Standards",
	"AEP4: Arts Ed Instructional Requirement - Elementary School",
	"AEP5: Arts Ed Instructional Requirement - Middle School",
	"AEP6: Arts Ed Instructional Requirement - High School",
	"AEP7: Arts Alteratives for High School Graduation",
	"AEP8: Arts Ed Assessment Requirements",
	"AEP9: Arts Ed Requirements for State Accreditation",
	"AEP10: State Arts Ed Grant Program or School for Arts",
];

const scoresLayersTitles = [
	"Standardized Performances - Grade 4 - Math - 2019",
	"Standardized Performances - Grade 8 - Math - 2019",
	"Standardized Performances - Grade 4 - Reading - 2019",
	"Standardized Performances - Grade 8 - Reading - 2019",
];

//* enumeration of all scores layers with their csvPaths index as the value
const scoresEnum = {
	Math_G4_2019: 2,
	Math_G8_2019: 3,
	Reading_G4_2019: 4,
	Reading_G8_2019: 5,
};

var map;
const controls = L.control.layers();
const legend = new L.Legend();

const artsEducationPolicyLayers = [];
const scoresLayers = [];

var statesPolygonsJSON;
var statesCentersJSON;
var layersCorrelationMatrix;

var scoresClassyBrew = {};

const csvData = new Array(csvPaths.length);

let infoPanel = L.control();

// REVIEW: we can either modify the colors of a single layer based on what layers the user selects,
//         or overlay multiple layers, one for each feature.

/* ------------------------------- Initialize ------------------------------- */

$(function () {
	readCSVs();
	createMap();
	createInfoPanel();
	getStatePolygons();
	getStateCenters();
	getCorrelationMatrix();
});
