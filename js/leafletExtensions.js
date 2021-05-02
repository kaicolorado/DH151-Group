L.Legend = L.Control.extend({
	onAdd: function (map) {
		// add reference to mapinstance
		map.legend = this;

		// create container
		var container = L.DomUtil.create("div", "legend-control-container");

		// if content provided
		if (this.options.content) {
			// set content
			container.innerHTML = this.options.content;
		}
		return container;
	},
	onRemove: function (map) {
		// remove reference from mapinstance
		delete map.legend;
	},

	// new method for setting innerHTML
	setContent: function (str) {
		this.getContainer().innerHTML = str;
	},
});

L.Control.Layers.include({
	getOverlays: function () {
		// create hash to hold all layers
		var control, layers;
		layers = {};
		control = this;

		// loop thru all layers in control
		control._layers.forEach(function (obj) {
			var layerName;

			// check if layer is an overlay
			if (obj.overlay) {
				// get name of overlay
				layerName = obj.name;
				// store whether it's present on the map or not
				return (layers[layerName] = control._map.hasLayer(obj.layer));
			}
		});

		return layers;
	},
});
