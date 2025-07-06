// RosterImageUpload.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
// Input and Label might not be strictly needed if we simplify the UI for file selection
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
import { recognizeText, parsePlayerData } from '@/utils/ocr'; // Assuming this is ocr.ts
import ReactCrop, { type Crop, centerCrop, makeAspectCrop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { toast } from 'react-hot-toast'; // For user feedback

// Assuming Player type is defined elsewhere and can be imported like this:
// import { Player } from '@/types/playerTypes';
// For this example, I'll use a local Player type stub.
interface PlayerStub {
  name: string;
  position: string;
  year: string;
  rating: string;
}

interface RosterImageUploadProps {
  onProcessComplete: (players: Omit<PlayerStub, 'id' | 'devTrait' | 'notes' | 'jerseyNumber'>[]) => void;
  className?: string;
}

// Helper to generate a data URL for the cropped image
function getCroppedImg(
  image: HTMLImageElement,
  crop: PixelCrop,
  fileName: string
): Promise<File | null> {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width * scaleX;
  canvas.height = crop.height * scaleY;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return Promise.resolve(null);
  }

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width * scaleX,
    crop.height * scaleY
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Canvas is empty');
        resolve(null);
        return;
      }
      const file = new File([blob], fileName, { type: blob.type });
      resolve(file);
    }, 'image/png'); // Or 'image/jpeg'
  });
}


const RosterImageUpload: React.FC<RosterImageUploadProps> = ({ onProcessComplete, className }) => {
  const [imgSrc, setImgSrc] = useState(''); // For the cropper to display the image
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [crop, setCrop] = useState<Crop>(); // Current crop selection (percentage)
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>(); // Final crop in pixels
  const [isCropping, setIsCropping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const aspect = undefined; // Free crop

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    imgRef.current = e.currentTarget;
    const { width, height } = e.currentTarget;
    // Optionally, set a default crop here
    const defaultCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 50, // Default crop width percentage
        },
        aspect || width / height, // Use aspect if defined, else image aspect
        width,
        height
      ),
      width,
      height
    );
    setCrop(defaultCrop);
    setCompletedCrop(undefined); // Reset completed crop on new image
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setOriginalFile(file);
      setCrop(undefined); // Reset crop when a new file is selected
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
        setIsCropping(true); // Show cropper UI
      });
      reader.readAsDataURL(file);
    } else {
      setOriginalFile(null);
      setImgSrc('');
      setIsCropping(false);
    }
  };

  const handleConfirmCrop = async () => {
    if (!completedCrop || !imgRef.current || !originalFile) {
      toast.error('Please select an image and define a crop area.');
      return;
    }

    setIsProcessing(true);
    try {
      const croppedImageFile = await getCroppedImg(imgRef.current, completedCrop, originalFile.name);
      if (croppedImageFile) {
        const text = await recognizeText(croppedImageFile); // Send cropped image to OCR
        const players = parsePlayerData(text) as Omit<PlayerStub, 'id' | 'devTrait' | 'notes' | 'jerseyNumber'>[];
        onProcessComplete(players);
        toast.success('Roster processed from cropped image!');
      } else {
        toast.error('Failed to crop image.');
      }
    } catch (error) {
      console.error('Error processing cropped image:', error);
      toast.error('Error processing image. Check console for details.');
    } finally {
      setIsProcessing(false);
      // Optionally reset UI after processing
      // setIsCropping(false);
      // setImgSrc('');
      // setOriginalFile(null);
      // if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleChooseFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleCancelCrop = () => {
    setIsCropping(false);
    setImgSrc('');
    setOriginalFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
        id="roster-image-upload-input-cropper"
      />

      {!isCropping && (
        <Button
          type="button"
          variant="outline"
          onClick={handleChooseFileClick}
          className="w-full sm:w-auto"
        >
          Upload Roster Image
        </Button>
      )}

      {isCropping && imgSrc && (
        <div className="w-full max-w-2xl p-4 border rounded-md shadow-sm bg-card">
          <p className="text-sm text-muted-foreground mb-2 text-center">
            Drag to select the area containing player names, positions, and overall ratings.
          </p>
          <div className="max-h-[60vh] overflow-auto flex justify-center">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              // minWidth={100} // Optional: min crop dimensions
              // minHeight={50}
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={imgSrc}
                onLoad={onImageLoad}
                style={{ maxHeight: '55vh', objectFit: 'contain' }} // Ensure image fits and isn't overly large
              />
            </ReactCrop>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <Button
              onClick={handleConfirmCrop}
              disabled={!completedCrop || isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Confirm Crop & Process'}
            </Button>
            <Button variant="outline" onClick={handleCancelCrop} disabled={isProcessing}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RosterImageUpload;