

$(function() {

    // Default to fetch all crops of specified category from a dataset.
    // LABEL_DATA: seattle-labelled
    // LABEL_DATA3: seattle-validated
    const START_IDX = 0;
    const N_PANOS_TO_FETCH= LABEL_DATA.length;

    let googleMapsService = null;

    // Enum for all the cities we are handling right now.
    const CITY = {
        SEATTLE: 'seattle',
        ORADELL: 'oradell',
        PITTSBURGH: 'pittsburgh',
        CHICAGO: 'chicago',
    }

    // Enum for label types of crops in the dataset.
    const LABEL_TYPE = {
        OBSTACLE: 'Obstacle',
        SIGNAL: 'Signal',
        CROSSWALK: 'Crosswalk',
        SURFACEPROBLEM: 'SurfaceProblem',
        CURBRAMP: 'CurbRamp',
    }

    // Enum for which dataset the crops are from.
    const DATASET = {
        LABELLED: 'labelled',
        VALIDATED: 'validated',
    }

    // todo: add documentation and clearly and concisely mention what these fields capture. Maybe add a few examples.
    const logData = {
        'datasetName': 'labelData-seattle-labelled.js',
        'experimentID': CITY.ORADELL + '-' + LABEL_TYPE.CURBRAMP + '-' + DATASET.LABELLED,
        'failedPanos': [], // We checked directly that this is expired
        'succeededPanos': [], // Successfully fetched
        'expiredPanos': [], // ProjectSidewalk knows it is expired
        'unknownErrors': [], // Some other error happened
        'repeatPanos': [], // Panos that were already fetched
        'failedPanoCount': 0,
        'succeededPanoCount': 0,
        'expiredPanoCount': 0,
        'unknownErrorCount': 0,
        'repeat': 0,
    }

    // var $panorama = $('#panorama'); // TODO: Check if this is available from the start. What happens if it takes time to load?
    const $panoramaContainer = $('.panorama-container'); // T


    function postLogData() {
        const data = {
            'logData': logData,
            'timestamp': new Date().getTime(),
        };

        const d = {
            'name': 'log-' + logData.experimentID +'.json',
            'data': JSON.stringify(data)
        }

        $.ajax({
            type: 'POST',
            url: 'saveLogs.jsp',
            data: d,
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            success: function (data) {
                console.log('Successfully posted log data to the server.');
            },
            error: function (err) {
                console.log('Error posting log data to the server.');
            }
        });
    }

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

        const canvas = $('.widget-scene canvas')[0];

        d.dir = dir;
        d.b64 = canvas.toDataURL('image/png', 1);

        $.ajax({
            type: "POST",
            url: "saveImage.jsp",
            data: d,
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            success: function(data){
                console.log(data);
            }
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
                zoom: 1,
                showRoadLabels: false,
                linksControl: false,
                clickToGo: false
            }, function () {
                panorama.setPov(panorama.getPhotographerPov());
            });

        googleMapsService = new google.maps.StreetViewService();

    }

    function loadPano(city, labelID, labelTypeID, panoID, pitch, heading, zoom) {

        $.ajax({
            method: 'GET',
            url: 'https://maps.googleapis.com/maps/api/streetview/metadata?pano=' + panoID + '&key=AIzaSyBmlVct28ooFui9xThE2ZSgugQ9gEI2cZo',
            success: function(result) {
                if (result.status == 'ZERO_RESULTS') {
                    // Pano fetch failed because it expired
                    logData.failedPanos.push(city + '-' + labelID);
                    logData.failedPanoCount += 1;

                    console.log('Pano fetch failed because it expired: ' + city + '-' + labelID);

                } else if (result.status == 'UNKNOWN_ERROR') {
                    // Other errors
                    logData.unknownErrors.push(city + '-' + labelID);
                    logData.unknownErrorCount += 1;

                    console.log('Pano fetch failed because of unknown error: ' + city + '-' + labelID);
                } else {
                    panorama.setPano(panoID);
                    panorama.setPov({heading: heading, pitch: pitch, zoom: zoom});
                    logData.succeededPanos.push(city + '-' + labelID);
                    logData.succeededPanoCount += 1;

                    setTimeout(function() {
                        console.log('Saving screenshot for ' + city + '-' + labelID + '-' + labelTypeID + '.png');
                        saveGSVScreenshot('gsv-' + city + '-' + labelID + '-' + labelTypeID + '.png', 'crops-' + city + '-' + labelTypeID);
                    }, 5500);
                }
            }
        })
    }

    init();

    // First we need a promisified setTimeout:
    function delay (ms) {
        return new Promise((resolve,reject) => setTimeout(resolve,ms));
    }

    async function savePanos () {
        for (let i= START_IDX; i < N_PANOS_TO_FETCH; i++) {

            const labelData = LABEL_DATA[i];

            let labelID;
            let labelTypeID;
            let panoID;
            let heading;
            let pitch;
            let zoom;
            let fov;
            let city;
            let expired;

            if (labelData.hasOwnProperty('LabelID')) { // We have data in two formats. This is the old format.
                labelID = labelData.LabelID;
                labelTypeID = labelData.LabelTypeID;
                panoID = labelData.PanoID;
                heading = labelData.Heading;
                pitch = labelData.Pitch;
                zoom = labelData.Zoom;
                fov = labelData.FOV;
                city = labelData.City;
            } else {
                labelID = labelData.label_id;
                labelTypeID = labelData.label_type;
                panoID = labelData.gsv_panorama_id;
                heading = labelData.heading;
                pitch = labelData.pitch;
                zoom = labelData.zoom;
                fov = labelData.fov;
                city = labelData.city;
            }

            // Convert the labelTypeID format in validated dataset to labelled
            if (labelTypeID === 1) {
                labelTypeID = LABEL_TYPE.CURBRAMP;
            }

            // todo: this should be handled better and remove magic strings.
            if ((city !== CITY.ORADELL) || (labelTypeID !== LABEL_TYPE.CURBRAMP)) {
               continue;
            }

            const tempFileNameString = 'gsv-' + city + '-' + labelID + '-' + labelTypeID; // Intentionally not adding the file extension here.

            // Check if we have already fetched this crop. If so, log and skip.
            if (previouslyFetchedPanos.indexOf(tempFileNameString) > -1) {
                console.log('Crops is already fetched: ' + tempFileNameString + '. Skipping.');
                logData.repeatPanos.push(city + '-' + labelID);
                logData.repeat += 1;
                postLogData();
                continue;
            }

            // LABEL_DATA2 is in labelData-seattle-all.js
            for (let j = 0; j < LABEL_DATA2.length; j++) {
                if ((panoID === LABEL_DATA2[j].properties.gsv_panorama_id)) {
                    expired = LABEL_DATA2[j].properties.expired;
                }
            }

            if (expired) {
                logData.expiredPanos.push(city + '-' + labelID);
                logData.expiredPanoCount += 1;
                postLogData();
                continue;
            }

            console.log('Trying to load panorama ' + i + ' of ' + N_PANOS_TO_FETCH + ' with labelID ' + labelID + ' and labelTypeID ' + labelTypeID);

            loadPano(city, labelID, labelTypeID, panoID, pitch, heading, zoom);

            await delay(7000);

            postLogData();
        }

        console.log('Finished fetching crops. ');
    }

    savePanos();

    // loadPano('HgHahHJG2_F61YXdbdGdKw', 0, 300, 1);
})
