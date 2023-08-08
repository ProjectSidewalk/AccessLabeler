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


worker.addEventListener('message', (event) => {

    const message = event.data;

    console.log("from worker: " + JSON.stringify(message));
});

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