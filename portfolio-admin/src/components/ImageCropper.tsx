import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiRotateCw, FiZoomIn, FiZoomOut, FiSave, FiRefreshCw, FiCrop, FiLayers, FiMaximize, FiSettings, FiCheck } from 'react-icons/fi';
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
  { label: 'Thumbnail (150)', width: 150, height: 150 },
  { label: 'Small (300)', width: 300, height: 300 },
  { label: 'Medium (600)', width: 600, height: 400 },
  { label: 'Large (1200)', width: 1200, height: 800 },
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
  const [imageState, setImageState] = useState({ scale: 1, rotation: 0, offsetX: 0, offsetY: 0 });
  const [cropArea, setCropArea] = useState<CropArea>({ x: 50, y: 50, width: 200, height: 200 });
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    ctx.translate(centerX + imageState.offsetX, centerY + imageState.offsetY);
    ctx.rotate((imageState.rotation * Math.PI) / 180);
    ctx.scale(imageState.scale, imageState.scale);
    const imageWidth = image.naturalWidth;
    const imageHeight = image.naturalHeight;
    ctx.drawImage(image, -imageWidth / 2, -imageHeight / 2, imageWidth, imageHeight);
    ctx.restore();
    ctx.strokeStyle = '#6366f1'; // Indigo-500
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.clearRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
    const handleSize = 10;
    ctx.fillStyle = '#6366f1';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    const handles = [
      { x: cropArea.x - handleSize/2, y: cropArea.y - handleSize/2 },
      { x: cropArea.x + cropArea.width - handleSize/2, y: cropArea.y - handleSize/2 },
      { x: cropArea.x - handleSize/2, y: cropArea.y + cropArea.height - handleSize/2 },
      { x: cropArea.x + cropArea.width - handleSize/2, y: cropArea.y + cropArea.height - handleSize/2 },
    ];
    handles.forEach(h => { ctx.fillRect(h.x, h.y, handleSize, handleSize); ctx.strokeRect(h.x, h.y, handleSize, handleSize); });
  }, [imageLoaded, imageState, cropArea]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;
    const maxWidth = 800;
    const maxHeight = 500;
    const scale = Math.min(maxWidth / image.naturalWidth, maxHeight / image.naturalHeight, 1);
    canvas.width = image.naturalWidth * scale;
    canvas.height = image.naturalHeight * scale;
    setCropArea({ x: canvas.width / 4, y: canvas.height / 4, width: canvas.width / 2, height: canvas.height / 2 });
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const getResizeHandle = (x: number, y: number) => {
    const tolerance = 10;
    if (Math.abs(x - cropArea.x) <= tolerance && Math.abs(y - cropArea.y) <= tolerance) return 'nw';
    if (Math.abs(x - (cropArea.x + cropArea.width)) <= tolerance && Math.abs(y - cropArea.y) <= tolerance) return 'ne';
    if (Math.abs(x - cropArea.x) <= tolerance && Math.abs(y - (cropArea.y + cropArea.height)) <= tolerance) return 'sw';
    if (Math.abs(x - (cropArea.x + cropArea.width)) <= tolerance && Math.abs(y - (cropArea.y + cropArea.height)) <= tolerance) return 'se';
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    const handle = getResizeHandle(pos.x, pos.y);
    if (handle) { setIsResizing(true); setResizeHandle(handle); } 
    else if (pos.x >= cropArea.x && pos.x <= cropArea.x + cropArea.width && pos.y >= cropArea.y && pos.y <= cropArea.y + cropArea.height) { setIsDragging(true); }
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
        if (resizeHandle === 'nw') { newCrop.x += deltaX; newCrop.y += deltaY; newCrop.width -= deltaX; newCrop.height -= deltaY; }
        if (resizeHandle === 'ne') { newCrop.y += deltaY; newCrop.width += deltaX; newCrop.height -= deltaY; }
        if (resizeHandle === 'sw') { newCrop.x += deltaX; newCrop.width -= deltaX; newCrop.height += deltaY; }
        if (resizeHandle === 'se') { newCrop.width += deltaX; newCrop.height += deltaY; }
        if (selectedRatio) {
           if (resizeHandle.includes('e')) newCrop.height = newCrop.width / selectedRatio;
           else newCrop.width = newCrop.height * selectedRatio;
        }
        return newCrop;
      });
      setDragStart(pos);
    } else if (isDragging) {
      const deltaX = pos.x - dragStart.x;
      const deltaY = pos.y - dragStart.y;
      setCropArea(prev => ({ ...prev, x: Math.max(0, Math.min(canvas.width - prev.width, prev.x + deltaX)), y: Math.max(0, Math.min(canvas.height - prev.height, prev.y + deltaY)) }));
      setDragStart(pos);
    }
  };

  const handleMouseUp = () => { setIsDragging(false); setIsResizing(false); };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;
    setIsLoading(true);
    try {
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) throw new Error('Context error');
      const finalWidth = selectedSize.width || cropArea.width;
      const finalHeight = selectedSize.height || cropArea.height;
      tempCanvas.width = finalWidth;
      tempCanvas.height = finalHeight;
      const scaleX = image.naturalWidth / canvas.width;
      const scaleY = image.naturalHeight / canvas.height;
      tempCtx.drawImage(image, cropArea.x * scaleX, cropArea.y * scaleY, cropArea.width * scaleX, cropArea.height * scaleY, 0, 0, finalWidth, finalHeight);
      const blob = await new Promise<Blob>(r => tempCanvas.toBlob(b => r(b!), `image/${format}`, quality));
      const fd = new FormData();
      fd.append('file', blob, `cropped-${Date.now()}.${format}`);
      fd.append('originalId', imageId);
      fd.append('saveAsNew', saveAsNew.toString());
      const res = await fetch('/api/media/crop', { method: 'POST', body: fd });
      if (res.ok) {
        const result = await res.json();
        onSave(result.url);
      }
    } catch (e) { toast.error('Erreur de sauvegarde'); } finally { setIsLoading(false); }
  };

  useEffect(() => { if (imageLoaded) drawCanvas(); }, [drawCanvas, imageLoaded]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-6" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 30 }} className="bg-white dark:bg-[#0f1118] border border-slate-200 dark:border-white/10 rounded-[40px] w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-slate-100 dark:border-white/5">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-500/20">
                 <FiCrop className="w-6 h-6" />
              </div>
              <div>
                 <h2 className="text-xl font-extrabold dark:text-white text-slate-900 tracking-tight">Recadrer l'image</h2>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Outil d'édition visuelle</p>
              </div>
           </div>
           <button onClick={onClose} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all"><FiX className="w-5 h-5"/></button>
        </div>

        <div className="flex flex-1 overflow-hidden">
           {/* Canvas Container */}
           <div className="flex-1 bg-slate-50 dark:bg-slate-950/50 p-10 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
              <div className="relative shadow-2xl bg-white dark:bg-black rounded-xl overflow-hidden p-1.5 border border-slate-200 dark:border-white/5">
                 <canvas ref={canvasRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} className="cursor-crosshair bg-slate-100 dark:bg-slate-900" />
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img ref={imageRef} src={imageUrl} onLoad={handleImageLoad} className="hidden" alt="" />
              </div>
           </div>

           {/* Sidebar Controls */}
           <div className="w-96 p-8 border-l border-slate-100 dark:border-white/5 overflow-y-auto space-y-10 custom-scrollbar">
              <div className="space-y-6">
                 <div>
                    <div className="flex items-center gap-2 mb-4">
                       <FiSettings className="text-primary-500 w-4 h-4" />
                       <h3 className="text-xs font-black dark:text-white text-slate-900 uppercase tracking-widest">Transformations</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <button onClick={() => setImageState(s => ({ ...s, scale: s.scale + 0.1 }))} className="p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold hover:border-primary-500/30 transition-all dark:text-slate-300 text-slate-600"><FiZoomIn /> Zoom +</button>
                       <button onClick={() => setImageState(s => ({ ...s, scale: s.scale - 0.1 }))} className="p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold hover:border-primary-500/30 transition-all dark:text-slate-300 text-slate-600"><FiZoomOut /> Zoom -</button>
                       <button onClick={() => setImageState(s => ({ ...s, rotation: (s.rotation + 90) % 360 }))} className="p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold hover:border-primary-500/30 transition-all dark:text-slate-300 text-slate-600"><FiRotateCw /> Rotation</button>
                       <button onClick={() => { setImageState({ scale: 1, rotation: 0, offsetX: 0, offsetY: 0 }); handleImageLoad(); }} className="p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold hover:border-primary-500/30 transition-all dark:text-slate-300 text-slate-600"><FiRefreshCw /> Reset</button>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                       <FiMaximize className="text-primary-500 w-4 h-4" />
                       <h3 className="text-xs font-black dark:text-white text-slate-900 uppercase tracking-widest">Ratio d'Aspect</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                       {PRESET_RATIOS.map(r => (
                         <button key={r.label} onClick={() => { setSelectedRatio(r.value); if (r.value) setCropArea(p => ({ ...p, height: p.width / r.value! })); }} className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${selectedRatio === r.value ? 'bg-primary-500 border-primary-400 text-white shadow-lg shadow-primary-500/20' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-500 hover:text-primary-500'}`}>{r.label}</button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                       <FiLayers className="text-primary-500 w-4 h-4" />
                       <h3 className="text-xs font-black dark:text-white text-slate-900 uppercase tracking-widest">Exporter</h3>
                    </div>
                    <div className="space-y-5 bg-slate-50 dark:bg-white/5 p-5 rounded-3xl border border-slate-200 dark:border-white/5">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Format & Qualité ({Math.round(quality*100)}%)</label>
                          <div className="flex gap-2">
                             {['jpeg', 'webp', 'png'].map(f => (
                               <button key={f} onClick={() => setFormat(f as any)} className={`flex-1 py-2 rounded-xl text-[9px] font-bold uppercase transition-all ${format === f ? 'bg-primary-500 text-white' : 'bg-white dark:bg-white/10 text-slate-400 border border-slate-100 dark:border-white/5'}`}>{f}</button>
                             ))}
                          </div>
                          <input type="range" min="0.1" max="1" step="0.1" value={quality} onChange={e => setQuality(parseFloat(e.target.value))} className="w-full accent-primary-500 opacity-80" />
                       </div>
                       <label className="flex items-center gap-3 cursor-pointer group">
                          <div className={`w-10 h-5 rounded-full transition-all relative ${saveAsNew ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-white/10'}`}>
                             <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${saveAsNew ? 'left-5.5' : 'left-0.5'}`} />
                          </div>
                          <input type="checkbox" checked={saveAsNew} onChange={e => setSaveAsNew(e.target.checked)} className="hidden" />
                          <span className="text-[10px] font-bold dark:text-slate-400 text-slate-500 group-hover:text-primary-500 uppercase tracking-tight">Sauver comme nouveau</span>
                       </label>
                    </div>
                 </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-white/5 flex gap-3">
                 <button onClick={handleSave} disabled={isLoading || !imageLoaded} className="flex-1 bg-primary-500 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary-500/25 active:scale-95 transition-all flex items-center justify-center gap-3 border border-primary-400">
                    {isLoading ? <FiLoader className="animate-spin" /> : <FiCheck className="w-4 h-4" />}
                    {isLoading ? 'Calcul...' : 'Confirmer'}
                 </button>
                 <button onClick={onClose} className="px-6 py-4 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all">Annuler</button>
              </div>
           </div>
        </div>
      </motion.div>
    </motion.div>
  );
}