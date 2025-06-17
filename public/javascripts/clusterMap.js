maptilersdk.config.apiKey = maptilerApiKey;

var clusterMap = new maptilersdk.Map({
    container: 'clusterMap',
    zoom: 3,
    center: [-96.05, 36.79],
    style: maptilersdk.MapStyle.DATAVIZ.DARK
});

clusterMap.on('load', function () {
    // add a clustered GeoJSON source for a sample set of earthquakes
    clusterMap.addSource('campgrounds', {
        'type': 'geojson',
        'data': campgrounds,
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    });

    clusterMap.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        paint: {
            // Use step expressions (https://docs.maptiler.com/gl-style-specification/expressions/#step)
            // with three steps to implement three types of circles:
            //   * Blue, 20px circles when point count is less than 100
            //   * Yellow, 30px circles when point count is between 100 and 750
            //   * Pink, 40px circles when point count is greater than or equal to 750
            'circle-color': [
                'step',
                ['get', 'point_count'],
                '#3399ff',
                10,
                '#0066ff',
                30,
                '#0000cc'
            ],
            'circle-radius': [
                'step',
                ['get', 'point_count'],
                15,
                10,
                20,
                30,
                25
            ]
        }
    });

    clusterMap.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
        }
    });

    clusterMap.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'campgrounds',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-color': '#11b4da',
            'circle-radius': 6,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
        }
    });

    // inspect a cluster on click
    clusterMap.on('click', 'clusters', async function (e) {
        const features = clusterMap.queryRenderedFeatures(e.point, {
            layers: ['clusters']
        });
        const clusterId = features[0].properties.cluster_id;
        const zoom = await clusterMap.getSource('campgrounds').getClusterExpansionZoom(clusterId);
        clusterMap.easeTo({
            center: features[0].geometry.coordinates,
            zoom
        });
    });

    // When a click event occurs on a feature in
    // the unclustered-point layer, open a popup at
    // the location of the feature, with
    // description HTML from its properties.
    clusterMap.on('click', 'unclustered-point', function (e) {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const { popUpMarkup } = e.features[0].properties;

        // Ensure that if the map is zoomed out such that
        // multiple copies of the feature are visible, the
        // popup appears over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new maptilersdk.Popup()
            .setLngLat(coordinates)
            .setHTML(
                popUpMarkup
            )
            .addTo(clusterMap);
    });

    clusterMap.on('mouseenter', 'clusters', function () {
        clusterMap.getCanvas().style.cursor = 'pointer';
    });
    clusterMap.on('mouseleave', 'clusters', function () {
        clusterMap.getCanvas().style.cursor = '';
    });
    clusterMap.on('mouseenter', 'unclustered-point', function () {
        clusterMap.getCanvas().style.cursor = 'pointer';
    });
    clusterMap.on('mouseleave', 'unclustered-point', function () {
        clusterMap.getCanvas().style.cursor = '';
    });
});