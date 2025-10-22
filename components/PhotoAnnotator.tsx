'use client';

import { useRef, useState, useEffect } from 'react';

interface PhotoAnnotatorProps {
  imageUrl: string;
  onSave: (annotatedDataUrl: string, annotations: Annotation[]) => void;
  onClose: () => void;
  initialAnnotations?: Annotation[];
}

export interface Annotation {
  id: string;
  type: 'arrow' | 'circle' | 'rectangle' | 'text';
  x: number;
  y: number;
  x2?: number;
  y2?: number;
  radius?: number;
  text?: string;
  color: string;
}

export default function PhotoAnnotator({ imageUrl, onSave, onClose, initialAnnotations = [] }: PhotoAnnotatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>(initialAnnotations);
  const [currentTool, setCurrentTool] = useState<'arrow' | 'circle' | 'rectangle' | 'text'>('arrow');
  const [currentColor, setCurrentColor] = useState('#FF0000');
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImage(img);
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.width = img.width;
        canvas.height = img.height;
        redraw(img, initialAnnotations);
      }
    };
    img.src = imageUrl;
  }, [imageUrl, initialAnnotations]);

  const redraw = (img: HTMLImageElement, anns: Annotation[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    anns.forEach(ann => {
      ctx.strokeStyle = ann.color;
      ctx.fillStyle = ann.color;
      ctx.lineWidth = 3;

      if (ann.type === 'arrow' && ann.x2 !== undefined && ann.y2 !== undefined) {
        drawArrow(ctx, ann.x, ann.y, ann.x2, ann.y2);
      } else if (ann.type === 'circle' && ann.radius !== undefined) {
        ctx.beginPath();
        ctx.arc(ann.x, ann.y, ann.radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (ann.type === 'rectangle' && ann.x2 !== undefined && ann.y2 !== undefined) {
        ctx.strokeRect(ann.x, ann.y, ann.x2 - ann.x, ann.y2 - ann.y);
      } else if (ann.type === 'text' && ann.text) {
        ctx.font = '20px Arial';
        ctx.fillText(ann.text, ann.x, ann.y);
      }
    });
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) => {
    const headlen = 15;
    const angle = Math.atan2(y2 - y1, x2 - x1);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headlen * Math.cos(angle - Math.PI / 6), y2 - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headlen * Math.cos(angle + Math.PI / 6), y2 - headlen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasCoordinates(e);
    setStartPos(pos);
    setIsDrawing(true);

    if (currentTool === 'text') {
      setTextPosition(pos);
      setShowTextInput(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !image || currentTool === 'text') return;
    const pos = getCanvasCoordinates(e);

    const tempAnns = [...annotations];

    if (currentTool === 'arrow' || currentTool === 'rectangle') {
      // Preview
      redraw(image, tempAnns);
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = 3;
        if (currentTool === 'arrow') {
          drawArrow(ctx, startPos.x, startPos.y, pos.x, pos.y);
        } else {
          ctx.strokeRect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y);
        }
      }
    } else if (currentTool === 'circle') {
      const radius = Math.sqrt(Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2));
      redraw(image, tempAnns);
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !image || currentTool === 'text') {
      setIsDrawing(false);
      return;
    }

    const pos = getCanvasCoordinates(e);
    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      type: currentTool,
      x: startPos.x,
      y: startPos.y,
      color: currentColor,
    };

    if (currentTool === 'arrow' || currentTool === 'rectangle') {
      newAnnotation.x2 = pos.x;
      newAnnotation.y2 = pos.y;
    } else if (currentTool === 'circle') {
      newAnnotation.radius = Math.sqrt(Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2));
    }

    const updatedAnnotations = [...annotations, newAnnotation];
    setAnnotations(updatedAnnotations);
    redraw(image, updatedAnnotations);
    setIsDrawing(false);
  };

  const handleTextSubmit = () => {
    if (!textInput.trim() || !image) return;

    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      type: 'text',
      x: textPosition.x,
      y: textPosition.y,
      text: textInput,
      color: currentColor,
    };

    const updatedAnnotations = [...annotations, newAnnotation];
    setAnnotations(updatedAnnotations);
    redraw(image, updatedAnnotations);
    setTextInput('');
    setShowTextInput(false);
  };

  const handleUndo = () => {
    if (annotations.length === 0) return;
    const updatedAnnotations = annotations.slice(0, -1);
    setAnnotations(updatedAnnotations);
    if (image) redraw(image, updatedAnnotations);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl, annotations);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-uc-navy-light rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-300 dark:border-uc-blue/30 flex justify-between items-center">
          <h3 className="text-xl font-bold text-uc-navy dark:text-white">Annotate Photo</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-300 dark:border-uc-blue/30 flex flex-wrap gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentTool('arrow')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentTool === 'arrow'
                  ? 'bg-uc-blue text-white'
                  : 'bg-slate-200 dark:bg-uc-navy text-uc-navy dark:text-white hover:bg-slate-300'
              }`}
            >
              Arrow
            </button>
            <button
              onClick={() => setCurrentTool('circle')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentTool === 'circle'
                  ? 'bg-uc-blue text-white'
                  : 'bg-slate-200 dark:bg-uc-navy text-uc-navy dark:text-white hover:bg-slate-300'
              }`}
            >
              Circle
            </button>
            <button
              onClick={() => setCurrentTool('rectangle')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentTool === 'rectangle'
                  ? 'bg-uc-blue text-white'
                  : 'bg-slate-200 dark:bg-uc-navy text-uc-navy dark:text-white hover:bg-slate-300'
              }`}
            >
              Rectangle
            </button>
            <button
              onClick={() => setCurrentTool('text')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentTool === 'text'
                  ? 'bg-uc-blue text-white'
                  : 'bg-slate-200 dark:bg-uc-navy text-uc-navy dark:text-white hover:bg-slate-300'
              }`}
            >
              Text
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-uc-navy dark:text-white">Color:</label>
            <input
              type="color"
              value={currentColor}
              onChange={(e) => setCurrentColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
            />
          </div>

          <button
            onClick={handleUndo}
            className="px-4 py-2 bg-slate-200 dark:bg-uc-navy text-uc-navy dark:text-white rounded-lg hover:bg-slate-300 font-medium"
          >
            Undo
          </button>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto p-4 bg-slate-100 dark:bg-uc-navy">
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className="max-w-full h-auto border-2 border-slate-300 dark:border-uc-blue/30 cursor-crosshair"
            />
          </div>
        </div>

        {/* Text Input Modal */}
        {showTextInput && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white dark:bg-uc-navy-light p-6 rounded-lg shadow-xl">
              <h4 className="text-lg font-bold mb-4 text-uc-navy dark:text-white">Enter Text</h4>
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
                placeholder="Type annotation text..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-4 dark:bg-uc-navy dark:border-uc-blue/30 dark:text-white"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleTextSubmit}
                  className="flex-1 bg-uc-blue text-white px-4 py-2 rounded-lg hover:bg-uc-blue-dark"
                >
                  Add Text
                </button>
                <button
                  onClick={() => {
                    setShowTextInput(false);
                    setTextInput('');
                  }}
                  className="flex-1 bg-slate-300 text-uc-navy px-4 py-2 rounded-lg hover:bg-slate-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-slate-300 dark:border-uc-blue/30 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-300 text-uc-navy rounded-lg hover:bg-slate-400 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-uc-blue text-white rounded-lg hover:bg-uc-blue-dark font-medium"
          >
            Save Annotations
          </button>
        </div>
      </div>
    </div>
  );
}
