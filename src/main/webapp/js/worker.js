// Get dist directory relative to location of worker script.
const DIST_DIR = location.pathname.split('/').slice(0, -1 - 2).join('/') + '/accesslabeler/dist/';
const MODELS_DIR = location.pathname.split('/').slice(0, -1 - 2).join('/') + '/accesslabeler/models/';

// Import transformers.js library
// importScripts(DIST_DIR + 'transformers.js');

// Set paths to wasm files. In this case, we use the .wasm files present in `DIST_DIR`.
// env.onnx.wasm.wasmPaths = DIST_DIR;

// env.localURL = MODELS_DIR;

importScripts("https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js", "https://docs.opencv.org/4.7.0/opencv.js")

let startTime = new Date().getTime();

const inputShape = [1, 3, 640, 640];
const topk = 100;
const iouThreshold = 0.45;
const scoreThreshold = 0.2;

try {
    // create a new session and load the specific model.
    //
    // the model in this example contains a single MatMul node
    // it has 2 inputs: 'a'(float32, 3x4) and 'b'(float32, 4x3)
    // it has 1 output: 'c'(float32, 3x3)
    session = ort.InferenceSession.create(MODELS_DIR + 'attempt-2.onnx');
    nms = ort.InferenceSession.create(MODELS_DIR + 'nms-yolov8.onnx');

} catch (e) {
    console.log(e);
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

async function analyzeImage(data) {

    startTime = new Date().getTime();

    const image = data.image;
    // const image = new Image();
    // image.src = imageData;

    startTime = new Date().getTime();

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
    return boxes;
    //
    // renderBoxes(boxes); // Draw boxes
    //
    // if (boxes.length === 0) {
    //     $('.status-indicator').text('No objects detected. Try moving the panorama or zooming in.');
    // } else {
    //     $('.status-indicator').text('Done!');
    // }
    //
    // endTime = new Date().getTime();
    // console.log('Time taken: ' + (endTime - startTime) + 'ms');
}

// Define model factories
// Ensures only one model is created of each type
class PipelineFactory {
    static task = null;
    static model = null;

    // NOTE: instance stores a promise that resolves to the pipeline
    static instance = null;

    constructor(tokenizer, model) {
        this.tokenizer = tokenizer;
        this.model = model;
    }

    static getInstance(progressCallback = null) {
        if (this.task === null || this.model === null) {
            throw Error("Must set task and model")
        }
        if (this.instance === null) {
            this.instance = pipeline(this.task, this.model, {
                progress_callback: progressCallback
            });
        }

        return this.instance;
    }
}

class ObjectDetectionPipelineFactory extends PipelineFactory {
    static task = 'object-detection';
    static model = 'facebook/detr-resnet-50';
}

// Listen for messages from UI
self.addEventListener('message', async (event) => {
    const data = event.data;

    let result = await analyzeImage(data);
    self.postMessage({
        task: data.task,
        type: 'result',
        data: result
    });
});

async function object_detection(data) {

    let pipeline = await ObjectDetectionPipelineFactory.getInstance(data => {
        self.postMessage({
            type: 'download',
            task: 'object-detection',
            data: data
        });
    })

    let outputs = await pipeline(data.image, {
        threshold: 0.9,
        percentage: true
    })

    self.postMessage({
        type: 'complete',
        target: data.elementIdToUpdate,
        targetType: data.targetType,
        chartId: data.chartId,
        data: outputs
    });
}
