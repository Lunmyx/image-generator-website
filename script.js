document.addEventListener('DOMContentLoaded', () => {
    // --- Core Elements ---
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const promptInput = document.getElementById('prompt');
    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');
    const seedInput = document.getElementById('seed');
    const imageContainer = document.getElementById('imageContainer');
    
    // UI State Elements (Loading text vs Spinner)
    const btnText = document.querySelector('.btn-text');
    const btnLoader = document.querySelector('.btn-loader');

    // --- NEW: The Quality Selector ---
    // We grab this element to see which model user wants (Turbo, Flux, etc.)
    const pollinationsModelSelect = document.getElementById('pollinationsModel');

    // --- Event Listeners ---
    generateBtn.addEventListener('click', generateImage);
    downloadBtn.addEventListener('click', downloadImage);

    // Allow "Enter" key in textarea to generate
    promptInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            generateImage();
        }
    });

    async function generateImage() {
        // 1. Get User Inputs
        const prompt = promptInput.value.trim();
        
        if (!prompt) {
            alert('Please describe the image you want to generate!');
            return;
        }

        // 2. Get Image Settings
        const width = widthInput.value || 1024;
        const height = heightInput.value || 1024;
        // If user enters a seed, use it. Otherwise, random number.
        const seed = seedInput.value ? seedInput.value : Math.floor(Math.random() * 1000000);
        
        // 3. Get Selected Model (Quality)
        // This reads the value from your new HTML dropdown
        const modelQuality = pollinationsModelSelect.value;

        // 4. Show Loading State
        generateBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline';
        imageContainer.innerHTML = '<p style="text-align:center; color:#888;">Generating AI art... please wait.</p>';

        try {
            // 5. Construct the Pollinations URL
            // We encode the prompt so spaces and symbols work in the URL
            const encodedPrompt = encodeURIComponent(prompt);
            
            // We add '&model=' to the URL to tell Pollinations which engine to use
            const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=${modelQuality}&nologo=true`;
            
            // 6. Load the Image
            const img = new Image();
            img.crossOrigin = 'anonymous'; // Required for the download button to work
            img.alt = prompt;
            
            img.onload = () => {
                // Success: Show image
                imageContainer.innerHTML = '';
                imageContainer.appendChild(img);
                downloadBtn.style.display = 'block'; // Show download button
                
                // Reset Button
                generateBtn.disabled = false;
                btnText.style.display = 'inline';
                btnLoader.style.display = 'none';
            };
            
            img.onerror = () => {
                // Error: Failed to load image (network issue or bad prompt)
                throw new Error('Failed to load image. Please try a different prompt or check your internet.');
            };
            
            // Start loading the image source
            img.src = imageUrl;
            
        } catch (error) {
            console.error(error);
            imageContainer.innerHTML = `<p style="color: #dc3545;">Error: ${error.message}</p>`;
            downloadBtn.style.display = 'none';
            
            // Reset Button
            generateBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    }

    function downloadImage() {
        const img = imageContainer.querySelector('img');
        if (!img) return;

        // We use a Canvas to save the image
        // This bypasses some browser security issues with downloading from other domains
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        ctx.drawImage(img, 0, 0);
        
        // Convert to blob and trigger download
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            // Create filename based on the model used and timestamp
            const modelName = document.getElementById('pollinationsModel').value;
            a.download = `${modelName}-art-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 'image/png');
    }
});