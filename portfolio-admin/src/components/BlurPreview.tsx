import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  FiMove, 
  FiEdit3, 
  FiTrash2, 
  FiCheck, 
  FiX, 
  FiSquare,
  FiEye,
  FiEyeOff,
  FiRotateCw
} from 'react-icons/fi';
import Image from 'next/image';

interface BlurZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  isVisible: boolean;
}

interface BlurPreviewProps {
  file: File | null;
  fileUrl?: string;
  onConfirm: (zones: BlurZone[]) => void;
  onCancel: () => void;
}

const BlurPreview: React.FC<BlurPreviewProps> = ({ 
  file, 
  fileUrl: externalFileUrl, 
  onConfirm, 
  onCancel 
}) => {
  const [fileUrl, setFileUrl] = useState<string>('');
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [blurZones, setBlurZones] = useState<BlurZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
  const [currentDrawZone, setCurrentDrawZone] = useState<BlurZone | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [previewImageDimensions, setPreviewImageDimensions] = useState({ width: 0, height: 0 });
  
  const overlayRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const isPdf = file?.type === 'application/pdf' || fileUrl.toLowerCase().includes('.pdf');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const updateOverlay = () => {
      if (overlayRef.current && imageRef.current) {
        const offset = getImageOffset();
        overlayRef.current.style.left = isPdf ? '0px' : `${offset.x}px`;
        overlayRef.current.style.top = isPdf ? '0px' : `${offset.y}px`;
        overlayRef.current.style.width = `${imageRef.current.clientWidth}px`;
        overlayRef.current.style.height = `${imageRef.current.clientHeight}px`;
      }
    };

    updateOverlay();
    window.addEventListener('resize', updateOverlay);
    
    return () => window.removeEventListener('resize', updateOverlay);
  }, [imageDimensions, isPdf]);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (externalFileUrl) {
      setFileUrl(externalFileUrl);
    }
  }, [file, externalFileUrl]);

  const handleImageLoad = () => {
    if (imageRef.current) {
      setImageDimensions({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight
      });
      
      setTimeout(() => {
        if (overlayRef.current && imageRef.current) {
          const offset = getImageOffset();
          overlayRef.current.style.left = isPdf ? '0px' : `${offset.x}px`;
           overlayRef.current.style.top = isPdf ? '0px' : `${offset.y}px`;
          overlayRef.current.style.width = `${imageRef.current.clientWidth}px`;
          overlayRef.current.style.height = `${imageRef.current.clientHeight}px`;
        }
      }, 100);
    }
  };

  const getCurrentElementRef = () => {
    return (file?.type === 'application/pdf' || (externalFileUrl && externalFileUrl.includes('.pdf'))) 
      ? iframeRef.current 
      : imageRef.current;
  };

  const isPDF = () => {
    return file?.type === 'application/pdf' || (externalFileUrl && externalFileUrl.includes('.pdf'));
  };

  const handleMouseDown = (e: React.MouseEvent, zoneId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedZone(zoneId);
    setIsDragging(true);
    const rect = getCurrentElementRef()?.getBoundingClientRect();
    if (rect) {
      const zone = blurZones.find(z => z.id === zoneId);
      if (zone) {
        const scale = getDisplayScale();
        setDragStart({
          x: (e.clientX - rect.left) / scale - zone.x,
          y: (e.clientY - rect.top) / scale - zone.y
        });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedZone) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = getCurrentElementRef()?.getBoundingClientRect();
    if (!rect) return;
    
    const scale = getDisplayScale();
    const mouseX = (e.clientX - rect.left) / scale;
    const mouseY = (e.clientY - rect.top) / scale;
    
    if (isResizing) {
      setBlurZones(zones => zones.map(zone => {
        if (zone.id !== selectedZone) return zone;
        
        let newWidth = zone.width;
        let newHeight = zone.height;
        
        if (resizeType === 'corner') {
          newWidth = Math.max(20, Math.min(mouseX - zone.x, imageDimensions.width - zone.x));
          newHeight = Math.max(20, Math.min(mouseY - zone.y, imageDimensions.height - zone.y));
        } else if (resizeType === 'right') {
          newWidth = Math.max(20, Math.min(mouseX - zone.x, imageDimensions.width - zone.x));
        } else if (resizeType === 'bottom') {
          newHeight = Math.max(20, Math.min(mouseY - zone.y, imageDimensions.height - zone.y));
        }
        
        return {
          ...zone,
          width: newWidth,
          height: newHeight
        };
      }));
    } else {
      const newX = mouseX - dragStart.x;
      const newY = mouseY - dragStart.y;
      
      setBlurZones(zones => zones.map(zone => 
        zone.id === selectedZone 
          ? { 
              ...zone, 
              x: Math.max(0, Math.min(newX, imageDimensions.width - zone.width)), 
              y: Math.max(0, Math.min(newY, imageDimensions.height - zone.height)) 
            }
          : zone
      ));
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setIsResizing(false);
    setResizeType(null);
    setSelectedZone(null);
  };

  const [resizeType, setResizeType] = useState<'corner' | 'right' | 'bottom' | null>(null);

  const handleResizeStart = (e: React.MouseEvent, zoneId: string, type: 'corner' | 'right' | 'bottom' = 'corner') => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedZone(zoneId);
    setIsDragging(true);
    setIsResizing(true);
    setResizeType(type);
  };

  const handleImageMouseDown = (e: React.MouseEvent) => {
    if (!isDrawingMode) {
      setSelectedZone(null);
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = getCurrentElementRef()?.getBoundingClientRect();
    if (!rect) return;
    
    const scale = getDisplayScale();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    setIsDrawing(true);
    setDrawStart({ x, y });
    const newZone: BlurZone = {
      id: `zone-${Date.now()}`,
      x,
      y,
      width: 0,
      height: 0,
      label: `Zone ${blurZones.length + 1}`,
      isVisible: true
    };
    setCurrentDrawZone(newZone);
  };

  const handleImageMouseUp = (e: React.MouseEvent) => {
    if (!isDrawingMode || !isDrawing) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    if (currentDrawZone && currentDrawZone.width > 10 && currentDrawZone.height > 10) {
      setBlurZones(zones => [...zones, currentDrawZone]);
    }
    
    setIsDrawing(false);
    setCurrentDrawZone(null);
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

  const toggleZoneVisibility = (zoneId: string) => {
    setBlurZones(zones => zones.map(zone => 
      zone.id === zoneId 
        ? { ...zone, isVisible: !zone.isVisible }
        : zone
    ));
  };

  const clearAllZones = () => {
    setBlurZones([]);
  };

  const getDisplayScale = () => {
    if (!imageRef.current || !imageDimensions.width) return 1;
    return imageRef.current.clientWidth / imageDimensions.width;
  };

  const getImageOffset = () => {
    if (!imageRef.current) return { x: 0, y: 0 };
    const imageRect = imageRef.current.getBoundingClientRect();
    
    let container = imageRef.current.parentElement;
    while (container && !container.classList.contains('relative')) {
      container = container.parentElement;
    }
    
    if (!container) return { x: 0, y: 0 };
    
    const containerRect = container.getBoundingClientRect();
    return {
      x: imageRect.left - containerRect.left,
      y: imageRect.top - containerRect.top
    };
  };

  const getPreviewScale = () => {
    if (!imageDimensions.width || !imageDimensions.height) return 1;
    const maxSize = 500;
    return Math.min(maxSize / imageDimensions.width, maxSize / imageDimensions.height, 1);
  };

  const themeClasses = {
    modal: isDarkMode 
      ? 'bg-gray-900 border border-gray-700 text-white' 
      : 'bg-white border border-gray-200 text-gray-900',
    header: isDarkMode 
      ? 'text-white border-b border-gray-700' 
      : 'text-gray-900 border-b border-gray-200',
    subtitle: isDarkMode 
      ? 'text-gray-400' 
      : 'text-gray-500',
    button: {
      primary: isDarkMode
        ? 'bg-blue-600 hover:bg-blue-700 text-white'
        : 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: isDarkMode
        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600'
        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300',
      danger: isDarkMode
        ? 'bg-red-600 hover:bg-red-700 text-white'
        : 'bg-red-100 hover:bg-red-200 text-red-700',
      cancel: isDarkMode
        ? 'text-gray-300 border-gray-600 hover:bg-gray-800'
        : 'text-gray-600 border-gray-300 hover:bg-gray-50'
    },
    zone: {
      active: 'border-blue-500 bg-blue-500 bg-opacity-20',
      inactive: isDarkMode
        ? 'border-red-400 bg-red-500 bg-opacity-20'
        : 'border-red-400 bg-red-500 bg-opacity-20',
      selected: 'border-blue-600 bg-blue-600 bg-opacity-30'
    },
    controls: isDarkMode
      ? 'bg-gray-800 border-gray-700'
      : 'bg-gray-50 border-gray-200',
    instruction: isDarkMode
      ? 'bg-blue-900 border-blue-700 text-blue-200'
      : 'bg-blue-50 border-blue-200 text-blue-800'
  };

  return createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[99999] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div 
        className={`${themeClasses.modal} rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`${themeClasses.header} px-6 py-4 flex items-center justify-between`}>
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <FiEdit3 className="w-5 h-5" />
              Éditeur de zones de floutage
            </h3>
            <p className={`${themeClasses.subtitle} text-sm mt-1`}>
              Créez et gérez les zones à flouter sur votre document
            </p>
          </div>
          <button
            onClick={onCancel}
            className={`${themeClasses.button.cancel} p-2 rounded-lg border transition-colors`}
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Image/PDF Container */}
            <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              <h4 className={`${themeClasses.subtitle} text-sm font-medium p-3 border-b border-gray-200 dark:border-gray-700`}>
                Image originale
              </h4>
            {isPDF() ? (
              <div className="relative">
                <iframe
                  ref={iframeRef}
                  src={fileUrl}
                  className="w-full h-[500px] border-0"
                  onLoad={handleImageLoad}
                />
                {isDrawingMode && (
                  <div
                    className="absolute inset-0 cursor-crosshair"
                    onMouseDown={handleImageMouseDown}
                    onMouseMove={handleImageMouseMove}
                    onMouseUp={handleImageMouseUp}
                    style={{ pointerEvents: 'auto' }}
                  />
                )}
              </div>
            ) : (
              <div className="flex justify-center p-4">
                <Image
                  ref={imageRef}
                  src={fileUrl}
                  alt="Document à éditer"
                  className={`max-w-full max-h-[500px] object-contain rounded-lg shadow-lg ${
                    isDrawingMode ? 'cursor-crosshair' : 'cursor-default'
                  }`}
                  onLoad={handleImageLoad}
                  onMouseDown={(e) => {
                    if (isDrawingMode) {
                      handleImageMouseDown(e);
                    }
                  }}
                  onMouseMove={(e) => {
                    if (isDrawingMode) {
                      handleImageMouseMove(e);
                    } else {
                      handleMouseMove(e);
                    }
                  }}
                  onMouseUp={(e) => {
                    if (isDrawingMode) {
                      handleImageMouseUp(e);
                    } else {
                      handleMouseUp(e);
                    }
                  }}
                  width={800}
                  height={600}
                  unoptimized
                />
              </div>
            )}
            
            {/* Zones overlay */}
            <div
              ref={overlayRef}
              className={`absolute ${
                isDrawingMode ? 'pointer-events-none' : 'pointer-events-auto'
              }`}
              style={{
                left: isPdf ? 0 : getImageOffset().x,
                top: isPdf ? 0 : getImageOffset().y,
                width: imageRef.current?.clientWidth || 'auto',
                height: imageRef.current?.clientHeight || 'auto',
              }}
              onMouseMove={!isDrawingMode ? handleMouseMove : undefined}
              onMouseUp={!isDrawingMode ? handleMouseUp : undefined}
              onMouseLeave={!isDrawingMode ? handleMouseUp : undefined}
            >
              {/* Existing zones */}
              {blurZones.map(zone => {
                const scale = getDisplayScale();
                return zone.isVisible ? (
                  <div
                    key={zone.id}
                    className={`absolute border-2 group transition-all duration-200 ${
                      selectedZone === zone.id 
                        ? `${themeClasses.zone.selected} cursor-move shadow-lg` 
                        : `${themeClasses.zone.inactive} cursor-pointer hover:border-blue-400`
                    }`}
                    style={{
                      left: zone.x * scale,
                      top: zone.y * scale,
                      width: zone.width * scale,
                      height: zone.height * scale,
                      pointerEvents: isDrawingMode ? 'none' : 'auto'
                    }}
                    onMouseDown={(e) => !isDrawingMode && handleMouseDown(e, zone.id)}
                  >                    {/* Zone label */}
                    <div className={`absolute -top-6 left-0 bg-gray-900 text-white text-xs px-1 py-0.5 rounded shadow-md flex items-center gap-1 transition-opacity ${
                      selectedZone === zone.id ? 'opacity-90' : 'opacity-0 group-hover:opacity-80'
                    }`}>
                      <span className="text-xs">{zone.label}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteZone(zone.id);
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        <FiTrash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                    
                    {/* Resize handles */}
                    {selectedZone === zone.id && (
                      <>
                        {/* Corner resize handle */}
                         <div 
                           className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize hover:bg-blue-600 transition-colors"
                           onMouseDown={(e) => handleResizeStart(e, zone.id, 'corner')}
                         />
                         {/* Edge resize handles */}
                         <div 
                           className="absolute top-0 -right-1 w-2 h-full cursor-e-resize hover:bg-blue-200 hover:bg-opacity-50 transition-colors"
                           onMouseDown={(e) => handleResizeStart(e, zone.id, 'right')}
                         />
                         <div 
                           className="absolute -bottom-1 left-0 w-full h-2 cursor-s-resize hover:bg-blue-200 hover:bg-opacity-50 transition-colors"
                           onMouseDown={(e) => handleResizeStart(e, zone.id, 'bottom')}
                         />
                      </>
                    )}
                  </div>
                ) : null;
              })}
              
              {/* Current drawing zone */}
              {currentDrawZone && currentDrawZone.width > 0 && currentDrawZone.height > 0 && (
                <div
                  className={`absolute border-2 border-dashed ${themeClasses.zone.active} pointer-events-none`}
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

            {/* Blur Preview Container */}
            <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              <h4 className={`${themeClasses.subtitle} text-sm font-medium p-3 border-b border-gray-200 dark:border-gray-700`}>
                Prévisualisation avec flou
              </h4>
              <div className="relative p-4 flex justify-center">
                {fileUrl && (
                  <div className="relative">
                    <div className="relative max-w-full max-h-[500px]">
                      <Image
                        src={fileUrl}
                        alt="Prévisualisation avec flou"
                        width={500}
                        height={500}
                        className="max-w-full max-h-[500px] object-contain rounded-lg shadow-lg"
                        onLoad={(e) => {
                          const img = e.target as HTMLImageElement;
                          setPreviewImageDimensions({
                            width: img.clientWidth,
                            height: img.clientHeight
                          });
                        }}
                      />
                    </div>
                    
                    {/* Overlay des zones floutées pour la prévisualisation */}
                     <div className="absolute inset-0">
                       {blurZones.map(zone => {
                         if (!zone.isVisible) return null;
                         
                         const previewScale = getPreviewScale();
                         
                         return (
                           <div
                             key={`preview-${zone.id}`}
                             className="absolute rounded"
                             style={{
                               left: (zone.x * previewScale),
                               top: (zone.y * previewScale),
                               width: (zone.width * previewScale),
                               height: (zone.height * previewScale),
                               backdropFilter: 'blur(10px)',
                               backgroundColor: 'rgba(0, 0, 0, 0.2)',
                               border: '1px solid rgba(255, 255, 255, 0.3)'
                             }}
                           >
                             <div className="absolute inset-0 bg-gray-500 bg-opacity-30 rounded" />
                           </div>
                         );
                       })}
                     </div>
                  </div>
                )}
                
                {!fileUrl && (
                  <div className="text-center py-12">
                    <p className={`${themeClasses.subtitle} text-sm`}>
                      Aucune image à prévisualiser
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className={`${themeClasses.controls} rounded-lg p-4 border`}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsDrawingMode(!isDrawingMode);
                    setIsDrawing(false);
                    setCurrentDrawZone(null);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                    isDrawingMode 
                      ? themeClasses.button.primary
                      : themeClasses.button.secondary
                  }`}
                >
                  <FiEdit3 className="w-4 h-4" />
                  {isDrawingMode ? 'Mode dessin actif' : 'Activer le dessin'}
                </button>
                
                <button
                  onClick={clearAllZones}
                  disabled={blurZones.length === 0}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                    blurZones.length === 0
                      ? 'opacity-50 cursor-not-allowed'
                      : themeClasses.button.danger
                  }`}
                >
                  <FiTrash2 className="w-4 h-4" />
                  Tout effacer
                </button>
              </div>
              
              <div className={`${themeClasses.subtitle} text-sm`}>
                {blurZones.length} zone{blurZones.length !== 1 ? 's' : ''} créée{blurZones.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Zone list */}
            {blurZones.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {blurZones.map(zone => (
                  <div
                    key={zone.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                      zone.isVisible
                        ? isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                        : isDarkMode ? 'bg-gray-800 border-gray-700 opacity-60' : 'bg-gray-50 border-gray-300 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleZoneVisibility(zone.id)}
                        className={`p-1 rounded transition-colors ${
                          zone.isVisible
                            ? 'text-green-500 hover:text-green-600'
                            : 'text-gray-400 hover:text-gray-500'
                        }`}
                      >
                        {zone.isVisible ? <FiEye className="w-4 h-4" /> : <FiEyeOff className="w-4 h-4" />}
                      </button>
                      <span className="font-medium text-sm">{zone.label}</span>
                    </div>
                    
                    <button
                      onClick={() => deleteZone(zone.id)}
                      className="p-1 text-red-500 hover:text-red-600 transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Instructions */}
            <div className={`${themeClasses.instruction} rounded-lg p-4 border`}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                </div>
                <div className="text-sm space-y-1">
                  {isDrawingMode ? (
                    <>
                      <p className="font-medium">Mode dessin actif</p>
                      <p>Cliquez deux fois sur l'image pour créer une zone de floutage</p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium">Instructions d'utilisation</p>
                      <p>• Activez le mode dessin pour créer de nouvelles zones</p>
                      <p>• Glissez-déposez les zones existantes pour les repositionner</p>
                      <p>• Utilisez les boutons de visibilité et suppression pour gérer vos zones</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`${themeClasses.header} px-6 py-4 flex items-center justify-end gap-3`}>
          <button
            onClick={onCancel}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${themeClasses.button.cancel} border`}
          >
            <FiX className="w-4 h-4" />
            Annuler
          </button>
          <button
            onClick={() => onConfirm(blurZones.filter(zone => zone.isVisible))}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${themeClasses.button.primary}`}
          >
            <FiCheck className="w-4 h-4" />
            Confirmer ({blurZones.filter(zone => zone.isVisible).length} zone{blurZones.filter(zone => zone.isVisible).length !== 1 ? 's' : ''})
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BlurPreview;