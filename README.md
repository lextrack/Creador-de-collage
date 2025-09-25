# Creador de Collage

Una aplicación web simple para crear collages con imágenes. Perfecto para organizar capturas de páginas de forma visual e interactiva.

## 🚀 Características

- **Carga múltiple de imágenes**: Selecciona y carga varias imágenes a la vez
- **Arrastrar y soltar**: Mueve las imágenes por el lienzo arrastrándolas (y dale al botón de ordenar aleatoriamente)
- **Redimensionar**: Cambia el tamaño de las imágenes usando el control en la esquina
- **Grid variado**: 6 tamaños de grid diferentes con snap automático
- **Plantillas para forma**: Plantillas para organizar las fotos con formas básicas
- **Colores de fondo**: Personaliza el color de fondo del lienzo
- **Exportar PNG**: Exporta solo la zona con imágenes, sin espacios en blanco

## 📋 Cómo usar

### Cargar imágenes
1. Haz clic en "Elegir archivos"
2. Selecciona una o múltiples imágenes
3. Las imágenes aparecerán automáticamente en el lienzo

### Organizar el collage
- **Mover**: Arrastra cualquier imagen para cambiar su posición
- **Redimensionar**: Usa el cuadrito azul en la esquina inferior derecha
- **Seleccionar**: Haz clic en una imagen para seleccionarla (borde rojo)
- **Eliminar**: Haz clic en la X roja de la imagen seleccionada

### Herramientas disponibles

| Herramienta | Descripción |
|-------------|-------------|
| **Limpiar Todo** | Elimina todas las imágenes del lienzo |
| **Posiciones Aleatorias** | Reorganiza todas las imágenes aleatoriamente |
| **Exportar PNG** | Descarga el collage como imagen PNG |
| **Color de fondo** | Selector de color para el fondo del lienzo |
| **Grid** | 7 opciones: Sin Grid, 5px, 10px, 20px, 40px, 60px, 80px y tipo hoja|

### Opciones de Grid

El grid ayuda a alinear las imágenes de forma precisa:

- **Sin Grid**: Movimiento libre
- **5px - 80px**: Diferentes tamaños de cuadrícula con snap automático
- **Hoja**: Para mayor atención en posiciones verticales

Cuando seleccionas un grid, las imágenes se "pegan" automáticamente a la cuadrícula al moverlas.

## 💾 Exportar

Al hacer clic en "Exportar PNG":
- Solo se exporta la zona que contiene imágenes
- Se añade un pequeño margen alrededor
- El fondo conserva el color seleccionado
- Se descarga automáticamente como `collage-comics.png`
