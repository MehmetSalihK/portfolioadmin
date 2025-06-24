import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiMove, FiRotateCw, FiCheck, FiX } from 'react-icons/fi';
import Image from 'next/image';

interface BlurZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

interface BlurPreviewProps {
  file: File | null;
  fileUrl?: string;
  onConfirm: (zones: BlurZone[]) => void;
  onCancel: () => void;
}

const BlurPreview: React.FC<BlurPreviewProps> = ({ file, fileUrl: externalFileUrl, onConfirm, onCancel }) => {
  const [fileUrl, setFileUrl] = useState<string>('');
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [blurZones, setBlurZones] = useState<BlurZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
  const [currentDrawZone, setCurrentDrawZone] = useState<BlurZone | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (externalFileUrl) {
      setFileUrl(externalFileUrl);
    }
  }, [file, externalFileUrl]);

  useEffect(() => {
    if (imageRef.current && imageDimensions.width > 0 && imageDimensions.height > 0) {
      // Initialiser avec un tableau vide pour n'avoir que le mode dessin
      const defaultZones: BlurZone[] = [];
      setBlurZones(defaultZones);
    }
  }, [imageDimensions]);

  const handleImageLoad = () => {
    if (imageRef.current) {
      setImageDimensions({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight
      });
    }
  };

  const getCurrentElementRef = () => {
    return (file?.type === 'application/pdf' || (externalFileUrl && externalFileUrl.includes('.pdf'))) 
      ? iframeRef.current 
      : imageRef.current;
  };

  const handleMouseDown = (e: React.MouseEvent, zoneId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedZone(zoneId);
    setIsDragging(true);
    const rect = getCurrentElementRef()?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedZone) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = getCurrentElementRef()?.getBoundingClientRect();
    if (!rect) return;
    
    const scale = getDisplayScale();
    const newX = (e.clientX - rect.left) / scale;
    const newY = (e.clientY - rect.top) / scale;
    
    setBlurZones(zones => zones.map(zone => 
      zone.id === selectedZone 
        ? { ...zone, x: Math.max(0, Math.min(newX, imageDimensions.width - zone.width)), y: Math.max(0, Math.min(newY, imageDimensions.height - zone.height)) }
        : zone
    ));
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setSelectedZone(null);
  };

  const toggleZone = (zoneId: string) => {
    setBlurZones(zones => zones.map(zone => 
      zone.id === zoneId 
        ? { ...zone, width: zone.width > 0 ? 0 : imageDimensions.width * 0.25 }
        : zone
    ));
  };

  const handleImageClick = (e: React.MouseEvent) => {
    if (!isDrawingMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = getCurrentElementRef()?.getBoundingClientRect();
    if (!rect) return;
    
    const scale = getDisplayScale();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    if (!isDrawing) {
      // Commencer à dessiner
      setIsDrawing(true);
      setDrawStart({ x, y });
      const newZone: BlurZone = {
        id: `custom-${Date.now()}`,
        x,
        y,
        width: 0,
        height: 0,
        label: ''
      };
      setCurrentDrawZone(newZone);
    } else {
      // Finir de dessiner
      if (currentDrawZone) {
        const width = Math.abs(x - drawStart.x);
        const height = Math.abs(y - drawStart.y);
        const finalX = Math.min(x, drawStart.x);
        const finalY = Math.min(y, drawStart.y);
        
        if (width > 10 && height > 10) { // Zone minimum
          const finalZone = {
            ...currentDrawZone,
            x: finalX,
            y: finalY,
            width,
            height
          };
          setBlurZones(zones => [...zones, finalZone]);
        }
      }
      setIsDrawing(false);
      setCurrentDrawZone(null);
    }
  };

  const handleImageMouseMove = (e: React.MouseEvent) => {
    if (!isDrawingMode || !isDrawing || !currentDrawZone) return;
    
    const rect = getCurrentElementRef()?.getBoundingClientRect();
    if (!rect) return;
    
    const scale = getDisplayScale();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    const width = Math.abs(x - drawStart.x);
    const height = Math.abs(y - drawStart.y);
    const finalX = Math.min(x, drawStart.x);
    const finalY = Math.min(y, drawStart.y);
    
    setCurrentDrawZone({
      ...currentDrawZone,
      x: finalX,
      y: finalY,
      width,
      height
    });
  };

  const deleteZone = (zoneId: string) => {
    setBlurZones(zones => zones.filter(zone => zone.id !== zoneId));
  };

  const clearAllCustomZones = () => {
    setBlurZones(zones => zones.filter(zone => !zone.id.startsWith('custom-')));
  };

  const clearAllZones = () => {
    setBlurZones([]);
  };

  const getDisplayScale = () => {
    if (!imageRef.current || !imageDimensions.width) return 1;
    return imageRef.current.clientWidth / imageDimensions.width;
  };

  return createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]"
      onClick={(e) => {
        // Fermer seulement si on clique sur le backdrop
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div 
        className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
           <h3 className="text-lg font-semibold">Ajuster les zones de floutage</h3>
           <div className="text-sm text-gray-500">
             Cliquez en dehors pour annuler
           </div>
         </div>
        
        <div className="relative mb-4">
          {(file?.type === 'application/pdf' || (externalFileUrl && externalFileUrl.includes('.pdf'))) ? (
            <div className="relative">
              <iframe
                ref={iframeRef}
                src={fileUrl}
                className="w-full h-96 border border-gray-300 rounded"
                onLoad={handleImageLoad}
              />
              {/* Overlay transparent pour capturer les événements de souris sur PDF - seulement en mode dessin */}
              {isDrawingMode && (
                <div
                  className="absolute inset-0 cursor-crosshair"
                  onMouseMove={handleImageMouseMove}
                  onMouseUp={handleMouseUp}
                  onClick={handleImageClick}
                  style={{ pointerEvents: 'auto' }}
                />
              )}
            </div>
          ) : (
            <Image
              ref={imageRef}
              src={fileUrl}
              alt="Aperçu du diplôme"
              className={`max-w-full max-h-96 border border-gray-300 rounded ${isDrawingMode ? 'cursor-crosshair' : 'cursor-default'}`}
              onLoad={handleImageLoad}
              onMouseMove={(e) => {
                if (isDrawingMode) {
                  handleImageMouseMove(e);
                } else {
                  handleMouseMove(e);
                }
              }}
              onMouseUp={handleMouseUp}
              onClick={handleImageClick}
              width={800}
              height={600}
              unoptimized
            />
          )}
          
          <div
            ref={overlayRef}
            className={`absolute inset-0 ${isDrawingMode ? '' : (file?.type === 'application/pdf' || (externalFileUrl && externalFileUrl.includes('.pdf'))) ? 'cursor-default' : 'cursor-move'}`}
            style={{
              width: imageRef.current?.clientWidth || 'auto',
              height: imageRef.current?.clientHeight || 'auto',
              pointerEvents: isDrawingMode ? 'none' : 'auto'
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {blurZones.map(zone => {
              const scale = getDisplayScale();
              return zone.width > 0 ? (
                <div
                  key={zone.id}
                  className={`absolute border-2 bg-red-500 bg-opacity-30 cursor-move group ${
                    selectedZone === zone.id ? 'border-red-600' : 'border-red-400'
                  }`}
                  style={{
                    left: zone.x * scale,
                    top: zone.y * scale,
                    width: zone.width * scale,
                    height: zone.height * scale
                  }}
                  onMouseDown={(e) => !isDrawingMode && handleMouseDown(e, zone.id)}
                >
                  <div className="absolute -top-6 left-0 text-xs bg-red-600 text-white px-1 rounded flex items-center space-x-1">
                    <span>{zone.label}</span>
                    {zone.id.startsWith('custom-') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteZone(zone.id);
                        }}
                        className="text-white hover:text-red-200 ml-1"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ) : null;
            })}
            
            {/* Zone en cours de dessin */}
            {currentDrawZone && currentDrawZone.width > 0 && currentDrawZone.height > 0 && (
              <div
                className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-30 pointer-events-none"
                style={{
                  left: currentDrawZone.x * getDisplayScale(),
                  top: currentDrawZone.y * getDisplayScale(),
                  width: currentDrawZone.width * getDisplayScale(),
                  height: currentDrawZone.height * getDisplayScale()
                }}
              >

              </div>
            )}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">Contrôles de floutage :</h4>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setIsDrawingMode(!isDrawingMode);
                  setIsDrawing(false);
                  setCurrentDrawZone(null);
                }}
                className={`px-3 py-1 text-sm rounded ${
                  isDrawingMode 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {isDrawingMode ? '✏️ Mode dessin actif' : '✏️ Mode dessin'}
              </button>
              <button
                onClick={clearAllZones}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                🗑️ Tout effacer
              </button>
            </div>
          </div>
          
          {blurZones.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {blurZones.map(zone => (
                <label key={zone.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={zone.width > 0}
                    onChange={() => toggleZone(zone.id)}
                    className="rounded"
                  />
                  <span className="text-sm">{zone.label}</span>
                  {zone.id.startsWith('custom-') && (
                    <button
                      onClick={() => deleteZone(zone.id)}
                      className="text-red-500 hover:text-red-700 text-xs ml-auto"
                    >
                      ×
                    </button>
                  )}
                </label>
              ))}
            </div>
          )}
          
          {blurZones.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              <p>Aucune zone de floutage créée</p>
              <p className="text-sm">Activez le mode dessin pour commencer</p>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-600 mb-4">
          <p>• <strong>Mode dessin :</strong> Activez le mode dessin puis cliquez deux fois sur l'image pour créer des zones de floutage</p>
          <p>• Glissez-déposez les zones pour les repositionner</p>
          <p>• Utilisez les boutons de suppression pour enlever les zones non désirées</p>
          {isDrawingMode && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
              <p className="text-blue-800">📝 <strong>Mode dessin actif :</strong> Cliquez deux fois sur l'image pour créer une zone de floutage personnalisée</p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-2"
          >
            <FiX className="w-4 h-4" />
            <span>Annuler</span>
          </button>
          <button
            onClick={() => onConfirm(blurZones.filter(zone => zone.width > 0))}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <FiCheck className="w-4 h-4" />
            <span>Confirmer</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BlurPreview;