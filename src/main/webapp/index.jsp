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
    <script src="js/labelsDescriptor.js"></script>
    <script src="js/index.js"></script>
</head>
<body style="margin: 0;">


<svg fill="none" xmlns="http://www.w3.org/2000/svg" style="display: none;">

    <symbol id="tick-icon">
        <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="#292D32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
        <path d="M7.75 12L10.58 14.83L16.25 9.17004" stroke="#292D32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
    </symbol>

    <symbol id="close-icon">
        <path id="Vector" d="M9 9L11.9999 11.9999M11.9999 11.9999L14.9999 14.9999M11.9999 11.9999L9 14.9999M11.9999 11.9999L14.9999 9M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
    </symbol>
</svg>



<div class="panorama-container">
    <div class="object-boundary template">
        <div class="object-boundary-label">
            <div class="object-boundary-label-text"></div>
            <div class="object-boundary-correct">
                <svg viewBox="0 0 24 24">
                    <use href="#tick-icon" class="object-boundary-label-icon"></use>
                </svg>
            </div>
            <div class="object-boundary-incorrect">
                <svg viewBox="1 1 22 22">
                    <use href="#close-icon" class="object-boundary-label-icon"></use>
                </svg>
            </div>
        </div>
    </div>
    <div id="panorama"></div>
    <div class="marker template"></div>
    <div class="overlay"></div>
    <div class="mode-indicator"></div>
    <div class="pano-mid-x"></div>
    <div class="pano-mid-y"></div>

    <div class="status-indicator">Move the pano to start detecting</div>


    <%-- Toolbars --%>
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

                <div class="label-toolbar-item place-label template" data-label-type="">
                    <div class="label-toolbar-item-icon">

                    </div>
                    <div class="label-toolbar-item-text"></div>
                </div>

                <%--            <div class="label-toolbar-item place-label" data-label-type="boarding-alighting">--%>
                <%--                <div class="label-toolbar-item-icon">--%>

                <%--                </div>--%>
                <%--                <div class="label-toolbar-item-text">Boarding and Alighting</div>--%>
                <%--            </div>--%>
                <%--            <div class="label-toolbar-item place-label" data-label-type="surface-material">--%>
                <%--                <div class="label-toolbar-item-icon">--%>

                <%--                </div>--%>
                <%--                <div class="label-toolbar-item-text">Surface (Material)</div>--%>
                <%--            </div>--%>
                <%--            <div class="label-toolbar-item place-label" data-label-type="surface-grade">--%>
                <%--                <div class="label-toolbar-item-icon">--%>

                <%--                </div>--%>
                <%--                <div class="label-toolbar-item-text">Surface (Grade)</div>--%>
                <%--            </div>--%>

                <div class="label-toolbar-item stop-labeling">
                    <div class="label-toolbar-item-icon">

                    </div>
                    <div class="label-toolbar-item-text">Done</div>
                </div>
            </div>


        </div>
    </div>
</div>

<div class="dummy-image-container" style="position: absolute; overflow: hidden; pointer-events: none; z-index: -1;">
    <img src="" width="100%" height="100%" class="dummy-image" style="top: 0; left: 0;">
    <div class="dummy-marker template"></div>
</div>

<%--<img src="sv.jpg" width="100%" style="z-index: 100;" class="abcd">--%>

<div class="sidebar">
    <div class="sidebar-title">StreetscapeCV</div>
    <div class="sidebar-content">
        <div class="sidebar-section sidebar-section-1">
            <div class="sidebar-section-title">Stats</div>
            <div class="sidebar-section-content">
                <div class="n-labels-total-wrapper">Total labels: <span class="n-labels-total-count"></span></div>
                <div class="n-labels-correct-wrapper">Correct labels: <span class="n-labels-correct-count"></span></div>
                <div class="n-labels-incorrect-wrapper">Incorrect labels: <span class="n-labels-incorrect-count"></span></div>
            </div>
        </div>
        <div class="sidebar-section sidebar-section-2">
            <div class="sidebar-section-title">Learn</div>
            <div class="sidebar-section-content">
                <div class="learn-tabs-container">
                    <div class="learn-tab learn-tab-1 active">Shelter</div>
                    <div class="learn-tab learn-tab-2">Signage</div>
                    <div class="learn-tab learn-tab-3">Seating</div>
                    <div class="learn-tab learn-tab-3">Trash Can</div>
                </div>
                <div class="learn-more-content shelter">
                    Bus stop shelters play a crucial role in ensuring accessibility for all individuals, regardless of their mobility or special needs. These shelters are designed to provide a safe and comfortable waiting area for passengers, protecting them from inclement weather conditions such as rain, snow, or extreme heat.
                </div>
            </div>
        </div>
<%--        <div class="sidebar-section sidebar-section-3">--%>
<%--            <div class="sidebar-section-title">Section 3</div>--%>
<%--            <div class="sidebar-section-content">Content</div>--%>
<%--        </div>--%>
    </div>
    <div class="toggle-sidebar-button"></div>
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
            $('.object-boundary:not(.template)').remove();
        });
    }
</script>
<script async defer
        src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBmlVct28ooFui9xThE2ZSgugQ9gEI2cZo&callback=initMap">
</script>
</body>
</html>
