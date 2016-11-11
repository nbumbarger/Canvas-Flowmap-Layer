require([
  'Canvas-Flowline-Layer/jsapi3/CanvasFlowlineLayer',

  'esri/layers/CSVLayer',
  'esri/map',

  'local-resources/config',

  'dojo/domReady!'
], function(
  CanvasFlowlineLayer,

  CSVLayer,
  Map,

  config
) {
  var map = new Map('map', {
    basemap: 'dark-gray-vector',
    center: [0, 0],
    zoom: 1
  });

  map.on('load', function() {
    var cityToCityLayer = new CanvasFlowlineLayer({
      // JSAPI GraphicsLayer constructor properties
      id: 'cityToCityLayer',
      visible: true,
      // CanvasFlowlineLayer custom constructor properties
      // required
      originAndDestinationFieldIds: config.cityToCityLayer.originAndDestinationFieldIds,
      // optional
      // pathProperties: config.cityToCityLayer.pathProperties,
      pathDisplayMode: 'selection' // 'selection' or 'all'
    });

    map.addLayer(cityToCityLayer);

    // NOTE: the CSVLayer is only used now to fetch and parse the CSV data
    // we could have also used a library like D3js to load the CSV data
    var csvData = new CSVLayer('../../csv/Flowline_Cities_one_to_many.csv', {
      fields: config.cityToCityLayer.csvAttributeDefinitions,
      outFields: config.cityToCityLayer.csvAttributeDefinitions.map(function(attrDef) {
        return attrDef.name;
      }),
      latitudeFieldName: 's_lat',
      longitudeFieldName: 's_lon'
    });

    map.addLayer(csvData);

    csvData.on('update-end', function() {
      if (csvData.graphics.length) {
        // remove the temporary CSVLayer from the map,
        // since we're done parsing the CSV data into Esri graphics
        map.removeLayer(csvData);

        // add all graphics to the canvas flowline layer
        cityToCityLayer.addGraphics(csvData.graphics);
      }
    });

    cityToCityLayer.on('click', function(evt) {
      // evt.sharedOriginGraphics: array of all ORIGIN graphics with the same ORIGIN ID field
      // evt.sharedDestinationGraphics: array of all ORIGIN graphics with the same DESTINATION ID field
      //  - you can mark shared origin or destination graphics as selected for path display using these modes:
      //    - 'SELECTION_NEW', 'SELECTION_ADD', or 'SELECTION_SUBTRACT'
      //  - these selected graphics inform the canvas flowline layer which flow line paths to display

      // NOTE: if the layer's pathDisplayMode was originally set to "all",
      // this manual selection will override the displayed flowlines
      if (evt.sharedOriginGraphics.length) {
        cityToCityLayer.selectGraphicsForPathDisplay(evt.sharedOriginGraphics, 'SELECTION_NEW');
      }
      if (evt.sharedDestinationGraphics.length) {
        cityToCityLayer.selectGraphicsForPathDisplay(evt.sharedDestinationGraphics, 'SELECTION_NEW');
      }
    });

    // layer visibility and map add/remove tests

    // map.on('click', function() {
    //   cityToCityLayer.hide();
    //   setTimeout(function() {
    //     cityToCityLayer.show();
    //   }, 5000);
    // });

    // map.on('click', function() {
    //   map.removeLayer(cityToCityLayer);
    //   setTimeout(function() {
    //     map.addLayer(cityToCityLayer);
    //   }, 5000);
    // });

  });

});
