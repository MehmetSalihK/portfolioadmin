import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiRotateCw, FiZoomIn, FiZoomOut, FiSave, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageCropperProps {
  imageUrl: string;
  imageId: string;
  onClose: () => void;
  onSave: (croppedImageUrl: string) => void;
}

const PRESET_RATIOS = [
  { label: 'Libre', value: null },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4/3 },
  { label: '16:9', value: 16/9 },
  { label: '3:2', value: 3/2 },
  { label: '2:3', value: 2/3 },
];

const PRESET_SIZES = [
  { label: 'Original', width: null, height: null },
  { label: 'Thumbnail (150x150)', width: 150, height: 150 },
  { label: 'Small (300x300)', width: 300, height: 300 },
  { label: 'Medium (600x400)', width: 600, height: 400 },
  { label: 'Large (1200x800)', width: 1200, height: 800 },
  { label: 'HD (1920x1080)', width: 1920, height: 1080 },
];

export default function ImageCropper({ imageUrl, imageId, onClose, onSave }: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string>('');
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // État de l'image
  const [imageState, setImageState] = useState({
    scale: 1,
    rotation: 0,
    offsetX: 0,
    offsetY: 0,
  });
  
  // Zone de recadrage
  const [cropArea, setCropArea] = useState<CropArea>({
    x: 50,
    y: 50,
    width: 200,
    height: 200,
  });
  
  // Options
  const [selectedRatio, setSelectedRatio] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState<{ width: number | null; height: number | null }>({ width: null, height: null });
  const [quality, setQuality] = useState(0.9);
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
  const [saveAsNew, setSaveAsNew] = useState(true);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !imageLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Sauvegarder l'état du contexte
    ctx.save();
    
    // Centrer l'image
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Appliquer les transformations
    ctx.translate(centerX + imageState.offsetX, centerY + imageState.offsetY);
    ctx.rotate((imageState.rotation * Math.PI) / 180);
    ctx.scale(imageState.scale, imageState.scale);
    
    // Dessiner l'image
    const imageWidth = image.naturalWidth;
    const imageHeight = image.naturalHeight;
    ctx.drawImage(image, -imageWidth / 2, -imageHeight / 2, imageWidth, imageHeight);
    
    // Restaurer l'état du contexte
    ctx.restore();
    
    // Dessiner la zone de recadrage
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
    
    // Dessiner l'overlay sombre
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.clearRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
    
    // Dessiner les poignées de redimensionnement
    const handleSize = 8;
    ctx.fillStyle = '#3b82f6';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    
    // Poignées aux coins
    const handles = [
      { x: cropArea.x - handleSize/2, y: cropArea.y - handleSize/2, cursor: 'nw-resize' },
      { x: cropArea.x + cropArea.width - handleSize/2, y: cropArea.y - handleSize/2, cursor: 'ne-resize' },
      { x: cropArea.x - handleSize/2, y: cropArea.y + cropArea.height - handleSize/2, cursor: 'sw-resize' },
      { x: cropArea.x + cropArea.width - handleSize/2, y: cropArea.y + cropArea.height - handleSize/2, cursor: 'se-resize' },
    ];
    
    handles.forEach(handle => {
      ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
      ctx.strokeRect(handle.x, handle.y, handleSize, handleSize);
    });
  }, [imageLoaded, imageState, cropArea]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;
    
    // Ajuster la taille du canvas
    const maxWidth = 800;
    const maxHeight = 600;
    const scale = Math.min(maxWidth / image.naturalWidth, maxHeight / image.naturalHeight, 1);
    
    canvas.width = image.naturalWidth * scale;
    canvas.height = image.naturalHeight * scale;
    
    // Centrer la zone de recadrage
    setCropArea({
      x: canvas.width / 4,
      y: canvas.height / 4,
      width: canvas.width / 2,
      height: canvas.height / 2,
    });
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const getResizeHandle = (x: number, y: number) => {
    const handleSize = 8;
    const tolerance = 5;
    
    // Vérifier les poignées de coin
    if (Math.abs(x - cropArea.x) <= tolerance && Math.abs(y - cropArea.y) <= tolerance) return 'nw';
    if (Math.abs(x - (cropArea.x + cropArea.width)) <= tolerance && Math.abs(y - cropArea.y) <= tolerance) return 'ne';
    if (Math.abs(x - cropArea.x) <= tolerance && Math.abs(y - (cropArea.y + cropArea.height)) <= tolerance) return 'sw';
    if (Math.abs(x - (cropArea.x + cropArea.width)) <= tolerance && Math.abs(y - (cropArea.y + cropArea.height)) <= tolerance) return 'se';
    
    return null;
  };

  const isInsideCropArea = (x: number, y: number) => {
    return x >= cropArea.x && x <= cropArea.x + cropArea.width &&
           y >= cropArea.y && y <= cropArea.y + cropArea.height;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    const handle = getResizeHandle(pos.x, pos.y);
    
    if (handle) {
      setIsResizing(true);
      setResizeHandle(handle);
    } else if (isInsideCropArea(pos.x, pos.y)) {
      setIsDragging(true);
    }
    
    setDragStart(pos);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    if (isResizing && resizeHandle) {
      const deltaX = pos.x - dragStart.x;
      const deltaY = pos.y - dragStart.y;
      
      setCropArea(prev => {
        let newCrop = { ...prev };
        
        switch (resizeHandle) {
          case 'nw':
            newCrop.x = Math.max(0, prev.x + deltaX);
            newCrop.y = Math.max(0, prev.y + deltaY);
            newCrop.width = Math.max(20, prev.width - deltaX);
            newCrop.height = Math.max(20, prev.height - deltaY);
            break;
          case 'ne':
            newCrop.y = Math.max(0, prev.y + deltaY);
            newCrop.width = Math.max(20, Math.min(canvas.width - prev.x, prev.width + deltaX));
            newCrop.height = Math.max(20, prev.height - deltaY);
            break;
          case 'sw':
            newCrop.x = Math.max(0, prev.x + deltaX);
            newCrop.width = Math.max(20, prev.width - deltaX);
            newCrop.height = Math.max(20, Math.min(canvas.height - prev.y, prev.height + deltaY));
            break;
          case 'se':
            newCrop.width = Math.max(20, Math.min(canvas.width - prev.x, prev.width + deltaX));
            newCrop.height = Math.max(20, Math.min(canvas.height - prev.y, prev.height + deltaY));
            break;
        }
        
        // Appliquer le ratio si sélectionné
        if (selectedRatio) {
          if (resizeHandle.includes('e')) {
            newCrop.height = newCrop.width / selectedRatio;
          } else {
            newCrop.width = newCrop.height * selectedRatio;
          }
        }
        
        return newCrop;
      });
      
      setDragStart(pos);
    } else if (isDragging) {
      const deltaX = pos.x - dragStart.x;
      const deltaY = pos.y - dragStart.y;
      
      setCropArea(prev => ({
        ...prev,
        x: Math.max(0, Math.min(canvas.width - prev.width, prev.x + deltaX)),
        y: Math.max(0, Math.min(canvas.height - prev.height, prev.y + deltaY)),
      }));
      
      setDragStart(pos);
    } else {
      // Changer le curseur selon la position
      const handle = getResizeHandle(pos.x, pos.y);
      if (handle) {
        canvas.style.cursor = `${handle}-resize`;
      } else if (isInsideCropArea(pos.x, pos.y)) {
        canvas.style.cursor = 'move';
      } else {
        canvas.style.cursor = 'default';
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle('');
  };

  const handleZoom = (delta: number) => {
    setImageState(prev => ({
      ...prev,
      scale: Math.max(0.1, Math.min(3, prev.scale + delta)),
    }));
  };

  const handleRotate = () => {
    setImageState(prev => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360,
    }));
  };

  const handleReset = () => {
    setImageState({
      scale: 1,
      rotation: 0,
      offsetX: 0,
      offsetY: 0,
    });
    
    const canvas = canvasRef.current;
    if (canvas) {
      setCropArea({
        x: canvas.width / 4,
        y: canvas.height / 4,
        width: canvas.width / 2,
        height: canvas.height / 2,
      });
    }
  };

  const handleRatioChange = (ratio: number | null) => {
    setSelectedRatio(ratio);
    if (ratio) {
      setCropArea(prev => ({
        ...prev,
        height: prev.width / ratio,
      }));
    }
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;
    
    setIsLoading(true);
    
    try {
      // Créer un canvas temporaire pour le recadrage
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) throw new Error('Cannot get canvas context');
      
      // Calculer les dimensions finales
      const finalWidth = selectedSize.width || cropArea.width;
      const finalHeight = selectedSize.height || cropArea.height;
      
      tempCanvas.width = finalWidth;
      tempCanvas.height = finalHeight;
      
      // Calculer les coordonnées de la zone recadrée dans l'image originale
      const scaleX = image.naturalWidth / canvas.width;
      const scaleY = image.naturalHeight / canvas.height;
      
      const sourceX = cropArea.x * scaleX;
      const sourceY = cropArea.y * scaleY;
      const sourceWidth = cropArea.width * scaleX;
      const sourceHeight = cropArea.height * scaleY;
      
      // Dessiner l'image recadrée
      tempCtx.drawImage(
        image,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, finalWidth, finalHeight
      );
      
      // Convertir en blob
      const blob = await new Promise<Blob>((resolve) => {
        tempCanvas.toBlob((blob) => {
          resolve(blob!);
        }, `image/${format}`, quality);
      });
      
      // Envoyer à l'API
      const formData = new FormData();
      formData.append('file', blob, `cropped-${Date.now()}.${format}`);
      formData.append('originalId', imageId);
      formData.append('saveAsNew', saveAsNew.toString());
      formData.append('cropData', JSON.stringify({
        x: sourceX,
        y: sourceY,
        width: sourceWidth,
        height: sourceHeight,
        finalWidth,
        finalHeight,
        quality,
        format,
      }));
      
      const response = await fetch('/api/media/crop', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to crop image');
      }
      
      const result = await response.json();
      toast.success('Image recadrée avec succès');
      onSave(result.url);
      onClose();
    } catch (error) {
      console.error('Error cropping image:', error);
      toast.error('Erreur lors du recadrage');
    } finally {
      setIsLoading(false);
    }
  };

  // Redessiner le canvas quand nécessaire
  React.useEffect(() => {
    if (imageLoaded) {
      drawCanvas();
    }
  }, [drawCanvas, imageLoaded]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Recadrer l'image
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Zone de recadrage */}
          <div className="flex-1 flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-900">
            <div className="relative">
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg"
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imageRef}
                src={imageUrl}
                onLoad={handleImageLoad}
                className="hidden"
                alt="Image à recadrer"
              />
            </div>
          </div>

          {/* Panneau de contrôles */}
          <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
            <div className="space-y-6">
              {/* Contrôles de l'image */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Contrôles
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleZoom(0.1)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <FiZoomIn />
                    Zoom +
                  </button>
                  <button
                    onClick={() => handleZoom(-0.1)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <FiZoomOut />
                    Zoom -
                  </button>
                  <button
                    onClick={handleRotate}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <FiRotateCw />
                    Rotation
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <FiRefreshCw />
                    Reset
                  </button>
                </div>
              </div>

              {/* Ratios prédéfinis */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Ratio d'aspect
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_RATIOS.map((ratio) => (
                    <button
                      key={ratio.label}
                      onClick={() => handleRatioChange(ratio.value)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedRatio === ratio.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {ratio.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tailles prédéfinies */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Taille de sortie
                </h3>
                <select
                  value={`${selectedSize.width}-${selectedSize.height}`}
                  onChange={(e) => {
                    const [width, height] = e.target.value.split('-');
                    setSelectedSize({
                      width: width === 'null' ? null : parseInt(width),
                      height: height === 'null' ? null : parseInt(height),
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {PRESET_SIZES.map((size) => (
                    <option key={size.label} value={`${size.width}-${size.height}`}>
                      {size.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Options d'export */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Options d'export
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Format
                    </label>
                    <select
                      value={format}
                      onChange={(e) => setFormat(e.target.value as 'jpeg' | 'png' | 'webp')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="jpeg">JPEG</option>
                      <option value="png">PNG</option>
                      <option value="webp">WebP</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Qualité: {Math.round(quality * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={quality}
                      onChange={(e) => setQuality(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="saveAsNew"
                      checked={saveAsNew}
                      onChange={(e) => setSaveAsNew(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="saveAsNew" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Sauvegarder comme nouveau fichier
                    </label>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={isLoading || !imageLoaded}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <FiSave />
                  )}
                  {isLoading ? 'Traitement...' : 'Sauvegarder'}
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}