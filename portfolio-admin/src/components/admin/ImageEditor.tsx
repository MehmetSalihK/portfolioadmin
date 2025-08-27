import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ScissorsIcon,
  ArrowsPointingOutIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  PhotoIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';

interface ImageEditorProps {
  imageUrl: string;
  onSave: (editedImageData: {
    blob: Blob;
    dimensions: { width: number; height: number };
    operations: string[];
  }) => void;
  onCancel: () => void;
  maxWidth?: number;
  maxHeight?: number;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ResizeSettings {
  width: number;
  height: number;
  maintainAspectRatio: boolean;
}

const ImageEditor: React.FC<ImageEditorProps> = ({
  imageUrl,
  onSave,
  onCancel,
  maxWidth = 2000,
  maxHeight = 2000,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [mode, setMode] = useState<'crop' | 'resize' | 'adjust'>('crop');
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeSettings, setResizeSettings] = useState<ResizeSettings>({
    width: 0,
    height: 0,
    maintainAspectRatio: true,
  });
  const [adjustments, setAdjustments] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
  });
  const [operations, setOperations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger l'image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImage(img);
      setCropArea({
        x: 0,
        y: 0,
        width: img.width,
        height: img.height,
      });
      setResizeSettings({
        width: img.width,
        height: img.height,
        maintainAspectRatio: true,
      });
      setLoading(false);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Dessiner l'image sur le canvas
  const drawImage = useCallback(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculer les dimensions d'affichage
    const containerWidth = canvas.parentElement?.clientWidth || 800;
    const containerHeight = canvas.parentElement?.clientHeight || 600;
    const scale = Math.min(
      containerWidth / image.width,
      containerHeight / image.height,
      1
    );

    const displayWidth = image.width * scale;
    const displayHeight = image.height * scale;

    canvas.width = displayWidth;
    canvas.height = displayHeight;

    // Appliquer les filtres
    ctx.filter = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%) blur(${adjustments.blur}px)`;

    // Dessiner l'image
    ctx.drawImage(image, 0, 0, displayWidth, displayHeight);

    // Dessiner la zone de recadrage si en mode crop
    if (mode === 'crop') {
      const cropX = (cropArea.x / image.width) * displayWidth;
      const cropY = (cropArea.y / image.height) * displayHeight;
      const cropW = (cropArea.width / image.width) * displayWidth;
      const cropH = (cropArea.height / image.height) * displayHeight;

      // Overlay sombre
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, displayWidth, displayHeight);

      // Zone de recadrage claire
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillRect(cropX, cropY, cropW, cropH);
      ctx.globalCompositeOperation = 'source-over';

      // Bordure de la zone de recadrage
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.strokeRect(cropX, cropY, cropW, cropH);

      // Poignées de redimensionnement
      const handleSize = 8;
      ctx.fillStyle = '#3b82f6';
      // Coins
      ctx.fillRect(cropX - handleSize / 2, cropY - handleSize / 2, handleSize, handleSize);
      ctx.fillRect(cropX + cropW - handleSize / 2, cropY - handleSize / 2, handleSize, handleSize);
      ctx.fillRect(cropX - handleSize / 2, cropY + cropH - handleSize / 2, handleSize, handleSize);
      ctx.fillRect(cropX + cropW - handleSize / 2, cropY + cropH - handleSize / 2, handleSize, handleSize);
      // Milieux
      ctx.fillRect(cropX + cropW / 2 - handleSize / 2, cropY - handleSize / 2, handleSize, handleSize);
      ctx.fillRect(cropX + cropW / 2 - handleSize / 2, cropY + cropH - handleSize / 2, handleSize, handleSize);
      ctx.fillRect(cropX - handleSize / 2, cropY + cropH / 2 - handleSize / 2, handleSize, handleSize);
      ctx.fillRect(cropX + cropW - handleSize / 2, cropY + cropH / 2 - handleSize / 2, handleSize, handleSize);
    }
  }, [image, mode, cropArea, adjustments]);

  useEffect(() => {
    drawImage();
  }, [drawImage]);

  // Gestion du recadrage
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode !== 'crop' || !canvasRef.current || !image) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDragging(true);
    setDragStart({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || mode !== 'crop' || !canvasRef.current || !image) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const scale = canvas.width / image.width;
    const newWidth = Math.abs(x - dragStart.x) / scale;
    const newHeight = Math.abs(y - dragStart.y) / scale;
    const newX = Math.min(dragStart.x, x) / scale;
    const newY = Math.min(dragStart.y, y) / scale;

    setCropArea({
      x: Math.max(0, newX),
      y: Math.max(0, newY),
      width: Math.min(newWidth, image.width - newX),
      height: Math.min(newHeight, image.height - newY),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Gestion du redimensionnement
  const handleResizeChange = (dimension: 'width' | 'height', value: number) => {
    if (!image) return;

    const aspectRatio = image.width / image.height;
    let newSettings = { ...resizeSettings };

    if (dimension === 'width') {
      newSettings.width = Math.min(value, maxWidth);
      if (resizeSettings.maintainAspectRatio) {
        newSettings.height = Math.round(newSettings.width / aspectRatio);
      }
    } else {
      newSettings.height = Math.min(value, maxHeight);
      if (resizeSettings.maintainAspectRatio) {
        newSettings.width = Math.round(newSettings.height * aspectRatio);
      }
    }

    setResizeSettings(newSettings);
  };

  // Appliquer les modifications
  const applyEdits = async () => {
    if (!image) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let sourceImage = image;
    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = image.width;
    let sourceHeight = image.height;
    let targetWidth = resizeSettings.width;
    let targetHeight = resizeSettings.height;
    const appliedOperations: string[] = [];

    // Appliquer le recadrage
    if (mode === 'crop' && (cropArea.width !== image.width || cropArea.height !== image.height)) {
      sourceX = cropArea.x;
      sourceY = cropArea.y;
      sourceWidth = cropArea.width;
      sourceHeight = cropArea.height;
      targetWidth = cropArea.width;
      targetHeight = cropArea.height;
      appliedOperations.push(`crop(${cropArea.x},${cropArea.y},${cropArea.width},${cropArea.height})`);
    }

    // Appliquer le redimensionnement
    if (mode === 'resize' && (resizeSettings.width !== sourceWidth || resizeSettings.height !== sourceHeight)) {
      targetWidth = resizeSettings.width;
      targetHeight = resizeSettings.height;
      appliedOperations.push(`resize(${targetWidth},${targetHeight})`);
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Appliquer les filtres
    const hasAdjustments = Object.values(adjustments).some((value, index) => {
      const defaults = [100, 100, 100, 0];
      return value !== defaults[index];
    });

    if (hasAdjustments) {
      ctx.filter = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%) blur(${adjustments.blur}px)`;
      appliedOperations.push(`adjust(brightness:${adjustments.brightness},contrast:${adjustments.contrast},saturation:${adjustments.saturation},blur:${adjustments.blur})`);
    }

    // Dessiner l'image finale
    ctx.drawImage(
      sourceImage,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      targetWidth,
      targetHeight
    );

    // Convertir en blob
    canvas.toBlob((blob) => {
      if (blob) {
        onSave({
          blob,
          dimensions: { width: targetWidth, height: targetHeight },
          operations: appliedOperations,
        });
      }
    }, 'image/jpeg', 0.9);
  };

  // Réinitialiser les ajustements
  const resetAdjustments = () => {
    setAdjustments({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
    });
  };

  // Réinitialiser le recadrage
  const resetCrop = () => {
    if (!image) return;
    setCropArea({
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-900 rounded-lg max-w-6xl max-h-full overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Éditeur d'image
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={applyEdits}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <CheckIcon className="h-4 w-4" />
              Sauvegarder
            </button>
            <button
              onClick={onCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
              Annuler
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
            {/* Mode selector */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Mode</h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setMode('crop')}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    mode === 'crop'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <ScissorsIcon className="h-5 w-5 mx-auto mb-1" />
                  <span className="text-xs">Recadrer</span>
                </button>
                <button
                  onClick={() => setMode('resize')}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    mode === 'resize'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <ArrowsPointingOutIcon className="h-5 w-5 mx-auto mb-1" />
                  <span className="text-xs">Redimensionner</span>
                </button>
                <button
                  onClick={() => setMode('adjust')}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    mode === 'adjust'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <AdjustmentsHorizontalIcon className="h-5 w-5 mx-auto mb-1" />
                  <span className="text-xs">Ajuster</span>
                </button>
              </div>
            </div>

            {/* Crop controls */}
            {mode === 'crop' && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Recadrage</h3>
                  <button
                    onClick={resetCrop}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Réinitialiser
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">X</label>
                      <input
                        type="number"
                        value={Math.round(cropArea.x)}
                        onChange={(e) => setCropArea(prev => ({ ...prev, x: Number(e.target.value) }))}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Y</label>
                      <input
                        type="number"
                        value={Math.round(cropArea.y)}
                        onChange={(e) => setCropArea(prev => ({ ...prev, y: Number(e.target.value) }))}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Largeur</label>
                      <input
                        type="number"
                        value={Math.round(cropArea.width)}
                        onChange={(e) => setCropArea(prev => ({ ...prev, width: Number(e.target.value) }))}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Hauteur</label>
                      <input
                        type="number"
                        value={Math.round(cropArea.height)}
                        onChange={(e) => setCropArea(prev => ({ ...prev, height: Number(e.target.value) }))}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Resize controls */}
            {mode === 'resize' && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Redimensionnement</h3>
                <div className="space-y-3">
                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={resizeSettings.maintainAspectRatio}
                        onChange={(e) => setResizeSettings(prev => ({ ...prev, maintainAspectRatio: e.target.checked }))}
                        className="rounded"
                      />
                      Conserver les proportions
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Largeur</label>
                      <input
                        type="number"
                        value={resizeSettings.width}
                        onChange={(e) => handleResizeChange('width', Number(e.target.value))}
                        max={maxWidth}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Hauteur</label>
                      <input
                        type="number"
                        value={resizeSettings.height}
                        onChange={(e) => handleResizeChange('height', Number(e.target.value))}
                        max={maxHeight}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Adjustment controls */}
            {mode === 'adjust' && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Ajustements</h3>
                  <button
                    onClick={resetAdjustments}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Réinitialiser
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Luminosité ({adjustments.brightness}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={adjustments.brightness}
                      onChange={(e) => setAdjustments(prev => ({ ...prev, brightness: Number(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Contraste ({adjustments.contrast}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={adjustments.contrast}
                      onChange={(e) => setAdjustments(prev => ({ ...prev, contrast: Number(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Saturation ({adjustments.saturation}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={adjustments.saturation}
                      onChange={(e) => setAdjustments(prev => ({ ...prev, saturation: Number(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Flou ({adjustments.blur}px)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.1"
                      value={adjustments.blur}
                      onChange={(e) => setAdjustments(prev => ({ ...prev, blur: Number(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Image info */}
            {image && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Informations</h3>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <div>Original: {image.width}×{image.height}</div>
                  {mode === 'crop' && (
                    <div>Recadré: {Math.round(cropArea.width)}×{Math.round(cropArea.height)}</div>
                  )}
                  {mode === 'resize' && (
                    <div>Redimensionné: {resizeSettings.width}×{resizeSettings.height}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Canvas area */}
          <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
            <div className="max-w-full max-h-full">
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className="max-w-full max-h-full border border-gray-300 dark:border-gray-600 rounded cursor-crosshair"
                style={{ cursor: mode === 'crop' ? 'crosshair' : 'default' }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ImageEditor;