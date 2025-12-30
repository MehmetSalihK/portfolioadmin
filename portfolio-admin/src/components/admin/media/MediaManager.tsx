import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import ImageCropper from './ImageCropper';
import { XMarkIcon, PencilSquareIcon, CloudArrowUpIcon, PhotoIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface MediaManagerProps {
  initialImages?: string[];
  onImagesChange: (images: string[]) => void;
  maxFiles?: number;
  label?: string;
  allowCrop?: boolean;
}

export default function MediaManager({
  initialImages = [],
  onImagesChange,
  maxFiles = 10,
  label = 'Images',
  allowCrop = true,
}: MediaManagerProps) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [croppingFile, setCroppingFile] = useState<File | null>(null);

  // Compression options
  const compressionOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload-media', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      return data.filepath;
    } catch (error) {
      console.error('Error uploading:', error);
      return null;
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploading(true);
      const newImages = [...images];

      // Re-define options here to avoid dependency issues or use useMemo
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      for (const file of acceptedFiles) {
        if (newImages.length >= maxFiles) break;

        try {
            // 1. Optimize
            const compressedFile = await imageCompression(file, options);
            
            // 2. Check if we strictly need cropping for the first image if it's the only one allowed? 
            // For now, we upload directly, and allow cropping via the edit button.
            // Or better: if allowCrop is true and it's a single file upload, maybe offer crop immediately?
            // Let's keep it simple: Upload first, but show edit button.
            // Actually, cropping AFTER upload is hard because we need the raw file.
            // Let's support "Click Edit to Crop" by keeping the file in memory? No that's complex.
            // Let's auto-open cropper for single image mode?
            
            if (maxFiles === 1 && allowCrop) {
                // If single file mode, let's open cropper immediately
                setCroppingFile(compressedFile);
                setCropImage(URL.createObjectURL(compressedFile));
                setUploading(false); // Pause uploading
                return; 
            }

            // 3. Upload
            const url = await uploadFile(compressedFile);
            if (url) {
            newImages.push(url);
            }
        } catch (error) {
          console.error('Error processing file:', error);
        }
      }

      setImages(newImages);
      onImagesChange(newImages);
      setUploading(false);
    },
    [images, maxFiles, onImagesChange, allowCrop]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    disabled: uploading || images.length >= maxFiles,
  });

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesChange(newImages);
    
    // Optional: Delete from server? 
    // We usually don't auto-delete from server on simple remove from UI to avoid accidental data loss 
    // if the user didn't mean to save the form.
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setUploading(true);
    try {
        // Convert Blob to File
        const file = new File([croppedBlob], croppingFile?.name || 'cropped.jpg', { type: 'image/jpeg' });
        
        // Upload
        const url = await uploadFile(file);
        if (url) {
            let newImages;
            if (maxFiles === 1) {
                newImages = [url];
            } else {
                newImages = [...images, url];
            }
            setImages(newImages);
            onImagesChange(newImages);
        }
    } catch (e) {
        console.error(e);
    } finally {
        setUploading(false);
        setCropImage(null);
        setCroppingFile(null);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </label>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-gray-300 dark:border-gray-600'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-400'}
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
            <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="text-sm text-gray-600 dark:text-gray-300">
                {uploading ? (
                    <span className="animate-pulse">Optimisation & Upload en cours...</span>
                ) : (
                    <span>
                        <span className="font-medium text-primary-600 hover:text-primary-500">
                            Cliquez pour uploader
                        </span>{' '}
                        ou glissez-déposez
                    </span>
                )}
            </div>
            <p className="text-xs text-gray-500">
                PNG, JPG, WEBP jusqu'à 10MB (Max {maxFiles} fichiers)
            </p>
        </div>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className={`grid gap-4 ${maxFiles === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'}`}>
          {images.map((src, index) => (
            <div key={src + index} className="group relative aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <Image
                src={src}
                alt={`Upload ${index + 1}`}
                fill
                className="object-cover"
              />
              
              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                      e.stopPropagation();
                      // Open image in new tab for full preview
                      window.open(src, '_blank');
                  }}
                  className="p-1.5 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                  title="Voir en grand"
                >
                    <PhotoIcon className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                  }}
                  className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  title="Supprimer"
                >
                    <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cropper Modal */}
      {cropImage && (
        <ImageCropper
          isOpen={true}
          imageSrc={cropImage}
          onClose={() => {
              setCropImage(null);
              setCroppingFile(null);
          }}
          onCropComplete={handleCropComplete}
          aspect={16 / 9} // Default aspect for portfolio projects
        />
      )}
    </div>
  );
}
