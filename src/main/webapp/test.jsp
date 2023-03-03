<!DOCTYPE html>
<html>
<head>

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">

    <style>


        .panorama-container {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            height: 100vh;
            width: 100vw;
            transition: all 0.1s;
        }

        #panorama { height: 100%; width: 100%; }

        .panorama-container.half-size {
            width: 60vw;
            height: 70vh;
            /*transform: none;*/
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
        }

        .marker {
            height: 30px;
            width: 30px;
            position: absolute;
            top: -50px;
            left: -50px;
            transform: translate(-50%, -50%);
            background: crimson;
            border-radius: 50%;
            z-index: 1;
            border: 3px solid crimson;
        }

        .mode-indicator {
            position: absolute; height: 100%; width: 100%; top: 0; left: 0; z-index: 2; pointer-events: none; border: 5px solid red; box-sizing: border-box;
        }

        .pano-mid-x {
            position: absolute; height: 100%; width: 1px;  background: crimson; left: 50%; transform: translateX(-50%); top: 0; z-index: 2;

            display: none;
        }

        .pano-mid-y {
            position: absolute; height: 1px; width: 100%;  background: crimson; top: 50%; transform: translateY(-50%); left: 0; z-index: 2;

            display: none;
        }

        .pano-image {
            position: relative; width: fit-content;

            display: none;
        }
        .pano-image-marker { position: absolute; height: 10px; width: 10px;  background: crimson;
            left: 50%; top: 50%; transform: translate(-50%, -50%);
        }

        .dummy-marker { position: absolute; height: 30px; width: 30px; background: red; border-radius: 50%; transform: translate(-50%, -50%); }

        .overlay { position: absolute; height: 100%; width: 100%; top: 0; left: 0; z-index: 2; }

        .screen-capture { position: absolute; bottom: 0; height: 50px; display: flex; align-content: center; justify-content: center; background: burlywood; width: 100%; padding: 10px; cursor: pointer; }
    </style>

    <script src="https://code.jquery.com/jquery-3.6.3.min.js"
            integrity="sha256-pvPw+upLPUjgMXY0G+8O0xUf+/Im1MZjXxxgOcBQBXU=" crossorigin="anonymous"></script>

    <script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>

    <script src="js/test.js"></script>
</head>
<body style="margin: 0;">
<div class="panorama-container half-size">
    <div id="panorama"></div>
    <div class="marker"></div>
    <div class="overlay"></div>
    <div class="mode-indicator"></div>
    <div class="pano-mid-x"></div>
    <div class="pano-mid-y"></div>
</div>

<div class="dummy-image-container" style="position: absolute; overflow: hidden; pointer-events: none; z-index: -1;">
    <img src="" width="100%" height="100%" class="dummy-image" style="top: 0; left: 0;">
    <div class="dummy-marker"></div>
</div>

<div class="pano-image">
    <div class="pano-image-marker"></div>
    <img src="sv-2.jpg" width="850px">
</div>

<div class="screen-capture">
    Take a screenshot
</div>

<script>
    var panorama;
    function initMap() {

        HTMLCanvasElement.prototype.getContext = function(origFn) {
            return function(type, attributes) {
                if (type === 'webgl') {
                    attributes = Object.assign({}, attributes, {
                        preserveDrawingBuffer: true,
                    });
                }
                return origFn.call(this, type, attributes);
            };
        }(HTMLCanvasElement.prototype.getContext);

        panorama = new google.maps.StreetViewPanorama(
            document.getElementById('panorama'),
            {
                position: {lat: 37.86919356787275, lng: -122.2553389429576},
                pov: {heading: 0, pitch: 0},
                zoom: 1
            }, function () {
                panorama.setPov(panorama.getPhotographerPov());
            });
    }
</script>
<script async defer
        src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBmlVct28ooFui9xThE2ZSgugQ9gEI2cZo&callback=initMap">
</script>
</body>
</html>
