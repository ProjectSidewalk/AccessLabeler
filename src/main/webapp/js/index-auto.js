$(function() {
    let isMouseDown = false;

    let isMarking = false;

    let currentLabelType = null;

    var $markers = $('.marker');
    var $panorama = $('#panorama');

    let startTime = null;
    let endTime = null;

    const worker = new Worker('js/worker.js');

    const busStopLatLngs = [
        {lat: 37.8719, lng: -122.2585, pov: {heading: 0, pitch: -10}},
        {lat: 47.6342142, lng: -122.3465089, pov: {heading: 0, pitch: -10}},
        {lat: 47.6330716, lng: -122.3459896, pov: {heading: 0, pitch: -10}},
    ]

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
        if (t < 0.0) {
            return null;
        }

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

    function takeAndSaveScreenshot() {
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

        html2canvas($dummyImageContainer[0]).then(canvas => {

            const d = {
                'name': 'label-' + new Date().getTime() +'.jpg',
                'b64': canvas.toDataURL('image/jpeg', 0.8)
            }
            $.ajax({
                type: "POST",
                url: "saveImage.jsp",
                data: d,
                contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                success: function(data){
                    console.log(data);
                }
            });

            $('.dummy-image').attr('src', '');
        });
    }


    let lastPov;

    function updatePano(lat, lng, pov) {
        if (panorama) {
            panorama.setPosition({lat: lat, lng: lng});
            if (pov) {
                panorama.setPov(pov);
            }
        }
    }

    let wait = false;

    function downloadAllImages() {
        for (let i = 0; i < busStopLatLngs.length; i++) {
            updatePano(busStopLatLngs[i].lat, busStopLatLngs[i].lng, busStopLatLngs[i].pov);
            wait = true;
            while (wait) {
                console.log('waiting');
            }
        }
    }


    $('.screen-capture').click(function() {

        downloadAllImages();

    });


    function isMobile() {
        return false;
    }

    function showLabels() {
        $('.label-toolbar-overlay-container').show();
    }

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

    function moveMarkers() {

        $('.marker').each(function() {

            const $marker = $(this);
            const position = getPosition(parseInt($marker.attr('data-x')), parseInt($marker.attr('data-y')), $panorama.width(), $panorama.height(), 1, lastPov.heading, lastPov.pitch);
            const newCoords = povToPixel3d(position, panorama.getPov(), 1, $panorama.width(), $panorama.height());
            $marker.css({'left': newCoords.left, 'top': newCoords.top});
        });
    }

    // Utility functions

    function htmlToElement(html) {
        // https://stackoverflow.com/a/35385518
        let template = document.createElement('template');
        html = html.trim(); // Never return a text node of whitespace as the result
        template.innerHTML = html;
        return template.content.firstChild;
    }

    function formatBytes(bytes, decimals = 0) {
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        if (bytes === 0) return "0 Bytes";
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1000)), 10);
        const rounded = (bytes / Math.pow(1000, i)).toFixed(decimals);
        return rounded + " " + sizes[i];
    }

    function getImageDataFromImage(original) {

        // Helper function to get image data from image element
        const canvas = document.createElement('canvas');
        canvas.width = original.naturalWidth;
        canvas.height = original.naturalHeight;

        const ctx = canvas.getContext('2d');
        // TODO play around with ctx options?
        // ctx.patternQuality = 'bilinear';
        // ctx.quality = 'bilinear';
        // ctx.antialias = 'default';
        // ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(original, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL();
    }

    function renderObjectOutlines(data) {

        $('.box:not(.template)').remove();

        const container = $('.panorama-container');
        const containerWidth = container.width();
        const containerHeight = container.height();

        for (let i = 0; i < data.boxes.length; i++) {
            const box = data.boxes[i];
            const $box = $('.box.template').clone().removeClass('template');
            $box.addClass(data.labels[i]);
            $box.css({'left': box[0] * containerWidth, 'top': box[1] * containerHeight, 'width': (box[2] - box[0]) * containerWidth, 'height': (box[3] - box[1]) * containerHeight});
            $box.appendTo($('.panorama-container'));

            $box.attr('title', data.labels[i]);
        }
    }

    worker.addEventListener('message', (event) => {

        const message = event.data;

        console.log(message);

        switch (message.type) {
            case 'download': // for session creation

                break;
            case 'update': // for generation
                let target = message.target;
                let elem = document.getElementById(target);

                switch (message.targetType) {
                    case 'code':
                        CODE_BLOCKS[target].update(message.data);
                        break;
                    default: // is textbox
                        elem.value = message.data
                        break;
                }

                break;

            case 'complete':
                switch (message.targetType) {

                    case 'overlay':

                        endTime = new Date().getTime();
                        console.log('Time taken: ' + (endTime - startTime) + 'ms');

                        console.log(message.data);
                        // alert('Labels: ' + message.data.labels);

                        renderObjectOutlines(message.data);

                        break;
                    default: // is text
                        document.getElementById(message.target).value = message.data
                        break;
                }
                break;
            default:
                break;
        }
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
                image.src = canvas.toDataURL('image/png');
                return image;
            })($('.widget-scene-canvas')[0]);

            $('.dummy-image').attr('src', webglImage.src);

            html2canvas($dummyImageContainer[0]).then(canvas => {

                data.image =  canvas.toDataURL(); //getImageDataFromImage(OD_IMG)
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

        $('.show-labels-toolbar').on('click', placeLabelHandler);

        $('.place-label').click(startLabelingHandler);

        $('.stop-labeling').click(stopLabelingHandler);

        $('.go-back').click(function () {
            $('.label-toolbar-overlay-container').hide();
            $('.actions-toolbar-overlay-container').show();
        });

        $('.save-image').click(function() {

            panorama.addListener('visible_changed', function() {
                takeAndSaveScreenshot();
                console.log('Downloaded image');
                wait = false;
            });

            downloadAllImages();
        });

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
            if (!lastPov) {
                lastPov = panorama.getPov();
            }
            isMouseDown = true;
        })

        $(document).on('mouseup', function () {
            isMouseDown = false;
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

                // drawMarkerOnImage();
            }
        })
    }

    setupEventHandlers();
});

