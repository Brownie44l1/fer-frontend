const API_URL = 'https://fer-api-production.up.railway.app';

const emotionEmojis = {
    happy: '😊',
    sad: '😢',
    angry: '😠',
    surprised: '😲',
    fearful: '😨',
    disgusted: '🤢',
    neutral: '😐'
};

const emotionColors = {
    happy: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    sad: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    angry: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    surprised: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    fearful: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
    disgusted: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    neutral: 'linear-gradient(135deg, #64748b 0%, #475569 100%)'
};

let selectedFile = null;

const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const previewContainer = document.getElementById('previewContainer');
const imagePreview = document.getElementById('imagePreview');
const removeBtn = document.getElementById('removeBtn');
const analyzeBtn = document.getElementById('analyzeBtn');
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const resultsEmpty = document.getElementById('resultsEmpty');
const resultMain = document.getElementById('resultMain');
const predictionsList = document.getElementById('predictionsList');
const predictionsContainer = document.getElementById('predictionsContainer');
const resetBtn = document.getElementById('resetBtn');

uploadArea.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        selectedFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            uploadArea.style.display = 'none';
            previewContainer.style.display = 'block';
            imagePreview.style.display = 'block';
            analyzeBtn.style.display = 'block';
            errorMessage.style.display = 'none';
            hideResults();
        };
        reader.readAsDataURL(file);
    }
});

removeBtn.addEventListener('click', resetUpload);
resetBtn.addEventListener('click', resetUpload);

function resetUpload() {
    selectedFile = null;
    fileInput.value = '';
    uploadArea.style.display = 'block';
    previewContainer.style.display = 'none';
    imagePreview.style.display = 'none';
    analyzeBtn.style.display = 'none';
    errorMessage.style.display = 'none';
    hideResults();
    resultsEmpty.style.display = 'block';
}

function hideResults() {
    resultMain.style.display = 'none';
    predictionsList.style.display = 'none';
    resetBtn.style.display = 'none';
}

analyzeBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    analyzeBtn.disabled = true;
    analyzeBtn.textContent = '⏳ Analyzing...';
    loader.style.display = 'block';
    errorMessage.style.display = 'none';

    try {
        const formData = new FormData();
        formData.append('image', selectedFile);

        const response = await fetch(`${API_URL}/predict/image`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to analyze image');
        }

        const data = await response.json();
        displayResults(data);
    } catch (error) {
        errorText.textContent = error.message + '. Make sure the backend is running on port 8080.';
        errorMessage.style.display = 'block';
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = '✨ Analyze Emotion';
        loader.style.display = 'none';
    }
});

function displayResults(data) {
    resultsEmpty.style.display = 'none';
    
    // Main result
    const emoji = emotionEmojis[data.class] || '😐';
    document.getElementById('resultEmoji').textContent = emoji;
    document.getElementById('resultEmotion').textContent = data.class;
    document.getElementById('resultConfidence').textContent = 
        `${(data.confidence * 100).toFixed(1)}% Confidence`;
    
    resultMain.style.background = emotionColors[data.class];
    resultMain.style.display = 'block';

    // Detailed predictions
    const sorted = Object.entries(data.predictions).sort((a, b) => b[1] - a[1]);
    predictionsContainer.innerHTML = '';
    
    sorted.forEach(([emotion, confidence]) => {
        const item = document.createElement('div');
        item.className = 'prediction-item';
        item.innerHTML = `
            <div class="prediction-header">
                <div class="prediction-label">
                    <span style="font-size: 1.5rem;">${emotionEmojis[emotion]}</span>
                    <span>${emotion}</span>
                </div>
                <div class="prediction-value">${(confidence * 100).toFixed(1)}%</div>
            </div>
            <div class="prediction-bar">
                <div class="prediction-fill" style="width: ${confidence * 100}%"></div>
            </div>
        `;
        predictionsContainer.appendChild(item);
    });

    predictionsList.style.display = 'block';
    resetBtn.style.display = 'block';
}