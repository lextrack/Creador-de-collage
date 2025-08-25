let imageCounter = 0;
let selectedCard = null;
let isDragging = false;
let isResizing = false;
let dragOffset = { x: 0, y: 0 };
let currentGrid = 'none';
let gridSize = 0;

const collageArea = document.getElementById('collageArea');
const imageInput = document.getElementById('imageInput');
const imageCountSpan = document.getElementById('imageCount');

imageInput.addEventListener('change', function(e) {
    const files = e.target.files;
    for (let file of files) {
        if (file.type.startsWith('image/')) {
            createphotoCard(file);
        }
    }
    e.target.value = '';
});

function createphotoCard(file) {
    imageCounter++;
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const card = document.createElement('div');
            card.className = 'photo-card';
            card.id = `card${imageCounter}`;
            
            const maxX = collageArea.clientWidth - 200;
            const maxY = collageArea.clientHeight - 200;
            const x = Math.random() * maxX;
            const y = Math.random() * maxY;
            
            const aspectRatio = img.width / img.height;
            let cardWidth, cardHeight;
            
            if (aspectRatio > 1) {
                cardWidth = 200;
                cardHeight = 200 / aspectRatio;
            } else {
                cardHeight = 200;
                cardWidth = 200 * aspectRatio;
            }
            
            card.style.left = x + 'px';
            card.style.top = y + 'px';
            card.style.width = cardWidth + 'px';
            card.style.height = cardHeight + 'px';
            
            card.innerHTML = `
                <img src="${e.target.result}" alt="photo ${imageCounter}">
                <div class="resize-handle"></div>
                <button class="delete-btn" onclick="deleteCard(this)">×</button>
            `;
            
            card.addEventListener('mousedown', startDrag);
            card.querySelector('.resize-handle').addEventListener('mousedown', startResize);
            
            collageArea.appendChild(card);
            updateImageCount();
        };
        img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
}

function startDrag(e) {
    if (e.target.classList.contains('resize-handle') || e.target.classList.contains('delete-btn')) {
        return;
    }
    
    e.preventDefault();
    isDragging = true;
    selectedCard = e.currentTarget;
    
    document.querySelectorAll('.photo-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    selectedCard.classList.add('selected');
    
    const rect = selectedCard.getBoundingClientRect();
    
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
}

function drag(e) {
    if (!isDragging || !selectedCard) return;
    
    const collageRect = collageArea.getBoundingClientRect();
    let x = e.clientX - collageRect.left - dragOffset.x;
    let y = e.clientY - collageRect.top - dragOffset.y;
    
    x = Math.max(0, Math.min(x, collageArea.clientWidth - selectedCard.clientWidth));
    y = Math.max(0, Math.min(y, collageArea.clientHeight - selectedCard.clientHeight));
    
    if (currentGrid !== 'none' && currentGrid !== 'letter' && gridSize > 0) {
        x = Math.round(x / gridSize) * gridSize;
        y = Math.round(y / gridSize) * gridSize;
    }
    
    selectedCard.style.left = x + 'px';
    selectedCard.style.top = y + 'px';
}

function stopDrag() {
    isDragging = false;
    selectedCard = null;
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);
}

function startResize(e) {
    e.preventDefault();
    e.stopPropagation();
    isResizing = true;
    selectedCard = e.target.parentElement;
    
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
}

function resize(e) {
    if (!isResizing || !selectedCard) return;
    
    const rect = selectedCard.getBoundingClientRect();
    const width = e.clientX - rect.left;
    const height = e.clientY - rect.top;
    
    if (width > 50 && height > 50) {
        selectedCard.style.width = width + 'px';
        selectedCard.style.height = height + 'px';
    }
}

function stopResize() {
    isResizing = false;
    selectedCard = null;
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResize);
}

function deleteCard(button) {
    const card = button.parentElement;
    if (card) {
        card.remove();
        updateImageCount();
    }
}

function clearCollage() {
    if (confirm('¿Estás seguro de que quieres eliminar todas las imágenes?')) {
        collageArea.innerHTML = '';
        imageCounter = 0;
        updateImageCount();
    }
}

function randomizePositions() {
    const cards = document.querySelectorAll('.photo-card');
    cards.forEach(card => {
        const maxX = collageArea.clientWidth - card.clientWidth;
        const maxY = collageArea.clientHeight - card.clientHeight;
        const x = Math.random() * maxX;
        const y = Math.random() * maxY;
        
        card.style.left = x + 'px';
        card.style.top = y + 'px';
    });
}

function changeBackground(color) {
    collageArea.style.backgroundColor = color;
}

function changeGrid(gridType) {
    collageArea.classList.remove('grid-tiny', 'grid-small', 'grid-medium', 'grid-large', 'grid-xlarge', 'grid-xxlarge', 'grid-letter');
    
    currentGrid = gridType;
    
    switch(gridType) {
        case 'tiny':
            collageArea.classList.add('grid-tiny');
            gridSize = 5;
            break;
        case 'small':
            collageArea.classList.add('grid-small');
            gridSize = 10;
            break;
        case 'medium':
            collageArea.classList.add('grid-medium');
            gridSize = 20;
            break;
        case 'large':
            collageArea.classList.add('grid-large');
            gridSize = 40;
            break;
        case 'xlarge':
            collageArea.classList.add('grid-xlarge');
            gridSize = 60;
            break;
        case 'xxlarge':
            collageArea.classList.add('grid-xxlarge');
            gridSize = 80;
            break;
        case 'letter':
            collageArea.classList.add('grid-letter');
            gridSize = 0;
            break;
        default:
            gridSize = 0;
            break;
    }
}

function exportPNG() {
    const cards = document.querySelectorAll('.photo-card');
    if (cards.length === 0) {
        alert('No hay imágenes para exportar');
        return;
    }
    
    let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;
    
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const collageRect = collageArea.getBoundingClientRect();
        
        const x = rect.left - collageRect.left;
        const y = rect.top - collageRect.top;
        const right = x + rect.width;
        const bottom = y + rect.height;
        
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, right);
        maxY = Math.max(maxY, bottom);
    });
    
    const padding = 20;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = maxX + padding;
    maxY = maxY + padding;
    
    const width = maxX - minX;
    const height = maxY - minY;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    
    const bgColor = collageArea.style.backgroundColor || 'white';
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
    
    let loadedImages = 0;
    const totalImages = cards.length;
    
    cards.forEach(card => {
        const img = card.querySelector('img');
        const cardRect = card.getBoundingClientRect();
        const collageRect = collageArea.getBoundingClientRect();
        
        const x = (cardRect.left - collageRect.left) - minX;
        const y = (cardRect.top - collageRect.top) - minY;
        const w = cardRect.width;
        const h = cardRect.height;
        
        const canvasImg = new Image();
        canvasImg.onload = function() {
            ctx.drawImage(canvasImg, x, y, w, h);
            loadedImages++;
            
            if (loadedImages === totalImages) {
                canvas.toBlob(function(blob) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'collage-photo.png';
                    a.click();
                    URL.revokeObjectURL(url);
                }, 'image/png');
            }
        };
        canvasImg.src = img.src;
    });
}

function updateImageCount() {
    const count = document.querySelectorAll('.photo-card').length;
    imageCountSpan.textContent = count;
}

collageArea.addEventListener('click', function(e) {
    if (e.target === collageArea) {
        document.querySelectorAll('.photo-card').forEach(card => {
            card.classList.remove('selected');
        });
    }
});

document.addEventListener('dragover', e => e.preventDefault());
document.addEventListener('drop', e => e.preventDefault());