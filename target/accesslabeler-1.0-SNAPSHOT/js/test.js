$(function() {

    // $('body').text('XYZA');

    initialize();

})

var AVAILABLE_PANORAMAS = {
    grid: {
        location: {
            pano: 'grid',
            description: 'A simple test grid',
            latLng: new google.maps.LatLng(50.5818747, 5.9815603)
        },
        links: [],
        copyright: 'Imagery (c) Martin Matysiak',
        tiles: {
            tileSize: new google.maps.Size(2000, 1000),
            worldSize: new google.maps.Size(2000, 1000),
            centerHeading: 0,
            getTileUrl: function() { return 'grid.png' }
        }
    },
    gileppe: {
        location: {
            pano: 'gileppe',
            description: 'Lac de la Gileppe',
            latLng: new google.maps.LatLng(50.5818747, 5.9815603)
        },
        links: [],
        copyright: 'Imagery (c) Martin Matysiak',
        tiles: {
            tileSize: new google.maps.Size(4000, 2000),
            worldSize: new google.maps.Size(4000, 2000),
            centerHeading: 0,
            getTileUrl: function() { return 'gileppe.jpg' }
        }
    }
};

function init() {
    var container = document.getElementById('map');

    var panorama = new google.maps.StreetViewPanorama(
        container,
        {
            pano: 'gileppe',
            pov: {heading: 47.11, pitch: -13.1},
            panoProvider: function(pano) { return AVAILABLE_PANORAMAS[pano]; }
        });

    var marker = new PanoMarker(
        {
            pano: panorama,
            container: container,
            position: {heading: 89.63, pitch: -27.22},
            anchor: new google.maps.Point(20,20),
            size: new google.maps.Size(40,40),
            icon: 'info.png',
            title: 'Click me!'
        });

    google.maps.event.addListener(marker, 'click', function() {
        alert('That\'s my bike!');
    });
}

function initialize() {
    const fenway = { lat: 42.345573, lng: -71.098326 };
    const map = new google.maps.Map(document.getElementById("map"), {
        center: fenway,
        zoom: 14,
    });
    let panorama = new google.maps.StreetViewPanorama(
        document.getElementById("pano"),
        {
            position: fenway,
            pov: {
                heading: 100,
                pitch: 10,
            },
            panoProvider: function(pano) { return AVAILABLE_PANORAMAS[pano]; }
        },
    );

    map.setStreetView(panorama);
    window.panorama = panorama;

    var marker = new PanoMarker(
        {
            pano: panorama,
            position: {heading: 100, pitch: 10},
            anchor: new google.maps.Point(20,20),
            size: new google.maps.Size(40,40),
            icon: '../info.png',
            title: 'Click me!'
        });

    google.maps.event.addListener(marker, 'click', function() {
        alert('That\'s my bike!');
    });

    // // Create the initial InfoWindow.
    // let infoWindow = new google.maps.InfoWindow({
    //     content: "Click the map to get Lat/Lng!",
    //     position: fenway,
    // });
    //
    // infoWindow.open(map);
    // // Configure the click listener.
    // map.addListener("click", (mapsMouseEvent) => {
    //     // Close the current InfoWindow.
    //     infoWindow.close();
    //     // Create a new InfoWindow.
    //     infoWindow = new google.maps.InfoWindow({
    //         position: mapsMouseEvent.latLng,
    //     });
    //     infoWindow.setContent(
    //         JSON.stringify(mapsMouseEvent.latLng.toJSON(), null, 2)
    //     );
    //     infoWindow.open(map);
    //
    //     const busMarker = new google.maps.Marker({
    //         position: mapsMouseEvent.latLng,
    //         map,
    //         icon: "https://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=bus|FFFF00",
    //         title: "Bus Stop",
    //     });
    //
    //     panorama = map.getStreetView();
    //     panorama.setPosition({lat: panorama.getLocation().latLng.lat(), lng: panorama.getLocation().latLng.lng()});
    //     panorama.setPov({
    //         heading: panorama.getPov().heading,
    //         pitch: panorama.getPov().pitch
    //     });
    //
    //     panorama.setVisible(true);
    //
    // });

    // var depthLoader = new GSVPANO.PanoDepthLoader();
    //
    // depthLoader.onDepthLoad = function() {
    //
    //     // Returns depth map in the following format:
    //     //
    //     // this.depthMap.width: width of depth map in pixels
    //     // this.depthMap.height: height of depth map in pixels
    //     // this.depthMap.depthMap: Float32Array of size width*height that contains the depth at each pixel
    //     console.log(this.depthMap);
    //
    // };
    //
    // depthLoader.load(new google.maps.LatLng(42.345573, -71.098326));
}

window.initialize = initialize;

// function init() {
//     var _panoLoader = new GSVPANO.PanoLoader({zoom: 1});
//     var _depthLoader = new GSVPANO.PanoDepthLoader();
//
//     _depthLoader.onDepthLoad = function() {
//         var x, y, canvas, context, image, w, h, c;
//
//         canvas = document.createElement("canvas");
//         context = canvas.getContext('2d');
//
//         w = this.depthMap.width;
//         h = this.depthMap.height;
//
//         canvas.setAttribute('width', w);
//         canvas.setAttribute('height', h);
//
//         image = context.getImageData(0, 0, w, h);
//
//         for(y=0; y<h; ++y) {
//             for(x=0; x<w; ++x) {
//                 c = this.depthMap.depthMap[y*w + x] / 50 * 255;
//                 image.data[4*(y*w + x)    ] = c;
//                 image.data[4*(y*w + x) + 1] = c;
//                 image.data[4*(y*w + x) + 2] = c;
//                 image.data[4*(y*w + x) + 3] = 255;
//             }
//         }
//
//         context.putImageData(image, 0, 0);
//
//         gDepthMap = this.depthMap;
//
//         document.body.appendChild(canvas);
//     }
//
//     _panoLoader.onPanoramaLoad = function() {
//         document.body.appendChild(this.canvas);
//         _depthLoader.load(this.panoId);
//     };
//
//     _panoLoader.load(new google.maps.LatLng(42.345601, -71.098348));
// }

// window.onload = init;
