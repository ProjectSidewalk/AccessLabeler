

$(function() {

    // Captures the data and state at a particular 'panorama'.
    // All of these should be reset when the user moves to a new location.
    const currentPanoState = {
        location: '',       // todo: update
        markers: [],        // all markers including the non verified ones.
        verifiedLabels: [], // only verified labels.
    }


    const START_IDX = 99;
    const N_PANOS_TO_FETCH = 2000;

    // var $panorama = $('#panorama'); // TODO: Check if this is available from the start. What happens if it takes time to load?
    const $panoramaContainer = $('.panorama-container'); // T

    function saveGSVScreenshot(name, dir) {

        $panoramaContainer.css('outline', '10px solid goldenrod');
        setTimeout(function() {
            $panoramaContainer.css('outline', 'none');
        }, 800);

        // Saves a screenshot of the GSV to the server with the name gsv-<panoID>-<timestamp>.jpg
        // Pano ID will help us trace back to the panorama if needed.
        const d = {
            'name': name
        }

        // Save a high-res version of the image.
        html2canvas($('.widget-scene-canvas')[0]).then(canvas => {

            d.dir = dir;
            d.b64 = canvas.toDataURL('image/jpeg', 1);

            $.ajax({
                type: "POST",
                url: "saveImage.jsp",
                data: d,
                contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                success: function(data){
                    console.log(data);
                }
            });
        });
    }

    function init() {
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
                position: {lat: 37.869224495225126, lng: -122.25510802860369},
                pov: {heading: 0, pitch: 0},
                zoom: 1
            }, function () {
                panorama.setPov(panorama.getPhotographerPov());
            });
    }

    function loadPano(panoID, pitch, heading, zoom) {

        panorama.setPano(panoID);
        panorama.setPov({heading: heading, pitch: pitch, zoom: zoom});
    }

    init();

    // First we need a promisified setTimeout:
    function delay (ms) {
        return new Promise((resolve,reject) => setTimeout(resolve,ms));
    }

    async function savePanos () {
        for (let i= START_IDX; i < N_PANOS_TO_FETCH; i++){

            const labelData = LABEL_DATA[i];
            const labelID = labelData.LabelID;
            const labelTypeID = labelData.LabelTypeID;
            const panoID = labelData.PanoID;
            const heading = labelData.Heading;
            const pitch = labelData.Pitch;
            const zoom = labelData.Zoom;
            const fov = labelData.FOV;
            const city = labelData.City;

            console.log('Loading panorama ' + i + ' of ' + N_PANOS_TO_FETCH + ' with labelID ' + labelID + ' and labelTypeID ' + labelTypeID);

            loadPano(panoID, pitch, heading, zoom);

            setTimeout(function() {
                saveGSVScreenshot('gsv-' + city + '-' + labelID + '-' + labelTypeID + '.jpg', 'crops-' + city);
            }, 4000);

            await delay(4500);
        }
    }
    savePanos();
})
