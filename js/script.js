// Variables
var map = {};
var listener = {};

// Load map
LoadMap = function()
{
	// If hide whole map - hide here
	//JAK.DOM.addClass(JAK.gel("map"), "hidden");

	var center = SMap.Coords.fromWGS84(16.5460277,49.1489653);
	map = new SMap(JAK.gel("map"), center, 12);
	map.addDefaultLayer(SMap.DEF_TURIST).setTrail(true).setBike(true).enable();
					
	// Add listener
	listener = map.getSignals().addListener(window, "*", EventHandler);

	// POI
	var poi = new SMap.Layer.Marker();
	map.addLayer(poi).enable();
	
	// Data provider for POI
	var dataProvider = map.createDefaultDataProvider();
	dataProvider.setOwner(map);
	dataProvider.addLayer(poi);
	dataProvider.setMapSet(SMap.MAPSET_TURIST);
	dataProvider.enable();
	
	// Add controls
	AddControls();
};

// Add controls
AddControls = function()
{
	// Controls
	map.addControl(new SMap.Control.Overview());
	map.addControl(new SMap.Control.Scale(), { left:"8px", bottom:"25px" });
	map.addControl(new SMap.Control.Mouse(SMap.MOUSE_PAN | SMap.MOUSE_WHEEL | SMap.MOUSE_ZOOM));
	map.addControl(new SMap.Control.Keyboard(SMap.KB_PAN | SMap.KB_ZOOM));
	map.addControl(new SMap.Control.Selection(2));
	map.addControl(new SMap.Control.ZoomNotification());

	var zoom = new SMap.Control.Zoom(null, { titles: ["Přiblížit", "Oddálit"], showZoomMenu:false });
	map.addControl(zoom, { right: "2px", top: "10x" });
	var lnt = "Editovat na mapy.cz";
	var lnd = JAK.mel("a", { className: "mapycz-link", href: "https://mapy.cz/s/taGG", target: "_blank", innerHTML: lnt });
	map.getContainer().appendChild(lnd);
};

// Event handler
EventHandler = function(e)
{
	if (e.type == "tileset-load")
	{
		// Remove listener
		map.getSignals().removeListener(listener);					
		// Show loader
		JAK.DOM.removeClass(JAK.gel("loader"), "hidden");
		// Get GPX
		GPXRequest();
	}				
}

// GPX request
GPXRequest = function()
{
	// Create AJAX request
	var xhr = new JAK.Request(JAK.Request.XML);
	
	// Set callback
	xhr.setCallback(function (xmlDoc) {
		var gpx = new SMap.Layer.GPX(xmlDoc, null, { maxPoints:5000, colors:["rgba(0, 76, 140, 0.75)"] });
		map.addLayer(gpx);
		// Hide loader
		JAK.DOM.addClass(JAK.gel("loader"), "hidden");
		JAK.DOM.removeClass(JAK.gel("map"), "hidden");
		gpx.enable();
		gpx.fit();
		console.log(gpx);
		DataRequest();
	});
	
	// Send request
	xhr.send("routes/route.gpx");
}

DataRequest = function() {
	var obrazek = "http://api4.mapy.cz/img/api/marker/drop-red.png";

	var data = [
					{
						"Name": "Sadová 110, Želešice",
						"Coord": "49.1181411N, 16.5774847E",
						"Alt": "Test",
						"Header": "Header",
						"Body": "Body"
					}
				];
	var znacky = [];
	var souradnice = [];

	for (var obj in data) {
		var c = SMap.Coords.fromWGS84(data[obj].Coord); /* Souřadnice značky, z textového formátu souřadnic */
		var options = {
			url:obrazek,
			title:data[obj].Name,
			anchor: {left:10, bottom: 1}  /* Ukotvení značky za bod uprostřed dole */
		}
		
		var znacka = new SMap.Marker(c, null, options);
		souradnice.push(c);
		znacky.push(znacka);
	}
	
	var vrstva = new SMap.Layer.Marker();     /* Vrstva se značkami */
	map.addLayer(vrstva);                          /* Přidat ji do mapy */
	vrstva.enable();                         /* A povolit */
	for (var i=0;i<znacky.length;i++) {
		vrstva.addMarker(znacky[i]);
	}
};

// Asynchronnous map load
Loader.async = true;
Loader.load(null, { poi:true }, LoadMap);