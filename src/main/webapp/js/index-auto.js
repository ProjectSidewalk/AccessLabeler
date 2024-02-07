

$(function() {

    // Captures the data and state at a particular 'panorama'.
    // All of these should be reset when the user moves to a new location.
    const currentPanoState = {
        location: '',       // todo: update
        markers: [],        // all markers including the non verified ones.
        verifiedLabels: [], // only verified labels.
    }

    const START_IDX = 0;
    const N_PANOS_TO_FETCH = 0;
    // const N_PANOS_TO_FETCH = LABEL_DATA.length;

    let service = null;

    class failedPano {
        constructor() {
            let panoID = '';
            let labelID = '';
            let errorMessage = '';
        }
    }

    const unknownError = {
        panoID: '',
        labelID: '',
        errorMessage: ''
    }

    const CITY = {
        SEATTLE: 'seattle'
    }

    const LABEL_TYPE = {
        OBSTACLE: 'obstacle',
        SIGNAL: 'signal',
        CROSSWALK: 'crosswalk',
        SURFACEPROBLEM: 'surfaceproblem',
        CURBRAMP: 'curbramp'
    }

    const logData = {
        'datasetName': 'labelData-seattle-labelled.js',
        'experimentID': CITY.SEATTLE + '-' + LABEL_TYPE.SURFACEPROBLEM,
        'failedPanos': [], // We checked directly that this is expired
        'succeededPanos': [], // Successfully fetched
        'expiredPanos': [], // ProjectSidewalk knows it is expired
        'unknownErrors': [], // Some other error happened
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
                zoom: 1,
                showRoadLabels: false,
                linksControl: false,
                clickToGo: false
            }, function () {
                panorama.setPov(panorama.getPhotographerPov());
            });

        service = new google.maps.StreetViewService();

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
                } else if (result.status == 'UNKNOWN_ERROR') {
                    // Other errors
                    logData.unknownErrors.push(city + '-' + labelID);
                    logData.unknownErrorCount += 1;
                } else {
                    panorama.setPano(panoID);
                    panorama.setPov({heading: heading, pitch: pitch, zoom: zoom});
                    logData.succeededPanos.push(city + '-' + labelID);
                    logData.succeededPanoCount += 1;

                    setTimeout(function() {
                        saveGSVScreenshot('gsv-' + city + '-' + labelID + '-' + labelTypeID + '.jpg', 'crops-' + city + '-' + labelTypeID);
                    }, 4500);
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
        // let CurbRamp = 0;
        // let NoCurbRamp = 0;
        // let Obstacle = 0;
        // let SurfaceProblem = 0;
        // let Other = 0;
        // let Occlusion = 0;
        // let NoSidewalk = 0;
        // let Problem = 0;
        // let Crosswalk = 0;
        // let Signal = 0;

        const fs = require("fs");
        let dir_name = "/Users/projectsidewalk-alex/.ps-cv/images/crops-seattle-SurfaceProblem"
        let fetchedSet = fs.readdirSync(dir_name);

        fetchedSet.forEach((file) => {
            console.log("File: ", file);
        })

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

            // if ((labelID != 100644) && (labelID != 100648)) {
            //     continue;
            // }

            if ((labelTypeID != 'SurfaceProblem')) {
               continue;
            }

            // LABEL_DATA2 is in labelData-seattle-all.js
            for (let j = 0; j < LABEL_DATA2.length; j++) {
                if ((panoID == LABEL_DATA2[j].properties.gsv_panorama_id)) {
                    expired = LABEL_DATA2[j].properties.expired;
                }
            }

            if (expired) {
                logData.expiredPanos.push(city + '-' + labelID);
                logData.expiredPanoCount += 1;
                continue;
            }

            console.log('Loading panorama ' + i + ' of ' + N_PANOS_TO_FETCH + ' with labelID ' + labelID + ' and labelTypeID ' + labelTypeID);

            loadPano(city, labelID, labelTypeID, panoID, pitch, heading, zoom);

            await delay(6000);

            postLogData();
        }

        console.log('Finished fetching crops. ');
        // console.log('CurbRamp: ' + CurbRamp + ' ');
        // console.log('NoCurbRamp: ' + NoCurbRamp + ' ');
        // console.log('Obstacle: ' + Obstacle + ' ');
        // console.log('SurfaceProblem: ' + SurfaceProblem + ' ');
        // console.log('Other: ' + Other + ' ');
        // console.log('Occlusion: ' + Occlusion + ' ');
        // console.log('NoSidewalk: ' + NoSidewalk + ' ');
        // console.log('Problem: ' + Problem + ' ');
        // console.log('Crosswalk: ' + Crosswalk + ' ');
        // console.log('Signal: ' + Signal + ' ');
    }
    savePanos();
    // loadPano('HgHahHJG2_F61YXdbdGdKw', 0, 300, 1);
})
