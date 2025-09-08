import React, { useRef, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '../../types';

interface CanvasProps {
    socket: Socket<ServerToClientEvents, ClientToServerEvents>;
    roomId: string;
    isDrawer: boolean;
}

// --- Revised: Simplified tools ---
type Tool = 'draw' | 'erase' | 'line';

// --- Revised: Simplified action type ---
interface DrawAction {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    color: string;
    tool: Tool;
    brushSize: number;
}

const Canvas: React.FC<CanvasProps> = ({ socket, roomId, isDrawer }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const previewCanvasRef = useRef<HTMLCanvasElement>(null);
    
    // --- State for drawing tools ---
    const [tool, setTool] = useState<Tool>('draw');
    const [color, setColor] = useState<string>('#000000'); // Default to black
    const [brushSize, setBrushSize] = useState<number>(5);
    const [showColorPicker, setShowColorPicker] = useState<boolean>(false);

    // --- State for Undo/Redo functionality ---
    const [history, setHistory] = useState<DrawAction[][]>([]);
    const [redoStack, setRedoStack] = useState<DrawAction[][]>([]);
    
    // --- Refs for tracking drawing state ---
    const isDrawingRef = useRef<boolean>(false);
    const startPosRef = useRef<{ x: number, y: number } | null>(null);
    const currentPathRef = useRef<DrawAction[]>([]);

    // --- Core drawing function to draw a single segment ---
    const drawSegment = (ctx: CanvasRenderingContext2D, action: DrawAction) => {
        ctx.save();
        ctx.lineWidth = action.brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (action.tool === 'erase') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.strokeStyle = 'rgba(0,0,0,1)';
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = action.color;
        }

        ctx.beginPath();
        ctx.moveTo(action.x0, action.y0);
        ctx.lineTo(action.x1, action.y1);
        ctx.stroke();
        ctx.restore();
    };

    // --- Redraws the entire canvas from history ---
    const redrawCanvas = (actions: DrawAction[][]) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        actions.forEach(path => {
            path.forEach(action => {
                drawSegment(ctx, action);
            });
        });
    };

    // --- Draws a preview for the line tool ---
    const drawPreview = (startPos: {x: number, y: number}, currentPos: {x: number, y: number}) => {
        const previewCanvas = previewCanvasRef.current;
        const ctx = previewCanvas?.getContext('2d');
        if (!ctx || !previewCanvas || tool !== 'line') return;

        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        ctx.setLineDash([5, 5]); // Dashed line for preview

        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(currentPos.x, currentPos.y);
        ctx.stroke();
        ctx.restore();
    };
    
    // --- Clear canvas function ---
    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        const previewCanvas = previewCanvasRef.current;
        const previewCtx = previewCanvas?.getContext('2d');
        if (previewCanvas && previewCtx) {
            previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        }
    };

    // --- Effect for initial setup and socket listeners ---
    useEffect(() => {
        const canvas = canvasRef.current;
        const previewCanvas = previewCanvasRef.current;
        if (!canvas || !previewCanvas) return;
        
        const resizeCanvas = () => {
            const rect = canvas.getBoundingClientRect();
            // Use device pixel ratio for sharp rendering
            const dpr = window.devicePixelRatio || 1;
            
            // Save current drawing to restore after resize
            const imageData = canvas.getContext('2d')?.getImageData(0, 0, canvas.width, canvas.height);
            
            // Set actual size in memory (scaled to account for extra pixel density)
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            previewCanvas.width = rect.width * dpr;
            previewCanvas.height = rect.height * dpr;
            
            // Scale the canvas back down using CSS
            canvas.style.width = rect.width + 'px';
            canvas.style.height = rect.height + 'px';
            previewCanvas.style.width = rect.width + 'px';
            previewCanvas.style.height = rect.height + 'px';
            
            // Scale the drawing context so everything draws at the correct size
            const ctx = canvas.getContext('2d');
            const previewCtx = previewCanvas.getContext('2d');
            if (ctx) {
                ctx.scale(dpr, dpr);
                ctx.imageSmoothingEnabled = false; // For crisp pixels
            }
            if (previewCtx) {
                previewCtx.scale(dpr, dpr);
                previewCtx.imageSmoothingEnabled = false;
            }

            // Restore drawing after resize
            if (imageData && ctx) {
                ctx.putImageData(imageData, 0, 0);
            }
            redrawCanvas(history);
        };

        // Initial setup
        resizeCanvas();
        
        // Listen for resize events
        window.addEventListener('resize', resizeCanvas);
        
        // Also listen for zoom events
        let resizeTimeout: NodeJS.Timeout;
        const handleZoom = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(resizeCanvas, 100);
        };
        
        window.addEventListener('wheel', handleZoom, { passive: true });

        // Listen for full canvas state from other users
        const handleCanvasState = (fullHistory: DrawAction[][]) => {
            setHistory(fullHistory);
            redrawCanvas(fullHistory);
        };
        
        const handleCanvasCleared = () => {
            clearCanvas();
            setHistory([]);
            setRedoStack([]);
        };

        socket.on('canvas-state', handleCanvasState);
        socket.on('canvas-cleared', handleCanvasCleared);

        return () => {
            socket.off('canvas-state', handleCanvasState);
            socket.off('canvas-cleared', handleCanvasCleared);
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('wheel', handleZoom);
            clearTimeout(resizeTimeout);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, history]); // Added history to redraw on resize

    // --- Redraws canvas whenever history changes ---
    useEffect(() => {
        redrawCanvas(history);
    }, [history]);

    // --- Helper to get coordinates from mouse/touch events ---
    const getCoords = (e: React.MouseEvent | React.TouchEvent): {x: number, y: number} | null => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();

        const clientX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
        
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    // --- Event Handlers for Drawing ---
    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawer) return;
        const coords = getCoords(e);
        if (!coords) return;

        isDrawingRef.current = true;
        startPosRef.current = coords;
        currentPathRef.current = []; // Start a new path for the history
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawer || !isDrawingRef.current) return;
        const currentPos = getCoords(e);
        const startPos = startPosRef.current;
        if (!currentPos || !startPos) return;

        const mainCtx = canvasRef.current?.getContext('2d');
        if (!mainCtx) return;

        if (['draw', 'erase'].includes(tool)) {
            const action: DrawAction = {
                x0: startPos.x,
                y0: startPos.y,
                x1: currentPos.x,
                y1: currentPos.y,
                color,
                tool,
                brushSize,
            };
            drawSegment(mainCtx, action); // Draw locally for immediate feedback
            currentPathRef.current.push(action); // Add segment to current path
            startPosRef.current = currentPos; // Update start position for the next segment
        } else if (tool === 'line') {
            drawPreview(startPos, currentPos);
        }
    };

    const stopDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawer || !isDrawingRef.current) return;
        isDrawingRef.current = false;

        const startPos = startPosRef.current;
        // Use the event's coordinates for the final position
        const currentPos = getCoords(e);
        if (!startPos || !currentPos) return;

        // Finalize the current path
        if (tool === 'line') {
            const action: DrawAction = {
                x0: startPos.x,
                y0: startPos.y,
                x1: currentPos.x,
                y1: currentPos.y,
                color,
                tool,
                brushSize
            };
            currentPathRef.current.push(action);
            // Clear the preview canvas
            const previewCanvas = previewCanvasRef.current;
            const previewCtx = previewCanvas?.getContext('2d');
            if (previewCtx && previewCanvas) {
                previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
            }
        }
        
        // If the path has any actions, add it to history
        if (currentPathRef.current.length > 0) {
            const newHistory = [...history, currentPathRef.current];
            setHistory(newHistory);
            setRedoStack([]); // A new action clears the redo stack
            socket.emit('canvas-state-update', { roomId, history: newHistory });
        }
        
        startPosRef.current = null;
        currentPathRef.current = [];
    };

    // --- Handlers for Undo, Redo, and Clear ---
    const handleUndo = () => {
        if (history.length === 0 || !isDrawer) return;

        const lastPath = history[history.length - 1];
        const newHistory = history.slice(0, -1);
        
        setHistory(newHistory);
        setRedoStack([lastPath, ...redoStack]);
        socket.emit('canvas-state-update', { roomId, history: newHistory });
    };

    const handleRedo = () => {
        if (redoStack.length === 0 || !isDrawer) return;

        const nextPath = redoStack[0];
        const newRedoStack = redoStack.slice(1);
        const newHistory = [...history, nextPath];

        setHistory(newHistory);
        setRedoStack(newRedoStack);
        socket.emit('canvas-state-update', { roomId, history: newHistory });
    };

    const handleClearCanvas = () => {
        if (!isDrawer) return;
        clearCanvas();
        setHistory([]);
        setRedoStack([]);
        socket.emit('clear-canvas', roomId);
    };

    return (
        <div className="w-full h-full flex flex-col">
            {/* Drawing controls - only visible to the drawer */}
            {isDrawer && (
                <div className="flex-shrink-0 p-3 bg-white border-2 border-black rounded-xl mb-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <div className="text-sm font-black mb-2 uppercase">Drawing Tools</div>
                    {/* Tools & Actions */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Tools */}
                        <div className="flex items-center gap-2">
                            <span className="text-black text-xs font-black uppercase">Tools:</span>
                            {['draw', 'erase', 'line'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setTool(t as Tool)}
                                    className={`px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 transition-colors border-2 font-black uppercase ${tool === t ? 'bg-black text-white border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]' : 'bg-white text-black border-black hover:bg-gray-100 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'}`}
                                >
                                    <span className="text-sm">
                                        {t === 'draw' && '✏️'}
                                        {t === 'erase' && '🧽'}
                                        {t === 'line' && '📏'}
                                    </span>
                                    <span className="hidden sm:inline text-xs">{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                                </button>
                            ))}
                        </div>
                        
                        {/* Undo/Redo */}
                        <div className="flex items-center gap-1.5">
                            <button 
                                onClick={handleUndo} 
                                disabled={history.length === 0} 
                                className="px-3 py-1.5 bg-white border-2 border-black text-black rounded-full text-xs hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 font-black uppercase shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                            >
                                <span className="text-sm">↩️</span>
                                <span className="hidden sm:inline text-xs">Undo</span>
                            </button>
                            <button 
                                onClick={handleRedo} 
                                disabled={redoStack.length === 0} 
                                className="px-3 py-1.5 bg-white border-2 border-black text-black rounded-full text-xs hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 font-black uppercase shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                            >
                                <span className="text-sm">↪️</span>
                                <span className="hidden sm:inline text-xs">Redo</span>
                            </button>
                        </div>
                        
                        {/* Color Picker */}
                        <div className="relative">
                            <div className="flex items-center gap-2">
                                <span className="text-black text-xs font-black uppercase">Color:</span>
                                <button
                                    onClick={() => setShowColorPicker(!showColorPicker)}
                                    className="w-8 h-8 rounded-full border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-shadow"
                                    style={{ backgroundColor: color }}
                                />
                            </div>
                            {showColorPicker && (
                                <div className="absolute top-12 left-0 bg-white border-2 border-black p-3 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] z-10">
                                    <div className="text-xs font-black mb-2 uppercase">Choose Color</div>
                                    <input
                                        type="color"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        className="w-full h-8 rounded border-2 border-black cursor-pointer mb-2"
                                    />
                                    <div className="grid grid-cols-5 gap-1">
                                        {['#FFFFFF', '#000000', '#EF4444', '#3B82F6', '#22C55E', '#F97316', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'].map(c => (
                                            <button
                                                key={c}
                                                onClick={() => {setColor(c); setShowColorPicker(false);}}
                                                className="w-6 h-6 rounded-full border border-black hover:scale-110 transition-transform"
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Brush Size */}
                        <div className="flex items-center gap-2">
                            <span className="text-black text-xs font-black uppercase">Size:</span>
                            <div className="flex items-center gap-1.5 bg-gray-100 border-2 border-black rounded-full px-2 py-0.5">
                                <input
                                    type="range" 
                                    min="1" 
                                    max="50" 
                                    value={brushSize}
                                    onChange={(e) => setBrushSize(Number(e.target.value))}
                                    className="w-16"
                                />
                                <span className="text-black text-xs w-6 text-center font-black">{brushSize}</span>
                            </div>
                        </div>

                        {/* Clear Button */}
                        <button 
                            onClick={handleClearCanvas}
                            className="px-3 py-1.5 bg-red-600 border-2 border-red-600 rounded-full text-xs hover:bg-red-700 text-white flex items-center gap-1 font-black uppercase shadow-[1px_1px_0px_0px_rgba(139,0,0,1)] hover:shadow-none transition-shadow"
                        >
                            <span className="text-sm">🗑️</span> Clear
                        </button>
                    </div>
                </div>
            )}
            
            {/* Canvas Container - Fully responsive */}
            <div className="flex-1 relative bg-white border-2 border-black rounded-xl overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] min-h-[300px]">
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                    style={{ 
                        imageRendering: 'pixelated',
                        touchAction: 'none'
                    }}
                />
                {/* Preview Canvas for line tool */}
                <canvas
                    ref={previewCanvasRef}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                />
                
                {/* Corner indicators for drawing area */}
                <div className="absolute top-2 right-2 w-3 h-3 bg-gray-200 border border-black rounded-full"></div>
                <div className="absolute bottom-2 left-2 w-2 h-2 bg-gray-300 border border-black rounded-full"></div>
            </div>
        </div>
    );
};

export default Canvas;