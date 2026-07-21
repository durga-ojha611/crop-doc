import * as tf from '@tensorflow/tfjs';

// MobileNetV2 model typically uses 224x224 input
const MODEL_INPUT_SIZE = 224;

// Placeholder for Class names.
// These match the 38 classes of the PlantVillage dataset used by the model below.
export const PLANT_DISEASE_CLASSES = [
  'Apple___Apple_scab',
  'Apple___Black_rot',
  'Apple___Cedar_apple_rust',
  'Apple___healthy',
  'Blueberry___healthy',
  'Cherry_(including_sour)___Powdery_mildew',
  'Cherry_(including_sour)___healthy',
  'Corn_(maize)___Cercospora_leaf_spot_Gray_leaf_spot',
  'Corn_(maize)___Common_rust_',
  'Corn_(maize)___Northern_Leaf_Blight',
  'Corn_(maize)___healthy',
  'Grape___Black_rot',
  'Grape___Esca_(Black_Measles)',
  'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
  'Grape___healthy',
  'Orange___Haunglongbing_(Citrus_greening)',
  'Peach___Bacterial_spot',
  'Peach___healthy',
  'Pepper,_bell___Bacterial_spot',
  'Pepper,_bell___healthy',
  'Potato___Early_blight',
  'Potato___Late_blight',
  'Potato___healthy',
  'Raspberry___healthy',
  'Soybean___healthy',
  'Squash___Powdery_mildew',
  'Strawberry___Leaf_scorch',
  'Strawberry___healthy',
  'Tomato___Bacterial_spot',
  'Tomato___Early_blight',
  'Tomato___Late_blight',
  'Tomato___Leaf_Mold',
  'Tomato___Septoria_leaf_spot',
  'Tomato___Spider_mites_Two-spotted_spider_mite',
  'Tomato___Target_Spot',
  'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
  'Tomato___Tomato_mosaic_virus',
  'Tomato___healthy',
] as const;

export type PlantDiseaseClass = typeof PLANT_DISEASE_CLASSES[number];

// Using a pre-trained MobileNetV2 model on PlantVillage dataset (38 classes)
// Source: https://github.com/rexsimiloluwah/PLANT-DISEASE-CLASSIFIER-WEB-APP-TENSORFLOWJS
const MODEL_URL = 'https://raw.githubusercontent.com/rexsimiloluwah/PLANT-DISEASE-CLASSIFIER-WEB-APP-TENSORFLOWJS/master/tensorflowjs-model/model.json';

let model: tf.GraphModel | tf.LayersModel | null = null;
let isModelLoading = false;
let modelLoadError: string | null = null;

/**
 * Preprocess image for MobileNetV2 inference
 * Resizes to 224x224 and normalizes pixel values [0, 1]
 */
export const preprocessImage = async (imageElement: HTMLImageElement | HTMLCanvasElement): Promise<tf.Tensor4D> => {
  return tf.tidy(() => {
    // Convert image to tensor
    let tensor = tf.browser.fromPixels(imageElement);

    // Resize to model input size (224x224)
    tensor = tf.image.resizeBilinear(tensor, [MODEL_INPUT_SIZE, MODEL_INPUT_SIZE]);

    // Normalize pixel values to [-1, 1] for MobileNetV2
    // (pixel - 127.5) / 127.5
    const normalized = tensor.toFloat().div(tf.scalar(127.5)).sub(tf.scalar(1));

    // Add batch dimension: [224, 224, 3] -> [1, 224, 224, 3]
    return normalized.expandDims(0) as tf.Tensor4D;
  });
};

export const loadImageFromDataUrl = (dataUrl: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
};

export const isModelReady = (): boolean => {
  return model !== null;
};

export const getModelStatus = (): { loading: boolean; error: string | null; ready: boolean } => {
  return {
    loading: isModelLoading,
    error: modelLoadError,
    ready: model !== null,
  };
};

export const loadModel = async (): Promise<void> => {
  if (model || isModelLoading) return;

  isModelLoading = true;
  modelLoadError = null;

  try {
    console.log('Loading AI models...');

    // Object Detection Model (COCO-SSD) removed for performance

    // This specific model is a LayersModel
    if (!model) {
      try {
        model = await tf.loadLayersModel(MODEL_URL);
        console.log('LayersModel loaded successfully');
      } catch (e) {
        console.log('LayersModel failed, trying GraphModel...', e);
        model = await tf.loadGraphModel(MODEL_URL);
        console.log('GraphModel loaded successfully');
      }

      // Warm up
      if (model) {
        const dummyInput = tf.zeros([1, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE, 3]);
        let warmupResult: tf.Tensor | tf.Tensor[];
        if (model instanceof tf.GraphModel) {
          warmupResult = await model.executeAsync(dummyInput);
        } else {
          warmupResult = (model as tf.LayersModel).predict(dummyInput) as tf.Tensor;
        }

        if (Array.isArray(warmupResult)) {
          warmupResult.forEach(t => t.dispose());
        } else {
          (warmupResult as tf.Tensor).dispose();
        }
        dummyInput.dispose();
      }
    }

    console.log('Models warmed up and ready');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load model';
    console.error('Model loading error:', message);
    modelLoadError = message;
    model = null;
  } finally {
    isModelLoading = false;
  }
};

export const predictDisease = async (
  imageDataUrl: string,
  topK: number = 3
): Promise<Array<{ className: PlantDiseaseClass; confidence: number }>> => {
  if (!model) {
    throw new Error('Model not loaded. Call loadModel() first.');
  }

  const imgElement = await loadImageFromDataUrl(imageDataUrl);

  // Object detection validation removed for performance and reliability
  // resulting in faster inference times and fewer false negatives.

  const inputTensor = await preprocessImage(imgElement);

  try {
    let predictions: tf.Tensor;
    if (model instanceof tf.GraphModel) {
      const result = await model.executeAsync(inputTensor);
      predictions = Array.isArray(result) ? result[0] : result;
    } else {
      predictions = (model as tf.LayersModel).predict(inputTensor) as tf.Tensor;
    }

    // This model already outputs probabilities (it has a softmax layer built-in).
    // Running softmax again squashes the confidences to ~0.06 (e^1 / (e^1 + 37*e^0)).
    const probabilities = await predictions.data();

    predictions.dispose();

    const results = Array.from(probabilities)
      .map((confidence, index) => ({
        className: PLANT_DISEASE_CLASSES[index] as PlantDiseaseClass,
        confidence,
      }))
      .filter(item => item.className !== undefined) // Safety check
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, topK);

    return results;
  } finally {
    inputTensor.dispose();
  }
};

export const parseClassName = (className: PlantDiseaseClass): { crop: string; disease: string; isHealthy: boolean } => {
  if (!className) return { crop: 'Unknown', disease: 'Unknown', isHealthy: false };

  const parts = className.split('___');
  const crop = parts[0]?.replace(/_/g, ' ').replace(/,/g, ',') || 'Unknown';
  let disease = parts[1] || 'Unknown';

  const isHealthy = disease.toLowerCase() === 'healthy';

  disease = disease
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  disease = disease
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return { crop, disease, isHealthy };
};
