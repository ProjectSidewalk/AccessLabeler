// Get dist directory relative to location of worker script.
const DIST_DIR = location.pathname.split('/').slice(0, -1 - 2).join('/') + '/accesslabeler/dist/';
const MODELS_DIR = location.pathname.split('/').slice(0, -1 - 2).join('/') + '/accesslabeler/models/quantized/';

// Import transformers.js library
importScripts(DIST_DIR + 'transformers.js');

// Set paths to wasm files. In this case, we use the .wasm files present in `DIST_DIR`.
env.onnx.wasm.wasmPaths = DIST_DIR;

env.localURL = MODELS_DIR;

// If we are running locally, we should use the local model files (speeds up development)
// Otherwise, we should use the remote files
env.remoteModels = true; //location.hostname !== '127.0.0.1' && location.hostname !== 'localhost';

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

    let result = await object_detection(data);
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
