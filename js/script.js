// Variables
var map = {};
var listener = {};
var data = [];

// Load map
LoadMap = function()
{
	var center = SMap.Coords.fromWGS84(16.5460277, 49.1489653);
	map = new SMap(JAK.gel("map"), center, 12);
	map.addDefaultLayer(SMap.DEF_TURIST).setTrail(true).setBike(true).enable();
					
	// Add listener
	listener = map.getSignals().addListener(window, "tileset-load", EventHandler);

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
	// Add proper link to map on MAPY.CZ
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
		
		listener = map.getSignals().addListener(window, "card-open", EventHandler);
		listener = map.getSignals().addListener(window, "map-redraw", EventHandler);
		listener = map.getSignals().addListener(window, "zoom-stop", EventHandler);
		
		// Show loader
		JAK.DOM.removeClass(JAK.gel("loader"), "hidden");
		// Get GPX
		GPXRequest();
	}
	
	if (e.type == "card-open")
	{
		var obj = e.target;
		var objHId = obj.getHeader().innerHTML;
		var objBId = obj.getBody().innerHTML;

		if ((typeof parseInt(objHId) === 'number') && objHId == objBId)
		{
			var objData = data[objHId];

			// Load data on demand
			obj.getHeader().innerHTML = objData.Header;
			obj.getBody().innerHTML = objData.Body;
		}
	}
	
	if (e.type == "zoom-stop")
	{
		if (map._zoom > 12)
		{
			$('g').addClass('zoomed');
		}
		else
		{
			$('g').removeClass('zoomed');
		}
	}
	
	if (e.type == "map-redraw")
	{
		// Add event listener
		$('g polyline').on('click', function(event) {
			$(this).css('stroke-width', '10px');
		});
	}
};

// GPX request
GPXRequest = function()
{
	// Create AJAX request
	var xhr = new JAK.Request(JAK.Request.XML);
	
	// Set callback
	xhr.setCallback(function (xmlData) {
		var gpx = new SMap.Layer.GPX(xmlData, null, { maxPoints:5000, colors:["rgba(255, 0, 0, 0.75)", "rgba(0, 255, 0, 0.75)"] });
		
		map.addLayer(gpx);
		// Hide loader
		JAK.DOM.addClass(JAK.gel("loader"), "hidden");
		// If you want to unhide whole map
		//JAK.DOM.removeClass(JAK.gel("map"), "hidden");
		gpx.enable();
		gpx.fit();
		
		// Markers and Cards
		DataRequest();
	});
	
	// Send request
	xhr.send("routes/route.gpx");
};

// Markers and Cards loader
DataRequest = function()
{
	// Create AJAX request
	var xhr = new JAK.Request(JAK.Request.TEXT);

	// Set callback
	xhr.setCallback(function (jsonData)
	{
		data = JSON.parse(jsonData);

		var markers = [];

		for (var i = 0; i < data.length; i++) {
			// Get object
			var obj = data[i];
			
			var c = SMap.Coords.fromWGS84(obj.Coord);
			var options = {
				url: obj.Icon,
				title: obj.Title,
				anchor: { left: 11, bottom: 11 }
			}
			
			var marker = new SMap.Marker(c, null, options);
					
			// Card
			var card = new SMap.Card();
			// Header
			card.getHeader().innerHTML = i;
			// Body
			card.getBody().innerHTML = i;

			// Add card to marker
			marker.decorate(SMap.Marker.Feature.Card, card);
			
			markers.push(marker);
		}
		
		var markerLayer = new SMap.Layer.Marker();
		map.addLayer(markerLayer);                
		markerLayer.enable();                     
		
		for (var j = 0; j < markers.length; j++) {
			markerLayer.addMarker(markers[j]);
		}	
	});

	// Send request
	xhr.send("js/data.json");
};

// Asynchronnous map load
Loader.async = true;
Loader.load(null, { poi:true }, LoadMap);