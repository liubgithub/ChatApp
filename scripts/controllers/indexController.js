define(['controllers'], function (controllers) {
    controllers.controller('indexController', ['$scope', '$location', function ($scope, $location) {
        var map = new ol.Map({
            layers: [
              new ol.layer.Tile({
                  source: new ol.source.OSM()
              }),
              new ol.layer.Tile({
                  source: new ol.source.TileArcGISRest({
                      url: "http://localhost:6080/arcgis/rest/services/files1/hainan/MapServer"
                  })
              })
            ],
            renderer: 'canvas',
            target: 'map',
            view: new ol.View({
                center: ol.proj.fromLonLat([121.1, 37.5]),
                zoom: 6,
                minZoom:4
            })
        });
    }]);
});