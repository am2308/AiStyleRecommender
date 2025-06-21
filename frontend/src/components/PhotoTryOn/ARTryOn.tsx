import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, RefreshCw, Download, Share2, Zap, Info, X } from 'lucide-react';
import { ZapparCamera, ZapparCanvas, BrowserCompatibility } from '@zappar/zappar-react-three-fiber';
import { FaceMesh } from '@zappar/zappar-react-three-fiber';
import * as THREE from 'three';

interface ARTryOnProps {
  wardrobeItem: {
    id: string;
    name: string;
    category: string;
    color: string;
    imageUrl: string;
  } | null;
  onCapture: (imageDataUrl: string) => void;
}

const ARTryOn: React.FC<ARTryOnProps> = ({ wardrobeItem, onCapture }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [showTips, setShowTips] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textureRef = useRef<THREE.Texture | null>(null);
  const [isTextureLoaded, setIsTextureLoaded] = useState(false);
  
  // Load the wardrobe item texture
  useEffect(() => {
    if (wardrobeItem?.imageUrl) {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
        wardrobeItem.imageUrl,
        (texture) => {
          textureRef.current = texture;
          setIsTextureLoaded(true);
        },
        undefined,
        (error) => {
          console.error('Error loading texture:', error);
        }
      );
    }
    
    return () => {
      if (textureRef.current) {
        textureRef.current.dispose();
      }
    };
  }, [wardrobeItem]);

  const handleCapture = () => {
    setIsCapturing(true);
    
    // Small delay to ensure UI updates before capture
    setTimeout(() => {
      if (canvasRef.current) {
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        onCapture(dataUrl);
        setIsCapturing(false);
      }
    }, 300);
  };

  return (
    <div className="relative">
      {/* Tips Overlay */}
      {showTips && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-10 bg-black/70 flex items-center justify-center"
        >
          <div className="bg-white rounded-xl p-6 max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">AR Try-On Tips</h3>
              <button 
                onClick={() => setShowTips(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <ul className="space-y-2 text-gray-700 mb-4">
              <li className="flex items-start">
                <span className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">1</span>
                <span>Position your face in the center of the screen</span>
              </li>
              <li className="flex items-start">
                <span className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">2</span>
                <span>Ensure good lighting for best results</span>
              </li>
              <li className="flex items-start">
                <span className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">3</span>
                <span>Try different angles to see how the item looks</span>
              </li>
              <li className="flex items-start">
                <span className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">4</span>
                <span>Tap the camera button to capture your look</span>
              </li>
            </ul>
            
            <button
              onClick={() => setShowTips(false)}
              className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Got it, let's try on!
            </button>
          </div>
        </motion.div>
      )}
      
      {/* AR Canvas */}
      <div className="h-[60vh] bg-gray-100 rounded-lg overflow-hidden">
        <BrowserCompatibility />
        <ZapparCanvas ref={canvasRef}>
          <ZapparCamera />
          
          {isTextureLoaded && wardrobeItem && (
            <FaceMesh>
              {/* AR Content based on wardrobe item category */}
              {wardrobeItem.category === 'Accessories' && (
                <>
                  {/* For glasses or hats */}
                  {(wardrobeItem.name.toLowerCase().includes('glasses') || 
                    wardrobeItem.name.toLowerCase().includes('sunglasses')) && (
                    <mesh position={[0, 0.03, 0.08]}>
                      <planeGeometry args={[0.12, 0.05]} />
                      <meshBasicMaterial map={textureRef.current} transparent opacity={0.9} />
                    </mesh>
                  )}
                  
                  {(wardrobeItem.name.toLowerCase().includes('hat') || 
                    wardrobeItem.name.toLowerCase().includes('cap')) && (
                    <mesh position={[0, 0.08, -0.02]} rotation={[0.3, 0, 0]}>
                      <planeGeometry args={[0.15, 0.1]} />
                      <meshBasicMaterial map={textureRef.current} transparent opacity={0.9} />
                    </mesh>
                  )}
                </>
              )}
              
              {/* For tops and outerwear */}
              {(wardrobeItem.category === 'Tops' || 
                wardrobeItem.category === 'Outerwear') && (
                <mesh position={[0, -0.15, 0.05]}>
                  <planeGeometry args={[0.2, 0.25]} />
                  <meshBasicMaterial map={textureRef.current} transparent opacity={0.9} />
                </mesh>
              )}
            </FaceMesh>
          )}
          
          <ambientLight intensity={0.5} />
          <directionalLight position={[0, 5, 10]} intensity={1} />
        </ZapparCanvas>
      </div>
      
      {/* Controls */}
      <div className="mt-4 flex justify-center space-x-4">
        <button
          onClick={handleCapture}
          disabled={isCapturing || !isTextureLoaded}
          className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50"
        >
          <Camera className="w-6 h-6" />
        </button>
      </div>
      
      {/* Item Info */}
      {wardrobeItem && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
              <img 
                src={wardrobeItem.imageUrl} 
                alt={wardrobeItem.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400';
                }}
              />
            </div>
            <div>
              <p className="font-medium text-gray-900">{wardrobeItem.name}</p>
              <p className="text-sm text-gray-600">{wardrobeItem.category} • {wardrobeItem.color}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Technology Info */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center">
          <Zap className="w-3 h-3 mr-1 text-purple-600" />
          <span>Powered by AR technology</span>
        </div>
        <button
          onClick={() => setShowTips(true)}
          className="text-purple-600 hover:text-purple-800 flex items-center"
        >
          <Info className="w-3 h-3 mr-1" />
          <span>Show tips</span>
        </button>
      </div>
    </div>
  );
};

export default ARTryOn;