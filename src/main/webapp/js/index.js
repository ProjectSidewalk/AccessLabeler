function get(name){
    if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
        return decodeURIComponent(name[1]);
}

const preprocessedData = {
    "47.6445637,-122.1338495": "1 0.844832 0.528247 0.0409932 0.0779043 0.905118",
    "47.6617177,-122.3119481": "1 0.704584 0.557155 0.0937297 0.162071 0.971062\n" +
        "2 0.625372 0.47812 0.0085063 0.0308385 0.935331\n" +
        "0 0.704038 0.60406 0.0334666 0.0338287 0.881437\n" +
        "1 0.110114 0.512956 0.014253 0.0334913 0.874534\n" +
        "1 0.774341 0.553502 0.0763234 0.15143 0.700532\n" +
        "2 0.017272 0.492008 0.00255307 0.0203148 0.44772",
    "47.6614376,-122.311893": "1 0.314481 0.52349 0.0318004 0.0521871 0.942006\n" +
        "2 0.566586 0.473667 0.00286376 0.0110221 0.26537",
    "47.6612187,-122.309051": "2 0.892311 0.474349 0.00912595 0.0317016 0.973872\n" +
        "2 0.794235 0.43317 0.00289714 0.0109044 0.651111\n" +
        "2 0.998317 0.500629 0.00299597 0.0167363 0.339307\n" +
        "1 0.261304 0.583681 0.102752 0.0818565 0.328842",
    "47.6667318,-122.3006722": "1 0.260474 0.533033 0.0435681 0.0670648 0.572756\n" +
        "2 0.0640385 0.491526 0.00577632 0.0140014 0.307124\n",
    "47.6685445,-122.3011362": "2 0.70106 0.483035 0.00300193 0.0286064 0.936708\n" +
        "1 0.678225 0.538608 0.052788 0.098722 0.913397\n" +
        "0 0.677509 0.574488 0.021471 0.0225077 0.680679\n",
    "47.6681388,-122.3065174": "2 0.161302 0.492935 0.00342825 0.0197073 0.79902",
    "47.6649327,-122.3111553": "2 0.541395 0.476251 0.00693059 0.022861 0.969058\n" +
        "2 0.555518 0.486218 0.00254405 0.0136079 0.404816",
    "47.6593773,-122.3119228": "1 3045.1277 2125.0132 316.4214 195.9888 0.982079\n" +
        "1 1566.6554 2161.1392 470.4299 245.3348 0.966422\n" +
        "2 1107.8909 2085.5659 25.1587 96.9712 0.953752\n" +
        "0 1704.3602 2251.2012 118.7449 55.5771 0.947889\n" +
        "1 3823.6924 2119.9055 357.2930 270.0059 0.301928\n" +
        "2 854.3783 2053.1311 18.7090 43.6367 0.262058"
    // "47.6593773,-122.3119228": "1 4096 2048 100 100 1\n" +
    //     "1 3045.1277 2125.0132 316.4214 195.9888 0.982079"
    // "47.6593773,-122.3119228": "1 2048 2048 100 100 1"
}

function convertXYtoYawPitch(xPercentage, yPercentage) {
    const yaw = xPercentage * 360;
    const pitch = (yPercentage - 0.5) * -180;
    return {heading: yaw, pitch: pitch};
}

$(function() {
    let isMouseDown = false;

    let isMarking = false;

    let currentLabelType = null;

    var $markers = $('.marker');
    var $panorama = $('#panorama');
    const $fullWidthPano = $('.pano-full-width');

    let startTime = null;
    let endTime = null;

    let dataIDX = get('idx') ? get('idx') : 250;

    const worker = new Worker('js/worker.js');

    const $panoContainer = $('.panorama-container');

    const panoImageHeight = 4096;
    const panoImageWidth = 8192;

    const panoImageScale = ($panoContainer.height()/panoImageHeight);

    const markerOffset = 5;
    const markerSize = 10;


    const LABEL_TYPES = {
        0: 'Seating',
        1: 'Shelter',
        2: 'Signage'
    }

    let areBoxesDrawn = false;

    const dummyBox = {
        bounding: [60.79486846923828, 222.09311096191405, 152.9200897216797, 89.72289733886718],
        label: 1,
        probability: 0.9720821380615234
    }

    /**
     * Calculates heading and pitch for a Google Maps marker using (x, y) coordinates
     * From PanoMarker spec
     * @param canvas_x          X coordinate (pixel) of the label
     * @param canvas_y          Y coordinate (pixel) of the label
     * @param canvas_width      Original canvas width
     * @param canvas_height     Original canvas height
     * @param zoom              Original zoom level of the label
     * @param heading           Original heading of the label
     * @param pitch             Original pitch of the label
     * @returns {{heading: float, pitch: float}}
     */
    function getPosition(canvas_x, canvas_y, canvas_width, canvas_height, zoom, heading, pitch) {
        function sgn(x) {
            return x >= 0 ? 1 : -1;
        }

        let PI = Math.PI;
        let cos = Math.cos;
        let sin = Math.sin;
        let tan = Math.tan;
        let sqrt = Math.sqrt;
        let atan2 = Math.atan2;
        let asin = Math.asin;
        let fov = _get3dFov(zoom) * PI / 180.0;
        let width = canvas_width;
        let height = canvas_height;
        let h0 = heading * PI / 180.0;
        let p0 = pitch * PI / 180.0;
        let f = 0.5 * width / tan(0.5 * fov);
        let x0 = f * cos(p0) * sin(h0);
        let y0 = f * cos(p0) * cos(h0);
        let z0 = f * sin(p0);
        let du = (canvas_x) - width / 2;
        let dv = height / 2 - (canvas_y - 5);
        let ux = sgn(cos(p0)) * cos(h0);
        let uy = -sgn(cos(p0)) * sin(h0);
        let uz = 0;
        let vx = -sin(p0) * sin(h0);
        let vy = -sin(p0) * cos(h0);
        let vz = cos(p0);
        let x = x0 + du * ux + dv * vx;
        let y = y0 + du * uy + dv * vy;
        let z = z0 + du * uz + dv * vz;
        let R = sqrt(x * x + y * y + z * z);
        let h = atan2(x, y);
        let p = asin(z / R);
        return {
            heading: h * 180.0 / PI,
            pitch: p * 180.0 / PI
        };
    }

    /**
     * From PanoMarker spec
     * @param zoom
     * @returns {number}
     */
    function _get3dFov (zoom) {
        return zoom <= 2 ?
            126.5 - zoom * 36.75 :  // linear descent
            195.93 / Math.pow(1.92, zoom); // parameters determined experimentally
    }

    /**
     * 3D projection related functions
     *
     * These functions are for positioning the markers when the view is panned.
     * The library used is adapted from: https://martinmatysiak.de/blog/view/panomarker/en
     * The math used is from:
     * http://stackoverflow.com/questions/21591462/get-heading-and-pitch-from-pixels-on-street-view/21753165?noredirect=1#comment72346716_21753165
     */

    function get3dFov(zoom) {
        return zoom <= 2 ?
            126.5 - zoom * 36.75 :  // Linear descent.
            195.93 / Math.pow(1.92, zoom); // Parameters determined experimentally.
    }

    /***
     * For a point centered at `povIfCentered`, compute canvas XY coordinates at `currentPov`.
     * @return {Object} Top and Left offsets for the given viewport that point to the desired point-of-view.
     */
    function povToPixel3DOffset(povIfCentered, currentPov, canvasWidth, canvasHeight) {
        // Gather required variables and convert to radians where necessary.
        var target = {
            left: canvasWidth / 2,
            top: canvasHeight / 2
        };

        var DEG_TO_RAD = Math.PI / 180.0;
        var fov = get3dFov(currentPov.zoom) * DEG_TO_RAD;
        var h0 = currentPov.heading * DEG_TO_RAD;
        var p0 = currentPov.pitch * DEG_TO_RAD;
        var h = povIfCentered.heading * DEG_TO_RAD;
        var p = povIfCentered.pitch * DEG_TO_RAD;

        // f = focal length = distance of current POV to image plane.
        var f = (canvasWidth / 2) / Math.tan(fov / 2);

        // Our coordinate system: camera at (0,0,0), heading = pitch = 0 at (0,f,0).
        // Calculate 3d coordinates of viewport center and target.
        var cos_p = Math.cos(p);
        var sin_p = Math.sin(p);

        var cos_h = Math.cos(h);
        var sin_h = Math.sin(h);

        var x = f * cos_p * sin_h;
        var y = f * cos_p * cos_h;
        var z = f * sin_p;

        var cos_p0 = Math.cos(p0);
        var sin_p0 = Math.sin(p0);

        var cos_h0 = Math.cos(h0);
        var sin_h0 = Math.sin(h0);

        var x0 = f * cos_p0 * sin_h0;
        var y0 = f * cos_p0 * cos_h0;
        var z0 = f * sin_p0;

        var nDotD = x0 * x + y0 * y + z0 * z;
        var nDotC = x0 * x0 + y0 * y0 + z0 * z0;

        // nDotD == |targetVec| * |currentVec| * cos(theta)
        // nDotC == |currentVec| * |currentVec| * 1
        // Note: |currentVec| == |targetVec| == f

        // Sanity check: the vectors shouldn't be perpendicular because the line
        // from camera through target would never intersect with the image plane.
        if (Math.abs(nDotD) < 1e-6) {
            return null;
        }

        // t is the scale to use for the target vector such that its end
        // touches the image plane. It's equal to 1/cos(theta) ==
        //     (distance from camera to image plane through target) /
        //     (distance from camera to target == f)
        var t = nDotC / nDotD;

        // Sanity check: it doesn't make sense to scale the vector in a negative direction. In fact, it should even be
        // t >= 1.0 since the image plane is always outside the pano sphere (except at the viewport center).
        if (t < 0.0) {
            return null;
        }

        // (tx, ty, tz) are the coordinates of the intersection point between a
        // line through camera and target with the image plane.
        var tx = t * x;
        var ty = t * y;
        var tz = t * z;

        // u and v are the basis vectors for the image plane.
        var vx = -sin_p0 * sin_h0;
        var vy = -sin_p0 * cos_h0;
        var vz = cos_p0;

        var ux = cos_h0;
        var uy = -sin_h0;
        var uz = 0;

        // Normalize horiz. basis vector to obtain orthonormal basis.
        var ul = Math.sqrt(ux * ux + uy * uy + uz * uz);
        ux /= ul;
        uy /= ul;
        uz /= ul;

        // Project the intersection point t onto the basis to obtain offsets in terms of actual pixels in the viewport.
        var du = tx * ux + ty * uy + tz * uz;
        var dv = tx * vx + ty * vy + tz * vz;

        // Use the calculated pixel offsets.
        target.left += du;
        target.top -= dv;
        return target;
    }

    /**
     * Returns the pov of this label if it were centered based on panorama's POV using panorama XY coordinates.
     *
     * @param panoX
     * @param panoY
     * @param panoWidth
     * @param panoHeight
     * @returns {{heading: Number, pitch: Number}}
     */
    function calculatePovFromPanoXY(panoX, panoY, panoWidth, panoHeight) {
        return {
            heading: (panoX / panoWidth) * 360 % 360,
            pitch: (panoY / (panoHeight / 2) * 90)
        };
    }

    /**
     * Given the current POV, this method calculates the Pixel coordinates on the
     * given viewport for the desired POV. All credit for the math this method goes
     * to user3146587 on StackOverflow: http://goo.gl/0GGKi6
     *
     * My own approach to explain what is being done here (including figures!) can
     * be found at http://martinmatysiak.de/blog/view/panomarker
     *
     * @param {StreetViewPov} targetPov The point-of-view whose coordinates are
     *     requested.
     * @param {StreetViewPov} currentPov POV of the viewport center.
     * @param {number} zoom The current zoom level.
     * @param {number} Width of the panorama canvas.
     * @param {number} Height of the panorama canvas.
     * @return {Object} Top and Left offsets for the given viewport that point to
     *     the desired point-of-view.
     */
    function povToPixel3d (targetPov, currentPov, zoom, canvasWidth, canvasHeight) {

        // Gather required variables and convert to radians where necessary
        let width = canvasWidth;
        let height = canvasHeight;

        // Corrects width and height for mobile phones
        if (isMobile()) {
            width = window.innerWidth;
            height = window.innerHeight;
        }

        let target = {
            left: width / 2,
            top: height / 2
        };

        let DEG_TO_RAD = Math.PI / 180.0;
        let fov = _get3dFov(zoom) * DEG_TO_RAD;
        let h0 = currentPov.heading * DEG_TO_RAD;
        let p0 = currentPov.pitch * DEG_TO_RAD;
        let h = targetPov.heading * DEG_TO_RAD;
        let p = targetPov.pitch * DEG_TO_RAD;

        // f = focal length = distance of current POV to image plane
        let f = (width / 2) / Math.tan(fov / 2);

        // our coordinate system: camera at (0,0,0), heading = pitch = 0 at (0,f,0)
        // calculate 3d coordinates of viewport center and target
        let cos_p = Math.cos(p);
        let sin_p = Math.sin(p);

        let cos_h = Math.cos(h);
        let sin_h = Math.sin(h);

        let x = f * cos_p * sin_h;
        let y = f * cos_p * cos_h;
        let z = f * sin_p;

        let cos_p0 = Math.cos(p0);
        let sin_p0 = Math.sin(p0);

        let cos_h0 = Math.cos(h0);
        let sin_h0 = Math.sin(h0);

        let x0 = f * cos_p0 * sin_h0;
        let y0 = f * cos_p0 * cos_h0;
        let z0 = f * sin_p0;

        let nDotD = x0 * x + y0 * y + z0 * z;
        let nDotC = x0 * x0 + y0 * y0 + z0 * z0;

        // nDotD == |targetVec| * |currentVec| * cos(theta)
        // nDotC == |currentVec| * |currentVec| * 1
        // Note: |currentVec| == |targetVec| == f

        // Sanity check: the vectors shouldn't be perpendicular because the line
        // from camera through target would never intersect with the image plane
        if (Math.abs(nDotD) < 1e-6) {
            return null;
        }

        // t is the scale to use for the target vector such that its end
        // touches the image plane. It's equal to 1/cos(theta) ==
        //     (distance from camera to image plane through target) /
        //     (distance from camera to target == f)
        let t = nDotC / nDotD;

        // Sanity check: it doesn't make sense to scale the vector in a negative
        // direction. In fact, it should even be t >= 1.0 since the image plane
        // is always outside the pano sphere (except at the viewport center)
            // if (t < 0.0) {
            //     return null;
            // }

        // (tx, ty, tz) are the coordinates of the intersection point between a
        // line through camera and target with the image plane
        let tx = t * x;
        let ty = t * y;
        let tz = t * z;

        // u and v are the basis vectors for the image plane
        let vx = -sin_p0 * sin_h0;
        let vy = -sin_p0 * cos_h0;
        let vz = cos_p0;

        let ux = cos_h0;
        let uy = -sin_h0;
        let uz = 0;

        // normalize horiz. basis vector to obtain orthonormal basis
        let ul = Math.sqrt(ux * ux + uy * uy + uz * uz);
        ux /= ul;
        uy /= ul;
        uz /= ul;

        // project the intersection point t onto the basis to obtain offsets in
        // terms of actual pixels in the viewport
        let du = tx * ux + ty * uy + tz * uz;
        let dv = tx * vx + ty * vy + tz * vz;

        // use the calculated pixel offsets
        target.left += du;
        target.top -= dv;

        return target;
    }

    function projectLat(lat, height) {
        if (isNaN(lat) || typeof lat !== 'number' || lat < -90 || lat > 90) {
            throw new Error('latitude is not valid');
        }
        if (isNaN(height) || typeof height !== 'number'){
            throw new Error('viewport height is not valid');
        }
        return ((lat - 90) / -180 * height);
    }

    function projectLng(lng, width) {
        if (isNaN(lng) || typeof lng !== 'number' || lng < -180 || lng > 180) {
            throw new Error('longitude is not valid');
        }
        if (isNaN(width) || typeof width !== 'number'){
            throw new Error('viewport width is not valid');
        }
        return (lng + 180) / 360 * width;
    }

    function project(lng, lat, width) {
        return {
            left: projectLng(lng, width),
            top: projectLat(lat, width / 2)
        };
    }

    function drawMarkerOnImage() {
        const $img = $('.pano-image');
        const imgWidth = $img.width();
        const imgHeight = $img.height();
        const degX = panorama.getPov().heading - panorama.getPhotographerPov().heading;
        const x = degX * (Math.PI / 180) * (imgWidth/(2 * Math.PI));

        const degY = panorama.getPov().pitch + panorama.getPhotographerPov().pitch;
        const y = degY * (Math.PI / 90) * (imgHeight/(2 * Math.PI));

        const p = project(degX, degY, imgWidth);

        $('.pano-image-marker').css({'margin-left': x, 'margin-top': -y});
        // $('.pano-image-marker').css({'margin-left': p.left, 'margin-top': p.top});
    }
    //
    // setTimeout(function() {
    //     $('.dummy-image').attr('src', $('.abcd').attr('src'));
    // }, 1000);

    // Not relevant for now.
    function takeAndSaveScreenshot() {

        $('.status-indicator').text('Detecting...');

        const $dummyImageContainer = $('.dummy-image-container');

        const $panoContainer = $('.panorama-container');
        $dummyImageContainer.css({'height': $panoContainer.height(), 'width': $panoContainer.width(), 'top': $panoContainer.position().top, 'left': $panoContainer.position().left});

        // clear existing dummy markers as they might have moved
        $('.dummy-marker:not(.template)').remove();

        $('.marker:not(.template)').each(function() {
            const $marker = $(this);
            const $dummyMarker = $('.dummy-marker.template').clone().removeClass('template');
            $dummyMarker.css({'top': $marker.position().top + $marker.height()/2, 'left': $marker.position().left + $marker.width()/2});
            $dummyMarker.appendTo($dummyImageContainer);
            $dummyMarker.addClass($marker.attr('class'));
        });

        var webglImage = (function convertCanvasToImage(canvas) {
            var image = new Image();
            image.src = canvas.toDataURL('image/jpeg', 0.8);
            return image;
        })($('.widget-scene-canvas')[0]);

        $('.dummy-image').attr('src', webglImage.src);

        // html2canvas($dummyImageContainer[0]).then(canvas => {
        //
        //     const d = {
        //         'name': 'label-' + new Date().getTime() +'.jpg',
        //         'b64': canvas.toDataURL('image/jpeg', 0.8)
        //     }
        //     $.ajax({
        //         type: "POST",
        //         url: "saveImage.jsp",
        //         data: d,
        //         contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        //         success: function(data){
        //             console.log(data);
        //         }
        //     });
        //
        //     $('.dummy-image').attr('src', '');
        // });
    }


    let lastPov;


    $('.screen-capture').click(function() {

        takeAndSaveScreenshot();

    });


    function isMobile() {
        return false;
    }

    function showLabels() {
        $('.label-toolbar-overlay-container').show();
    }

    // Places the labels in the GSV window.
    function placeLabel(e, labelType) {
        const x = e.clientX - $panorama.offset().left;
        const y = e.clientY - $panorama.offset().top;
        const pov = panorama.getPov();
        const position = getPosition(x, y, $panorama.width(), $panorama.height(), 1, pov.heading, pov.pitch);
        var newCoords = povToPixel3d(position, panorama.getPov(), 1, $panorama.width(), $panorama.height());

        const $marker = $('.marker.template').clone().removeClass('template');

        $marker.css({'left': newCoords.left, 'top': newCoords.top});

        $marker.attr('data-x', x);
        $marker.attr('data-y', y);

        lastPov = {
            heading: pov.heading,
            pitch: pov.pitch
        };

        $marker.addClass('marker-' + labelType);

        $('.panorama-container').append($marker);
    }

    // This function moves 'markers' and 'object boundaries' when the pano is moved.
    function moveMarkers() {

        const pov = panorama.getPov();
        const photographerPov = panorama.getPhotographerPov();

        // Markers are elements placed by 'labelling'. Not relevant for now.
        $('.marker:not(.template)').each(function() {

            const $marker = $(this);
            const position = getPosition(parseInt($marker.attr('data-x')), parseInt($marker.attr('data-y')), $panorama.width(), $panorama.height(), 1, lastPov.heading, lastPov.pitch);
            const newCoords = povToPixel3d(position, panorama.getPov(), 1, $panorama.width(), $panorama.height());
            $marker.css({'left': newCoords.left, 'top': newCoords.top});
        });

        // .object-boundary is the element that is used to draw the boundary of the object in the GSV pano.
        // It needs to be moved when the pano is moved.
        $('.object-boundary:not(.template)').each(function() {
            const $boundary = $(this);

            // Ignore the commented lines
            // const position  = getPosition(parseFloat($boundary.attr('data-x')), parseFloat($boundary.attr('data-y')), $panorama.width(), $panorama.height(), 1, lastPov.heading, lastPov.pitch);
            // const newCoords = povToPixel3d(position, panorama.getPov(), 1, $panorama.width(), $panorama.height());
            // const position = calculatePovFromPanoXY(parseFloat($boundary.attr('data-x')), parseFloat($boundary.attr('data-y')), $panorama.width(), $panorama.height());

            // Get the original heading and pitch information from the attributes of the object.
            const position = {
                heading: parseFloat($boundary.attr('data-heading')),
                pitch: parseFloat($boundary.attr('data-pitch')),
            }

            // position.pitch += (pov.pitch - photographerPov.pitch) * Math.abs((pov.heading/180));

            // This function is not behaving exactly like the povToPixel3d function. So for now I am using the old one.
            // const newCoords = povToPixel3DOffset(position, panorama.getPov(), $panorama.width(), $panorama.height());

            // Get the coordinates based on the position.
            const newCoords = povToPixel3d(position, pov, 1, $panorama.width(), $panorama.height());

            // Move the boundary to the new coordinates.
            // Subtract 15 as the element is 30x30 pixels.
            $boundary.css({'left': newCoords.left - markerOffset, 'top': newCoords.top - markerOffset});
        });
    }

    worker.addEventListener('message', (event) => {

        const message = event.data;

        console.log("from worker: " + JSON.stringify(message));
    });

    function setupEventHandlers() {

        function postImageDataToWorker() {

            takeAndSaveScreenshot();

            // Set and pass generation settings to web worker
            let data = {
                task: 'object-detection'
            };

            const $dummyImageContainer = $('.dummy-image-container');

            const $panoContainer = $('.panorama-container');
            $dummyImageContainer.css({'height': $panoContainer.height(), 'width': $panoContainer.width(), 'top': $panoContainer.position().top, 'left': $panoContainer.position().left});

            // clear existing dummy markers as they might have moved
            $('.dummy-marker:not(.template)').remove();

            var webglImage = (function convertCanvasToImage(canvas) {
                var image = new Image();
                image.src = canvas.toDataURL('image/png', 0.5);
                return image;
            })($('.widget-scene-canvas')[0]);

            $('.dummy-image').attr('src', webglImage.src);

            html2canvas($dummyImageContainer[0]).then(canvas => {

                data.image =  canvas.toDataURL('image/png', 0.5); //getImageDataFromImage(OD_IMG)
                data.targetType = 'overlay'
                data.chartId = '#x' //OD_OUTPUT_CANVAS.id
                data.elementIdToUpdate = '#y' //OD_OUTPUT_OVERLAY.id

                startTime = new Date().getTime();
                worker.postMessage(data);

            });
        }

        function startLabelingHandler() {

            const labelType = $(this).attr('data-label-type');
            currentLabelType = labelType;
            isMarking = true;
            $('.mode-indicator').addClass('marking');

            $('.overlay').css({'pointer-events': 'all'});
            $('.mode-indicator').fadeIn(200);
        }

        function stopLabelingHandler() {
            isMarking = false;
            $('.mode-indicator').removeClass('marking');

            $('.overlay').css({'pointer-events': 'none'});
            $('.mode-indicator').fadeOut(200);
        }

        function placeLabelHandler() {
            $('.actions-toolbar-overlay-container').hide();
            showLabels();
        }

        function getRandomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
        }

        function nextLocationHandler() {
            dataIDX = getRandomInt (0, 6200);
            const location = GIS_DATA.features[dataIDX].geometry.coordinates;
            panorama.setPosition({lat: location[1], lng: location[0]});

            console.log("Index: " + dataIDX);
            console.log("Info: " + JSON.stringify(GIS_DATA.features[dataIDX]));
        }

        function previousLocationHandler() {
            dataIDX--;
            const location = GIS_DATA.features[dataIDX].geometry.coordinates;
            panorama.setPosition({lat: location[1], lng: location[0]});

            console.log("Index: " + dataIDX);
            console.log("Info: " + JSON.stringify(GIS_DATA.features[dataIDX]));
        }

        $('.next-location').click(nextLocationHandler);
        $('.previous-location').click(previousLocationHandler);

        $('.show-labels-toolbar').on('click', placeLabelHandler);

        $('.place-label').click(startLabelingHandler);

        $('.stop-labeling').click(stopLabelingHandler);

        $('.go-back').click(function () {
            $('.label-toolbar-overlay-container').hide();
            $('.actions-toolbar-overlay-container').show();
        });

        $('.save-image').click(takeAndSaveScreenshot);

        // $('.dummy-image').on('load', analyzeImage);

        // $('.abcd').on('load', function() {
        //     renderBoxes(processBoxData(preprocessedData['47.6593773,-122.3119228']));
        //     areBoxesDrawn = false;
        // });

        $(document).on('keypress', function(e) {
            if (e.key == 'r') {
                if ($('.panorama-container').hasClass('half-size')) {
                    $('.panorama-container').removeClass('half-size');
                } else {
                    $('.panorama-container').addClass('half-size');
                }
            }
        });

        $(document).on('mousedown', function () {
            // if (!lastPov) {
            //     lastPov = panorama.getPov();
            // }
            isMouseDown = true;
        })

        $(document).on('mouseup', function (e) {
            isMouseDown = false;

            if ($(e.target).hasClass('widget-scene-canvas')) {
                if (!lastPov) {
                    lastPov = panorama.getPov();
                }
                takeAndSaveScreenshot();
            }
        })

        $(document).on('mousemove', function () {
            if (!isMarking && isMouseDown) {
                moveMarkers();
            }
        });

        $('.panorama-container').on('click', function(e) {

            if (isMarking) {
                placeLabel(e, currentLabelType);
            } else {
                moveMarkers();
            }
        });
    }

    let prevZoom = 1;

    try {
        panorama.addListener('pov_changed', function () {
            const newZoom = panorama.getPov().zoom;
            if (Number.isInteger(newZoom) && prevZoom !== panorama.getPov().zoom) {
                prevZoom = panorama.getPov().zoom;
                setTimeout(takeAndSaveScreenshot, 20);
            }
        });

    } catch (e) {
        console.log(e);
        // alert("Reload the page.");
    }

    const inputShape = [1, 3, 640, 640];
    const topk = 100;
    const iouThreshold = 0.45;
    const scoreThreshold = 0.2;


    function getHeadingAndPitch(width, height, x, y) {
        // Convert pixel coordinates to normalized device coordinates (-1 to 1)
        const nx = (x / width) * 2 - 1;
        const ny = (y / height) * 2 - 1;

        // Calculate the distance from the center of the sphere (assuming a radius of 1)
        const r = Math.sqrt(nx * nx + ny * ny);

        // Calculate the pitch and heading angles
        const pitch = Math.atan2(ny, -r);
        const heading = Math.atan2(nx, -r);

        // Convert radians to degrees
        const pitchDeg = (pitch * 180 / Math.PI) % 180;
        const headingDeg = (heading * 180 / Math.PI) % 180;

        return { heading: headingDeg, pitch: 0 };
    }

    function processBoxData(data) {

        // const [modelWidth, modelHeight] = inputShape.slice(2);
        // const [input, xRatio, yRatio] = preprocessing($('.abcd')[0], modelWidth, modelHeight);

        // const xRatio = 8192/8192;
        // const yRatio = 4/4096;

        const result = [];

        const boxesString = data.split('\n');
        for (let i = 0; i < boxesString.length; i++) {

            if (boxesString[i].length < 1) continue;

            const box = {};
            const tokens = boxesString[i].split(' ');
            box.label = tokens[0];
            box.probability = tokens[5];

            const boxString = [tokens[1], tokens[2], tokens[3], tokens[4]];

            const [x, y, w, h] = [
                parseFloat(tokens[1]),
                parseFloat(tokens[2]),
                parseFloat(tokens[3]) * panoImageScale,
                parseFloat(tokens[4]) * panoImageScale
            ]; // keep boxes in maxSize range

            box.bounding = [x, y, w, h];

            result.push(box);
        }

        return result;
    }

    function getPOVFromFullPanoCoords(left, top) {

        const result = {
            heading: 0,
            pitch: 0
        };

        const $panoFullWidth = $('.pano-full-width');
        const fullPanoMidpointX = panoImageWidth / 2;
        const fullPanoMidpointY = panoImageHeight / 2;
        const deltaX = left - fullPanoMidpointX;
        const deltaY = top - fullPanoMidpointY;

        let h = 0
        if (deltaX < 0) {
            h = (left * (360/panoImageWidth));
            h += 180;
        } else {
            h = (deltaX * (360/panoImageWidth));
        }
        result.heading = h;

        let p = 0
        if (deltaY < 0) {
            p = (top * (180/panoImageHeight));
            p += 90;
        } else {
            p = (deltaY * (180/panoImageHeight));
        }

        result.pitch = p * -1;

        return result;

    }

    function getHeadingAndPitch2(width, height, x, y) {
        // Convert pixel coordinates to normalized device coordinates (-1 to 1)
        const nx = (x / width) * 2 - 1;
        const ny = 1 - (y / height) * 2; // Flip the y-coordinate

        // Calculate the distance from the center of the sphere
        const r = Math.sqrt(nx * nx + ny * ny);

        // Calculate the heading angle
        let heading = Math.atan2(nx, ny);

        // Convert the heading angle to a positive value
        if (heading < 0) {
            heading = 2 * Math.PI + heading;
        }

        // Calculate the pitch angle
        const pitch = Math.atan2(-r, Math.sqrt(nx * nx + ny * ny));

        // Convert radians to degrees
        const pitchDeg = (pitch * 180) / Math.PI;
        const headingDeg = (heading * 180) / Math.PI;

        return { heading: headingDeg, pitch: pitchDeg };
    }


    function toRadians (angle) {
        return angle * (Math.PI / 180);
    }


    function renderBoxes(boxes) {

        // $('.object-boundary:not(.template)').remove();

        const pov = panorama.getPov();

        const panoFullWidthPosition = $('.pano-full-width').position();

        const photographerPOV = panorama.getPhotographerPov();

        for (let i = 0; i < boxes.length; i++) {
            const box = boxes[i];
            const [x, y, w, h] = box.bounding;
            const label = box.label;
            const probability = box.probability;

            const $b = $('.object-boundary.template').clone().removeClass('template').addClass('object-' + i);

            const scaledX = x; // + (w/2); // * GSVScaleX;
            const scaledY = y; // + (h/2); // * GSVScaleY;

            // const position  = getPosition(parseFloat($boundary.attr('data-x')), parseFloat($boundary.attr('data-y')), $panorama.width(), $panorama.height(), 1, lastPov.heading, lastPov.pitch);
            // const newCoords = povToPixel3d(position, panorama.getPov(), 1, $panorama.width(), $panorama.height());

            // const position = getPosition(scaledX, scaledY, $panorama.width(), $panorama.height(), 1, pov.heading, pov.pitch);
            // var newCoords = povToPixel3d(position, pov, 1, $panorama.width(), $panorama.height());

            // const position = calculatePovFromPanoXY(scaledX, scaledY, $panorama.width(), $panorama.height());
            // const position = {
            //     heading: 247.5,
            //     pitch: 0
            // }

            // const position = getHeadingAndPitch(panoImageWidth, panoImageHeight, scaledX, scaledY);
            // const position = getHeadingAndPitch2(panoImageWidth, panoImageHeight, scaledX, scaledY);
            const position = getPOVFromFullPanoCoords(scaledX, scaledY);

            // const position = convertXYtoYawPitch(scaledX/panoImageWidth, scaledY/panoImageHeight);

            position.heading += photographerPOV.heading;
            // position.pitch -= (photographerPOV.pitch);
            // position.pitch += (Math.abs(position.heading - pov.heading) /180) * pov.pitch;

            const nx = (x / panoImageWidth) * 2 - 1;
            position.pitch -= Math.cos(toRadians(position.heading)) * photographerPOV.pitch;
            // position.pitch -= (((position.heading - 90) / 90)) * photographerPOV.pitch;


            const newCoords = povToPixel3d(position, pov, 1, $panorama.width(), $panorama.height());
            // const newCoords = povToPixel3DOffset(position, pov, $panorama.width(), $panorama.height());

            if (newCoords == null) {
                console.log('New coords null for: ' + scaledX + ', ' + scaledY);
                continue;
            }

            // $b.css({
            //     top: newCoords.top + ((h * GSVScaleY)/2) - 15,
            //     left: newCoords.left + ((w * GSVScaleX)/2) - 15,
            //     width: 30,
            //     height: 30,
            // });

            $b.css({
                top: newCoords.top - markerOffset,
                left: newCoords.left - markerOffset,
                width: markerSize,
                height: markerSize,
            });

            $b.addClass('label-' + label);
            $b.attr('data-x', scaledX);
            $b.attr('data-y', scaledY);
            $b.attr('data-heading', position.heading);
            $b.attr('data-pitch', position.pitch);


            $('.panorama-container').append($b);

            // const $bClone = $b.clone();
            // $bClone.css({'left': x, 'top': y});
            //
            // $('.pano-full-width').append($bClone);

            // $bClone.css({'left': newCoords.left + panoFullWidthPosition.left, 'top': newCoords.top + panoFullWidthPosition.top, 'border-color': 'black'});
            // $bClone.attr('data-x', newCoords.left + panoFullWidthPosition.left);
            // $bClone.attr('data-y', newCoords.top + panoFullWidthPosition.top);
            //
            // $bClone.addClass('in-pano-container');
            //
            // $('.panorama-container').append($bClone);

            $('.object-boundary-label-text', $b).text(LABEL_TYPES[label]);
        }

        areBoxesDrawn = true;

        if (!lastPov) {
            lastPov = panorama.getPov();
        }

    }

    let session = null;
    let nms = null;

    async function loadModels() {
        try {
            // create a new session and load the specific model.
            //
            // the model in this example contains a single MatMul node
            // it has 2 inputs: 'a'(float32, 3x4) and 'b'(float32, 4x3)
            // it has 1 output: 'c'(float32, 3x3)
            session = await ort.InferenceSession.create('./models/attempt-2.onnx');
            nms = await ort.InferenceSession.create('./models/nms-yolov8.onnx');

        } catch (e) {
            console.log(e);
        }
    }

    /**
     * Preprocessing image
     * @param {HTMLImageElement} source image source
     * @param {Number} modelWidth model input width
     * @param {Number} modelHeight model input height
     * @return preprocessed image and configs
     */
    const preprocessing = (source, modelWidth, modelHeight) => {
        const mat = cv.imread(source); // read from img tag
        const matC3 = new cv.Mat(mat.rows, mat.cols, cv.CV_8UC3); // new image matrix
        cv.cvtColor(mat, matC3, cv.COLOR_RGBA2BGR); // RGBA to BGR

        // padding image to [n x n] dim
        const maxSize = Math.max(matC3.rows, matC3.cols); // get max size from width and height
        const xPad = maxSize - matC3.cols, // set xPadding
            xRatio = maxSize / matC3.cols; // set xRatio
        const yPad = maxSize - matC3.rows, // set yPadding
            yRatio = maxSize / matC3.rows; // set yRatio
        const matPad = new cv.Mat(); // new mat for padded image
        cv.copyMakeBorder(matC3, matPad, 0, yPad, 0, xPad, cv.BORDER_CONSTANT); // padding black

        const input = cv.blobFromImage(
            matPad,
            1 / 255.0, // normalize
            new cv.Size(modelWidth, modelHeight), // resize to model input size
            new cv.Scalar(0, 0, 0),
            true, // swapRB
            false // crop
        ); // preprocessing image matrix

        // release mat opencv
        mat.delete();
        matC3.delete();
        matPad.delete();

        return [input, xRatio, yRatio];
    };

    // This function analyzes image in runtime. Disabled for now.
    async function analyzeImage() {

        if (areBoxesDrawn)
            return;

        startTime = new Date().getTime();

        const image = $('.dummy-image')[0];

        const [modelWidth, modelHeight] = inputShape.slice(2);
        const [input, xRatio, yRatio] = preprocessing(image, modelWidth, modelHeight);

        const tensor = new ort.Tensor("float32", input.data32F, inputShape); // to ort.Tensor
        const config = new ort.Tensor("float32", new Float32Array([topk, iouThreshold, scoreThreshold])); // nms config tensor
        const { output0 } = await session.run({ images: tensor }); // run session and get output layer
        const { selected } = await nms.run({ detection: output0, config: config }); // perform nms and filter boxes

        console.log(selected);

        const boxes = [];

        // looping through output
        for (let idx = 0; idx < selected.dims[1]; idx++) {
            const data = selected.data.slice(idx * selected.dims[2], (idx + 1) * selected.dims[2]); // get rows
            const box = data.slice(0, 4);
            const scores = data.slice(4); // classes probability scores
            const score = Math.max(...scores); // maximum probability scores
            const label = scores.indexOf(score); // class id of maximum probability scores

            const [x, y, w, h] = [
                (box[0] - 0.5 * box[2]) * xRatio, // upscale left
                (box[1] - 0.5 * box[3]) * yRatio, // upscale top
                box[2] * xRatio, // upscale width
                box[3] * yRatio, // upscale height
            ]; // keep boxes in maxSize range

            boxes.push({
                label: label,
                probability: score,
                bounding: [x, y, w, h], // upscale box
            }); // update boxes to draw later
        }

        console.log(boxes);

        renderBoxes(boxes); // Draw boxes

        if (boxes.length === 0) {
            $('.status-indicator').text('No objects detected. Try moving the panorama or zooming in.');
        } else {
            $('.status-indicator').text('Done!');
        }

        endTime = new Date().getTime();
        console.log('Time taken: ' + (endTime - startTime) + 'ms');
    }

    setupEventHandlers();
    // loadModels();


    // In a timeout to allow the panorama to load
    setTimeout(function() {
        renderBoxes(processBoxData(preprocessedData['47.6593773,-122.3119228']));
    }, 5000);
});

