let imageCounter = 0;
let selectedCard = null;
let isDragging = false;
let isResizing = false;
let dragOffset = { x: 0, y: 0 };
let currentGrid = 'none';
let gridSize = 0;
let resizeDirection = null;

const collageArea = document.getElementById('collageArea');
const imageInput = document.getElementById('imageInput');
const imageCountSpan = document.getElementById('imageCount');

document.addEventListener('keydown', handleKeyDown);

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
            card.tabIndex = 0;
            
            const position = getRandomPosition(img.width, img.height);
            
            card.style.left = position.x + 'px';
            card.style.top = position.y + 'px';
            card.style.width = position.width + 'px';
            card.style.height = position.height + 'px';
            
            card.innerHTML = `
                <img src="${e.target.result}" alt="photo ${imageCounter}">
                <div class="resize-handle nw"></div>
                <div class="resize-handle ne"></div>
                <div class="resize-handle sw"></div>
                <div class="resize-handle se"></div>
                <button class="delete-btn" onclick="deleteCard(this)">×</button>
            `;
            
            card.addEventListener('mousedown', startDrag);
            card.addEventListener('focus', function() {
                selectCard(this);
            });
            
            card.querySelectorAll('.resize-handle').forEach(handle => {
                handle.addEventListener('mousedown', startResize);
            });
            
            collageArea.appendChild(card);
            updateImageCount();
        };
        img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
}

function getRandomPosition(imgWidth, imgHeight) {
    let maxX, maxY, x, y;
    let aspectRatio = imgWidth / imgHeight;
    let width, height;
    
    if (aspectRatio > 1) {
        width = 200;
        height = 200 / aspectRatio;
    } else {
        height = 200;
        width = 200 * aspectRatio;
    }
    
    const navbarHeight = 76;
    
    if (currentGrid === 'letter') {
        const collageRect = collageArea.getBoundingClientRect();
        const pageWidth = 816;
        const pageHeight = 1056;
        
        const marginLeft = (collageRect.width - pageWidth) / 2;
        const marginTop = (collageRect.height - pageHeight) / 2 + navbarHeight;
        
        const padding = 10;
        maxX = marginLeft + pageWidth - width - padding;
        maxY = marginTop + pageHeight - height - padding;
        x = marginLeft + padding + Math.random() * (pageWidth - width - padding * 2);
        y = marginTop + padding + Math.random() * (pageHeight - height - padding * 2);
    } else {
        maxX = collageArea.clientWidth - width;
        maxY = collageArea.clientHeight - height - navbarHeight;
        x = Math.random() * maxX;
        y = navbarHeight + Math.random() * maxY;
    }
    
    return { x, y, width, height };
}

function applyTemplate(template) {
    const cards = document.querySelectorAll('.photo-card');
    if (cards.length === 0) return;

    const collageRect = collageArea.getBoundingClientRect();
    let pageWidth = currentGrid === 'letter' ? 816 : collageRect.width;
    let pageHeight = currentGrid === 'letter' ? 1056 : collageRect.height;
    const navbarHeight = 76;
    const marginLeft = currentGrid === 'letter' ? (collageRect.width - pageWidth) / 2 : 0;
    const marginTop = currentGrid === 'letter' ? (collageRect.height - pageHeight) / 2 + navbarHeight : navbarHeight;
    const padding = 20;

    switch (template) {
        case 'grid':
            const gridSize = Math.ceil(Math.sqrt(cards.length));
            const cardWidth = (pageWidth - padding * (gridSize + 1)) / gridSize;
            const cardHeight = (pageHeight - padding * (gridSize + 1) - navbarHeight) / gridSize;
            cards.forEach((card, index) => {
                const row = Math.floor(index / gridSize);
                const col = index % gridSize;
                card.style.left = marginLeft + padding + col * (cardWidth + padding) + 'px';
                card.style.top = marginTop + padding + row * (cardHeight + padding) + 'px';
                card.style.width = cardWidth + 'px';
                card.style.height = cardHeight + 'px';
                card.style.borderRadius = '0';
                card.style.transform = 'rotate(0deg)';
            });
            break;
        case 'circle':
            const radius = Math.min(pageWidth, pageHeight) / 3;
            const centerX = marginLeft + pageWidth / 2;
            const centerY = marginTop + pageHeight / 2;
            const cardSize = Math.min(pageWidth, pageHeight) / (cards.length > 1 ? 4 : 2);
            cards.forEach((card, index) => {
                const angle = (index / cards.length) * 2 * Math.PI;
                card.style.left = centerX + radius * Math.cos(angle) - cardSize / 2 + 'px';
                card.style.top = centerY + radius * Math.sin(angle) - cardSize / 2 + 'px';
                card.style.width = cardSize + 'px';
                card.style.height = cardSize + 'px';
                card.style.borderRadius = '50%';
                card.style.transform = 'rotate(0deg)';
            });
            break;
        case 'heart':
            const heartRadius = Math.min(pageWidth, pageHeight) / 4;
            const heartCenterX = marginLeft + pageWidth / 2;
            const heartCenterY = marginTop + pageHeight / 2.5;
            const heartCardSize = Math.min(pageWidth, pageHeight) / (cards.length > 1 ? 5 : 3);
            cards.forEach((card, index) => {
                const t = (index / cards.length) * 2 * Math.PI;
                const x = 16 * Math.pow(Math.sin(t), 3);
                const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
                card.style.left = heartCenterX + (x * heartRadius / 20) - heartCardSize / 2 + 'px';
                card.style.top = heartCenterY - (y * heartRadius / 20) - heartCardSize / 2 + 'px';
                card.style.width = heartCardSize + 'px';
                card.style.height = heartCardSize + 'px';
                card.style.borderRadius = '10%';
                card.style.transform = 'rotate(0deg)';
            });
            break;
        case 'layered':
            const layerCardSize = Math.min(pageWidth, pageHeight) / (cards.length > 1 ? 3 : 2);
            cards.forEach((card, index) => {
                card.style.left = marginLeft + padding + index * 20 + 'px';
                card.style.top = marginTop + padding + index * 20 + 'px';
                card.style.width = layerCardSize + 'px';
                card.style.height = layerCardSize + 'px';
                card.style.borderRadius = '5px';
                card.style.transform = `rotate(${(index % 2 ? 5 : -5)}deg)`;
                card.style.zIndex = index;
            });
            break;
        default:
            cards.forEach(card => {
                card.style.borderRadius = '0';
                card.style.transform = 'rotate(0deg)';
            });
            break;
    }
}

function handleKeyDown(e) {
    if (!selectedCard) return;
    
    switch(e.key) {
        case 'Delete':
        case 'Suprimir':
            deleteSelectedCard();
            break;
        case 'ArrowUp':
            moveSelectedCard(0, -1);
            e.preventDefault();
            break;
        case 'ArrowDown':
            moveSelectedCard(0, 1);
            e.preventDefault();
            break;
        case 'ArrowLeft':
            moveSelectedCard(-1, 0);
            e.preventDefault();
            break;
        case 'ArrowRight':
            moveSelectedCard(1, 0);
            e.preventDefault();
            break;
    }
}

function deleteSelectedCard() {
    if (selectedCard) {
        selectedCard.remove();
        selectedCard = null;
        updateImageCount();
    }
}

function moveSelectedCard(deltaX, deltaY) {
    if (!selectedCard) return;
    
    const currentX = parseInt(selectedCard.style.left) || 0;
    const currentY = parseInt(selectedCard.style.top) || 0;
    const step = currentGrid !== 'none' && gridSize > 0 ? gridSize : 1;
    
    let newX = currentX + (deltaX * step);
    let newY = currentY + (deltaY * step);
    
    if (currentGrid === 'letter') {
        const collageRect = collageArea.getBoundingClientRect();
        const pageWidth = 816;
        const pageHeight = 1056;
        const marginLeft = (collageRect.width - pageWidth) / 2;
        const marginTop = (collageRect.height - pageHeight) / 2;
        const padding = 10;
        
        newX = Math.max(marginLeft + padding, 
                       Math.min(newX, marginLeft + pageWidth - selectedCard.clientWidth - padding));
        newY = Math.max(marginTop + padding, 
                       Math.min(newY, marginTop + pageHeight - selectedCard.clientHeight - padding));
    } else {
        newX = Math.max(0, Math.min(newX, collageArea.clientWidth - selectedCard.clientWidth));
        newY = Math.max(76, Math.min(newY, collageArea.clientHeight - selectedCard.clientHeight));
    }
    
    selectedCard.style.left = newX + 'px';
    selectedCard.style.top = newY + 'px';
}

function selectCard(card) {
    document.querySelectorAll('.photo-card').forEach(c => {
        c.classList.remove('selected');
    });
    card.classList.add('selected');
    selectedCard = card;
}

function startDrag(e) {
    if (e.target.classList.contains('resize-handle') || e.target.classList.contains('delete-btn')) {
        return;
    }
    
    e.preventDefault();
    isDragging = true;
    selectCard(e.currentTarget);
    
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
    
    if (currentGrid === 'letter') {
        const pageWidth = 816;
        const pageHeight = 1056;
        const marginLeft = (collageRect.width - pageWidth) / 2;
        const marginTop = (collageRect.height - pageHeight) / 2;
        const padding = 10;
        
        x = Math.max(marginLeft + padding, 
                    Math.min(x, marginLeft + pageWidth - selectedCard.clientWidth - padding));
        y = Math.max(marginTop + padding, 
                    Math.min(y, marginTop + pageHeight - selectedCard.clientHeight - padding));
    } else {
        x = Math.max(0, Math.min(x, collageArea.clientWidth - selectedCard.clientWidth));
        y = Math.max(76, Math.min(y, collageArea.clientHeight - selectedCard.clientHeight));
    }
    
    if (currentGrid !== 'none' && currentGrid !== 'letter' && gridSize > 0) {
        x = Math.round(x / gridSize) * gridSize;
        y = Math.round(y / gridSize) * gridSize;
    }
    
    selectedCard.style.left = x + 'px';
    selectedCard.style.top = y + 'px';
}

function stopDrag() {
    isDragging = false;
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);
}

function startResize(e) {
    e.preventDefault();
    e.stopPropagation();
    isResizing = true;
    resizeDirection = e.target.classList[1];
    selectCard(e.target.parentElement);
    
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
}

function resize(e) {
    if (!isResizing || !selectedCard) return;
    
    const rect = selectedCard.getBoundingClientRect();
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    let newWidth = rect.width;
    let newHeight = rect.height;
    let newLeft = parseInt(selectedCard.style.left) || 0;
    let newTop = parseInt(selectedCard.style.top) || 0;
    
    switch(resizeDirection) {
        case 'nw':
            newWidth = rect.right - mouseX;
            newHeight = rect.bottom - mouseY;
            newLeft = mouseX - collageArea.getBoundingClientRect().left;
            newTop = mouseY - collageArea.getBoundingClientRect().top;
            break;
        case 'ne': 
            newWidth = mouseX - rect.left;
            newHeight = rect.bottom - mouseY;
            newTop = mouseY - collageArea.getBoundingClientRect().top;
            break;
        case 'sw':
            newWidth = rect.right - mouseX;
            newHeight = mouseY - rect.top;
            newLeft = mouseX - collageArea.getBoundingClientRect().left;
            break;
        case 'se':
            newWidth = mouseX - rect.left;
            newHeight = mouseY - rect.top;
            break;
    }
    
    if (currentGrid === 'letter') {
        const collageRect = collageArea.getBoundingClientRect();
        const pageWidth = 816;
        const pageHeight = 1056;
        const marginLeft = (collageRect.width - pageWidth) / 2;
        const marginTop = (collageRect.height - pageHeight) / 2;
        const padding = 10;
        
        if (resizeDirection === 'nw' || resizeDirection === 'sw') {
            newLeft = Math.max(marginLeft + padding, newLeft);
        }
        if (resizeDirection === 'nw' || resizeDirection === 'ne') {
            newTop = Math.max(marginTop + padding, newTop);
        }
        
        const maxRight = marginLeft + pageWidth - padding;
        const maxBottom = marginTop + pageHeight - padding;
        
        if (newLeft + newWidth > maxRight) {
            newWidth = maxRight - newLeft;
        }
        if (newTop + newHeight > maxBottom) {
            newHeight = maxBottom - newTop;
        }
    }
    
    if (newWidth > 50 && newHeight > 50) {
        selectedCard.style.width = newWidth + 'px';
        selectedCard.style.height = newHeight + 'px';
        
        if (resizeDirection === 'nw' || resizeDirection === 'ne') {
            selectedCard.style.top = newTop + 'px';
        }
        if (resizeDirection === 'nw' || resizeDirection === 'sw') {
            selectedCard.style.left = newLeft + 'px';
        }
    }
}

function stopResize() {
    isResizing = false;
    resizeDirection = null;
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResize);
}

function deleteCard(button) {
    const card = button.parentElement;
    if (card) {
        if (card === selectedCard) {
            selectedCard = null;
        }
        card.remove();
        updateImageCount();
    }
}

function clearCollage() {
    if (confirm('¿Estás seguro de que quieres eliminar todas las imágenes?')) {
        collageArea.innerHTML = '';
        imageCounter = 0;
        selectedCard = null;
        updateImageCount();
    }
}

function randomizePositions() {
    const cards = document.querySelectorAll('.photo-card');
    cards.forEach(card => {
        const img = card.querySelector('img');
        const position = getRandomPosition(img.naturalWidth, img.naturalHeight);
        
        card.style.left = position.x + 'px';
        card.style.top = position.y + 'px';
        card.style.borderRadius = '0';
        card.style.transform = 'rotate(0deg)';
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
            ctx.save();
            const rotate = parseFloat(card.style.transform.replace('rotate(', '').replace('deg)', '')) || 0;
            if (rotate !== 0) {
                ctx.translate(x + w / 2, y + h / 2);
                ctx.rotate(rotate * Math.PI / 180);
                ctx.drawImage(canvasImg, -w / 2, -h / 2, w, h);
            } else {
                ctx.drawImage(canvasImg, x, y, w, h);
            }
            ctx.restore();
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
        selectedCard = null;
    }
});

document.addEventListener('dragover', e => e.preventDefault());
document.addEventListener('drop', e => e.preventDefault());