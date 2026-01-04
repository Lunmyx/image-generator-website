document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const promptInput = document.getElementById('prompt');
    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');
    const seedInput = document.getElementById('seed');
    const imageContainer = document.getElementById('imageContainer');
    const btnText = document.querySelector('.btn-text');
    const btnLoader = document.querySelector('.btn-loader');

    generateBtn.addEventListener('click', generateImage);
    downloadBtn.addEventListener('click', downloadImage);
    promptInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            generateImage();
        }
    });

    async function generateImage() {
        const prompt = promptInput.value.trim();
        
        if (!prompt) {
            alert('Please enter a prompt to generate an image');
            return;
        }

        // Get parameters
        const width = parseInt(widthInput.value) || 1024;
        const height = parseInt(heightInput.value) || 1024;
        const seed = seedInput.value ? parseInt(seedInput.value) : Math.floor(Math.random() * 1000000);

        // Show loading state
        generateBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline';
        imageContainer.innerHTML = '<div class="loader"></div><p style="margin-top: 10px;">Generating your image...</p>';

        try {
            // Construct Pollinations.ai URL
            const encodedPrompt = encodeURIComponent(prompt);
            const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
            
            // Create new image
            const img = new Image();
            img.crossOrigin = 'anonymous'; // Allow cross-origin for download
            img.alt = prompt;
            
            img.onload = () => {
                imageContainer.innerHTML = '';
                imageContainer.appendChild(img);
                downloadBtn.style.display = 'block';
                
                // Reset button state
                generateBtn.disabled = false;
                btnText.style.display = 'inline';
                btnLoader.style.display = 'none';
            };
            
            img.onerror = () => {
                throw new Error('Failed to generate image');
            };
            
            // Load image
            img.src = imageUrl;
            
        } catch (error) {
            console.error('Error generating image:', error);
            imageContainer.innerHTML = `
                <p style="color: #dc3545;">Failed to generate image. Please try again.</p>
            `;
            downloadBtn.style.display = 'none';
            
            // Reset button state
            generateBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    }

    function downloadImage() {
        const img = imageContainer.querySelector('img');
        if (!img) return;

        // Create canvas to convert image to blob
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        ctx.drawImage(img, 0, 0);
        
        // Convert to blob and download
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ai-image-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 'image/png');
    }
});