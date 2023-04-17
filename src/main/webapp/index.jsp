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

    <script src="js/index.js"></script>
</head>
<body style="margin: 0;">
<div class="panorama-container">
    <div class="box template"></div>
    <div id="panorama"></div>
    <div class="marker template"></div>
    <div class="overlay"></div>
    <div class="mode-indicator"></div>
    <div class="pano-mid-x"></div>
    <div class="pano-mid-y"></div>
</div>

<div class="dummy-image-container" style="position: absolute; overflow: hidden; pointer-events: none; z-index: -1;">
    <img src="" width="100%" height="100%" class="dummy-image" style="top: 0; left: 0;">
    <div class="dummy-marker template"></div>
</div>

<%--<div class="pano-image">--%>
<%--    <div class="pano-image-marker"></div>--%>
<%--    <img src="sv-2.jpg" width="850px">--%>
<%--</div>--%>

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

        const latLng = "47.5991394,-122.3178654";

        console.log(latLng.split(',')[0] + ' : ' + latLng.split(',')[1]);

        panorama = new google.maps.StreetViewPanorama(
            document.getElementById('panorama'),
        {
                position: {lat: parseFloat(latLng.split(',')[0]), lng: parseFloat(latLng.split(',')[1])},
                pov: {heading: 0, pitch: -10},
                zoom: 1
            }, function () {
                panorama.setPov(panorama.getPhotographerPov());
            });

        panorama.addListener("pov_changed", () => {
            $('.box:not(.template)').remove();
        });
    }
</script>
<script async defer
        src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBmlVct28ooFui9xThE2ZSgugQ9gEI2cZo&callback=initMap">
</script>
</body>
</html>
