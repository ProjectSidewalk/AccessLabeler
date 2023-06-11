
class Marker {

    /**
     * Marker object. Should be placed for each label i.e. human placed or AI suggested.
     * @param id ID of the marker. Should be unique for each location.
     * @param type Type of the marker. Should be one of the types defined in the labelsDescriptor.js.
     * @param heading Heading of the marker. Should be between 0 and 360.
     * @param pitch Pitch of the marker. Should be between -90 and 90.
     * @param x X coordinate of the marker in the GCV window.
     * @param y Y coordinate of the marker in the GCV window.
     */
    constructor(id, type, heading, pitch, x, y, left, right, verificationState) {
        this.id = id;
        this.type = type;
        this.heading = heading;
        this.pitch = pitch;
        this.originalX = x;
        this.originalY = y;
        this.left = left;
        this.top = top;
        this.verificationState = verificationState;
    }
}


const HUMAN_VERIFICATION_STATE = {
    'NOT_VERIFIED': 'NOT_VERIFIED',
    'VERIFIED_CORRECT': 'VERIFIED_CORRECT',
    'VERIFIED_INCORRECT': 'VERIFIED_INCORRECT',
    'VERIFIED_OTHER': 'VERIFIED_OTHER'
}


$(function() {
    let isMouseDown = false;

    let isMarking = false;

    let currentLabelType = null;

    var $panorama = $('#panorama');

    let startTime = null;
    let endTime = null;

    let dataIDX = get('idx') ? get('idx') : 250;

    const worker = new Worker('js/worker.js');

    let GSVScaleX = $('.panorama-container').width()/640;
    let GSVScaleY = $('.panorama-container').height()/640;


    const MARKER_DISTANCE_BUFFER = 50;


    const LABEL_TYPES = {
        0: 'Seating',
        1: 'Shelter',
        2: 'Signage',
        3: 'Trashcan'
    }


    const markers = [];

    let markerID = 0;


    let labelStats = {};
    labelStats.nLabelsTotal = 0;
    labelStats.nLabelsCorrect = 0;
    labelStats.nLabelsIncorrect = 0;


    let lastPov;


    function updateStatsUI() {
        $('.n-labels-correct-count').text(labelStats.nLabelsCorrect);
        $('.n-labels-incorrect-count').text(labelStats.nLabelsIncorrect);
        $('.n-labels-total-count').text(labelStats.nLabelsTotal);
    }

    function calculateGSVScale() {
        const $panoramaContainer = $('.panorama-container');
        GSVScaleX = $panoramaContainer.width()/640;
        GSVScaleY = $panoramaContainer.height()/640;
    }

    function takeAndSaveScreenshot() {

        $('.status-indicator').text('Detecting...').show();

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


    $('.screen-capture').click(function() {

        takeAndSaveScreenshot();

    });


    function showLabels() {

        function renderLabels(labelGroups) {

            const $labelToolbar = $('.label-toolbar');

            $('.label-group-container:not(.template)').remove();
            $('.label-toolbar-item.place-label:not(.template)').remove();


            for (let i = 0; i < labelGroups.length; i++) {

                const $labelToolbarGroup = $('.label-group-container.template').clone().removeClass('template');
                $('.label-group-title', $labelToolbarGroup).text(labelGroups[i].title);

                const labels = labelGroups[i].labels;

                for (let i = 0; i < labels.length; i++) {
                    const label = labels[i];
                    const $labelButton = $('.label-toolbar-item.place-label.template', $labelToolbarGroup).clone().removeClass('template');
                    $labelButton.attr('data-label-type', label.type);
                    $labelButton.addClass(label.type);

                    $('.label-icon', $labelButton).attr('href', label.icon.id);
                    $('svg', $labelButton).attr('viewBox', label.icon.viewBox);

                    $('.label-toolbar-item-text', $labelButton).text(label.displayName);
                    $('.label-group-content', $labelToolbarGroup).append($labelButton);
                }

                $labelToolbar.append($labelToolbarGroup);
            }
        }

        renderLabels(LabelsDescriptor.labelGroups);
        $('.label-toolbar-overlay-container').show();
    }

    function placeLabelHandler(e, labelType) {
        e.preventDefault();
        e.stopPropagation();

        const x = e.clientX - $panorama.offset().left;
        const y = e.clientY - $panorama.offset().top;

        placeLabel(null, x, y, labelType, HUMAN_VERIFICATION_STATE.VERIFIED_CORRECT, null);
    }

    function placeLabel(optionalID, x, y, labelType, verificationState, optionalClasses) {

        const pov = panorama.getPov();
        const position = getPosition(x, y, $panorama.width(), $panorama.height(), pov.zoom, pov.heading, pov.pitch);
        var newCoords = povToPixel3d(position, panorama.getPov(), pov.zoom, $panorama.width(), $panorama.height());

        const $marker = $('.marker.template').clone().removeClass('template');

        $marker.css({'left': newCoords.left, 'top': newCoords.top});

        $marker.attr('data-id', markerID);

        lastPov = {
            heading: pov.heading,
            pitch: pov.pitch
        };

        $marker.addClass('marker-' + labelType);

        if (verificationState === HUMAN_VERIFICATION_STATE.NOT_VERIFIED) {
            $marker.addClass('not-verified');
        }

        if (optionalClasses) {
            $marker.addClass(optionalClasses);
        }

        $('.panorama-container').append($marker);

        const m = new Marker(optionalID ? optionalID : markerID, labelType, pov.heading, pov.pitch, x, y, newCoords.left, newCoords.top, verificationState);
        markers.push(m);

        if (!optionalID) {
            markerID++;
        }

        $('.stop-labeling').click(); // Automatically stop labeling after placing a label

        return m;

    }

    // Moves the already markers when the panorama is moved.
    function moveMarkers() {

        const panoWidth = $panorama.width();
        const panoHeight = $panorama.height();

        const pov = panorama.getPov();

        for (let i = 0; i < markers.length; i++) {
            const marker = markers[i];
            const $marker = $('.marker-' + marker.type + '[data-id="' + marker.id + '"]');
            const position = getPosition(marker.originalX, marker.originalY, panoWidth, panoHeight, pov.zoom, marker.heading, marker.pitch);
            const newCoords = povToPixel3d(position, pov, pov.zoom, panoWidth, panoHeight);

            if (!newCoords) {
                // console.log('newCoords is null. Marker: ' + JSON.stringify(marker));
                continue;
            }

            $marker.css({'left': newCoords.left, 'top': newCoords.top});
            marker.left = newCoords.left;
            marker.top = newCoords.top;
        }
    }

    function updateMarkerVerificationState(markerID, verificationState) {
        for (let i = 0; i < markers.length; i++) {
            const marker = markers[i];
            if (marker.id === markerID) {
                marker.verificationState = verificationState;
                $('.marker-' + marker.type + '[data-id="' + marker.id + '"]').removeClass('not-verified').addClass('verified');
                return;
            }
        }
    }

    function setupEventHandlers() {

        function startLabelingHandler(e) {

            e.preventDefault();
            e.stopPropagation();

            const labelType = $(this).attr('data-label-type');
            currentLabelType = labelType;
            isMarking = true;
            $('.mode-indicator').addClass('marking');

            $('.overlay').css({'pointer-events': 'all'});
            $('.mode-indicator').fadeIn(200);
        }

        function stopLabelingHandler(e) {

            e.preventDefault();
            e.stopPropagation();

            isMarking = false;
            $('.mode-indicator').removeClass('marking');

            $('.overlay').css({'pointer-events': 'none'});
            $('.mode-indicator').fadeOut(200);
        }

        function showLabelsHandler() {
            $('.actions-toolbar-overlay-container').hide();
            showLabels();
            $('.place-label').click(startLabelingHandler);
        }

        function getRandomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
        }

        function nextLocationHandler() {
            dataIDX = getRandomInt (0, GIS_DATA.features.length - 1);
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

        function toggleSidebarHandler() {
            const $sidebar = $('.sidebar');

            const $dummyImageContainer = $('.dummy-image-container');
            const $panoContainer = $('.panorama-container');

            let sidebarRight = 0;
            let panoWidth = '70%';


            $sidebar.toggleClass('hide');
            if ($sidebar.hasClass('hide')) {
                sidebarRight = -$sidebar.width(); // 20px for the toggle button
                panoWidth = 'calc(100% - 40px)';
            }

            $sidebar.css({'right': sidebarRight});
            $panoContainer.css({'width': panoWidth});

            $dummyImageContainer.css({'height': $panoContainer.height(), 'width': $panoContainer.width(), 'top': $panoContainer.position().top, 'left': $panoContainer.position().left});

            // clear existing dummy markers as they might have moved
            $('.dummy-marker:not(.template)').remove();
        }

        function confirmLabelHandler(e) {

            e.preventDefault();
            e.stopPropagation();

            labelStats.nLabelsCorrect++;
            labelStats.nLabelsTotal++;
            updateStatsUI();

            const $closestObjectBoundary = $(e.target).closest('.object-boundary');
            $closestObjectBoundary.addClass('confirmed');

            const id = parseInt($closestObjectBoundary.attr('data-id'));
            updateMarkerVerificationState(id, HUMAN_VERIFICATION_STATE.VERIFIED_CORRECT);
        }

        function denyLabelHandler(e) {

            e.preventDefault();
            e.stopPropagation();

            labelStats.nLabelsIncorrect++;
            labelStats.nLabelsTotal++;
            updateStatsUI();

            const $closestObjectBoundary = $(e.target).closest('.object-boundary');
            $closestObjectBoundary.addClass('denied');

            const id = parseInt($closestObjectBoundary.attr('data-id'));
            updateMarkerVerificationState(id, HUMAN_VERIFICATION_STATE.VERIFIED_INCORRECT);
        }

        $('.next-location-button').click(nextLocationHandler);
        $('.previous-location').click(previousLocationHandler);

        $('.show-labels-toolbar').on('click', showLabelsHandler);

        $('.stop-labeling').click(stopLabelingHandler);

        $('.go-back').click(function () {
            $('.label-toolbar-overlay-container').hide();
            $('.actions-toolbar-overlay-container').show();
        });

        $('.save-image').click(takeAndSaveScreenshot);


        $('.toggle-sidebar-button').click(toggleSidebarHandler);

        $(window).on('resize', function(){
           calculateGSVScale();
        });


        $(document).on('click', '.object-boundary-correct', confirmLabelHandler);
        $(document).on('click', '.object-boundary-incorrect', denyLabelHandler);


        $('.dummy-image').on('load', analyzeImage);

        $(document).on('keypress', function(e) {
            if (e.ctrlKey && e.key === 's') {
                takeAndSaveScreenshot();
            }
        });

        $(document).on('mousedown', function () {
            if (!lastPov) {
                lastPov = panorama.getPov();
            }
            isMouseDown = true;
        })

        $(document).on('mouseup', function (e) {
            isMouseDown = false;

            if ($(e.target).hasClass('widget-scene-canvas')) {
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
                placeLabelHandler(e, currentLabelType);
            } else {
                moveMarkers();
            }
        });
    }

    let prevZoom = 1;

    panorama.addListener('pov_changed', function () {
        const newZoom = panorama.getPov().zoom;
        if (Number.isInteger(newZoom) && prevZoom !== panorama.getPov().zoom) {
            prevZoom = panorama.getPov().zoom;
            setTimeout(takeAndSaveScreenshot, 20);
        }
    });

    const inputShape = [1, 3, 640, 640];
    const topk = 100;
    const iouThreshold = 0.45;
    const scoreThreshold = 0.2;

    function renderBoxes(boxes) {

        $('.object-boundary:not(.template)').remove();

        for (let i = 0; i < boxes.length; i++) {
            const box = boxes[i];
            const [x, y, w, h] = box.bounding;
            const label = box.label;
            const probability = box.probability;

            const scaledX = x * GSVScaleX;
            const scaledY = y * GSVScaleY;
            const scaledW = w * GSVScaleX;
            const scaledH = h * GSVScaleY;

            const centerX = scaledX + (scaledW/2);
            const centerY = scaledY + (scaledH/2);


            // Let's see if this was already detected by CV.
            let existingMarker = null;

            // Check if this is an object we've already verified
            for (let j = 0; j < markers.length; j++) {

                if (markers[j].type === label) {

                    const delta = Math.sqrt(Math.pow(centerX - markers[j].left, 2) + Math.pow(centerY - markers[j].top, 2));

                    if (delta < MARKER_DISTANCE_BUFFER && label === markers[j].type && markers[j].verificationState !== HUMAN_VERIFICATION_STATE.NOT_VERIFIED) {

                        console.log('Delta: ' + delta);

                        existingMarker = markers[j];
                        break;
                    }
                }
            }

            const $b = $('.object-boundary.template').clone().removeClass('template').addClass('object-' + i);

            $b.css({
                left: scaledX,
                top: scaledY,
                width: scaledW,
                height: scaledH
            });

            $b.addClass('label-' + label);

            $b.attr('title', 'Confidence: ' + probability);

            $('.panorama-container').append($b);

            $('.object-boundary-label-text', $b).text(LABEL_TYPES[label]);

            if (existingMarker) {
                if (existingMarker.verificationState === HUMAN_VERIFICATION_STATE.VERIFIED_CORRECT) {
                    $b.addClass('confirmed');
                } else if (existingMarker.verificationState === HUMAN_VERIFICATION_STATE.VERIFIED_INCORRECT) {
                    $b.addClass('denied');
                }
            }

            // Place a dummy label in the center of the box. We will use this to determine if the user has already verified this object.
            const marker = placeLabel(existingMarker ? existingMarker.id : null, (scaledX + (scaledW/2)), (scaledY + (scaledH/2)), label, HUMAN_VERIFICATION_STATE.NOT_VERIFIED, 'cv-suggested');
            $b.attr('data-id', marker.id);
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

    async function analyzeImage() {

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
            $('.status-indicator').text('No objects detected. Try moving the panorama or zooming in.').show();
        } else {
            $('.status-indicator').hide();
        }

        endTime = new Date().getTime();
        console.log('Time taken: ' + (endTime - startTime) + 'ms');
    }

    setupEventHandlers();

    calculateGSVScale();
    loadModels();

    updateStatsUI();

    // Simulating a click right upon loading as we want to show the labeling interface by default.
    $('.show-labels-toolbar').click();
});

