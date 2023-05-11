<!DOCTYPE html>
<html>
<head>

    <link rel="stylesheet" href="css/index.css">

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">

    <!-- Using jsDelivr -->
<%--    <script src="https://cdn.jsdelivr.net/npm/@xenova/transformers/dist/transformers.min.js"></script>--%>

    <script src="https://code.jquery.com/jquery-3.6.3.min.js" integrity="sha256-pvPw+upLPUjgMXY0G+8O0xUf+/Im1MZjXxxgOcBQBXU=" crossorigin="anonymous"></script>
    <script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>

    <script src="https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js"></script>
    <script src="https://docs.opencv.org/4.7.0/opencv.js"></script>

    <script src="js/data.js"></script>
    <script src="js/index.js"></script>
</head>
<body style="margin: 0;">

<div class="status-indicator">Move the pano to start detecting</div>
<div class="panorama-container">
    <div class="pano-full-width">
        <div class="temp-image-container" style="position: absolute;">

            <%--    "47.6593773,-122.3119228": "1 3045.1277 2125.0132 316.4214 195.9888 0.982079\n" +--%>
            <%--    "1 1566.6554 2161.1392 470.4299 245.3348 0.966422\n" +--%>
            <%--    "2 1107.8909 2085.5659 25.1587 96.9712 0.953752\n" +--%>
            <%--    "0 1704.3602 2251.2012 118.7449 55.5771 0.947889\n" +--%>
            <%--    "1 3823.6924 2119.9055 357.2930 270.0059 0.301928\n" +--%>
            <%--    "2 854.3783 2053.1311 18.7090 43.6367 0.262058"--%>

            <img src="pano-9.jpg" width="100%" style="z-index: 100; position: absolute; height: 100%;" class="abcd">
            <div class="temp-marker" style="position: absolute; top: 2125.0132px; left: 3045.1277px; height: 10px; width: 10px; background: red; z-index: 1000;"></div>
            <div class="temp-marker" style="position: absolute; top: 2161.1392px; left: 1566.6554px; height: 10px; width: 10px; background: red; z-index: 1000;"></div>
            <div class="temp-marker" style="position: absolute; top: 2085.5659px; left: 1107.8909px; height: 10px; width: 10px; background: red; z-index: 1000;"></div>
            <div class="temp-marker" style="position: absolute; top: 2119.9055px; left: 3823.6924px; height: 10px; width: 10px; background: red; z-index: 1000;"></div>
            <div class="temp-marker" style="position: absolute; top: 2251.2012px; left: 1704.3602px; height: 10px; width: 10px; background: red; z-index: 1000;"></div>
        </div>
    </div>
    <div class="object-boundary template">
        <div class="object-boundary-label">
            <div class="object-boundary-label-text"></div>
            <div class="object-boundary-correct">&#x2705;</div>
            <div class="object-boundary-incorrect">&#x274C;</div>
        </div>
    </div>
    <div id="panorama"></div>
    <div class="marker template"></div>
    <div class="overlay"></div>
    <div class="mode-indicator"></div>
    <div class="pano-mid-x"></div>
    <div class="pano-mid-y"></div>


</div>

<div class="dummy-image-container" style="position: absolute; overflow: hidden; pointer-events: none; z-index: -1; visibility: hidden;">
    <img src="" width="100%" height="100%" class="dummy-image" style="top: 0; left: 0;">
    <div class="dummy-marker template"></div>
</div>



<div class="sidebar">
    <div class="sidebar-title">Sidebar</div>
    <div class="sidebar-content">
        <div class="sidebar-section sidebar-section-1">
            <div class="sidebar-section-title">Section 1</div>
            <div class="sidebar-section-content">Content</div>
        </div>
        <div class="sidebar-section sidebar-section-2">
            <div class="sidebar-section-title">Section 2</div>
            <div class="sidebar-section-content">Content</div>
        </div>
        <div class="sidebar-section sidebar-section-3">
            <div class="sidebar-section-title">Section 3</div>
            <div class="sidebar-section-content">Content</div>
        </div>
    </div>
</div>

<div class="actions-toolbar-overlay-container">
    <div class="actions-toolbar-overlay">
        <div class="actions-toolbar">
            <div class="actions-toolbar-item show-labels-toolbar">
                <div class="actions-toolbar-item-icon">

                </div>
                <div class="actions-toolbar-item-text">Label</div>
            </div>
            <div class="actions-toolbar-item save-image">
                <div class="actions-toolbar-item-icon">

                </div>
                <div class="actions-toolbar-item-text">Analyze Image</div>
            </div>
            <div class="actions-toolbar-item previous-location" style="margin-left: 50px;">
                <div class="actions-toolbar-item-icon">

                </div>
                <div class="actions-toolbar-item-text">Previous</div>
            </div>
            <div class="actions-toolbar-item next-location">
                <div class="actions-toolbar-item-icon">

                </div>
                <div class="actions-toolbar-item-text">Next</div>
            </div>

        </div>
    </div>
</div>

<div class="label-toolbar-overlay-container" style="display: none;">
    <div class="label-toolbar-overlay">
        <div class="label-toolbar">
            <div class="label-toolbar-item go-back" >
                <div class="label-toolbar-item-icon">

                </div>
                <div class="label-toolbar-item-text">Back</div>
            </div>
            <div class="label-toolbar-item place-label" data-label-type="signage">
                <div class="label-toolbar-item-icon">

                </div>
                <div class="label-toolbar-item-text">Signage</div>
            </div>
            <div class="label-toolbar-item place-label" data-label-type="boarding-alighting">
                <div class="label-toolbar-item-icon">

                </div>
                <div class="label-toolbar-item-text">Boarding and Alighting</div>
            </div>
            <div class="label-toolbar-item place-label" data-label-type="surface-material">
                <div class="label-toolbar-item-icon">

                </div>
                <div class="label-toolbar-item-text">Surface (Material)</div>
            </div>
            <div class="label-toolbar-item place-label" data-label-type="surface-grade">
                <div class="label-toolbar-item-icon">

                </div>
                <div class="label-toolbar-item-text">Surface (Grade)</div>
            </div>

            <div class="label-toolbar-item stop-labeling">
                <div class="label-toolbar-item-icon">

                </div>
                <div class="label-toolbar-item-text">Done</div>
            </div>
        </div>


    </div>
</div>

<%--<div class="screen-capture">--%>
<%--    Take a screenshot--%>
<%--</div>--%>

<%
    String latLng = request.getParameter("loc");
%>

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

        // const latLng = "47.6327022,-122.2279419";
        // const latLng = "47.6637776,-122.3008794";
        // const latLng = "47.6627831,-122.3008315";
        // const latLng = "47.66853,-122.290514";
        // const latLng = "47.6572767,-122.3046887";
        // const latLng = "47.6539783,-122.3051593";
        // const latLng = "47.6523437,-122.3062897";
        // const latLng = "47.6557727,-122.3120149";
        const latLng = "47.6593773,-122.3119228";

        console.log(latLng.split(',')[0] + ' : ' + latLng.split(',')[1]);

        panorama = new google.maps.StreetViewPanorama(document.getElementById('panorama'), {
                position: {lat: parseFloat(latLng.split(',')[0]), lng: parseFloat(latLng.split(',')[1])},
                pov: {heading: 0, pitch: 0},
                zoom: 1
            }, function () {
                alert("changing pov");
                panorama.setPov(panorama.getPhotographerPov());
            });

        // panorama.addListener("pov_changed", () => {
        //     $('.object-boundary:not(.template)').remove();
        // });
    }
</script>
<script async defer
        src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBmlVct28ooFui9xThE2ZSgugQ9gEI2cZo&callback=initMap">
</script>
</body>
</html>
