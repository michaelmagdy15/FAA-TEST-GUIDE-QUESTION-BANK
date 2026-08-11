import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Printer, Download } from 'lucide-react';

interface FigureModalProps {
    isOpen: boolean;
    onClose: () => void;
    figureUrl: string;
    figureNumber: number;
}

export const FigureModal: React.FC<FigureModalProps> = ({ isOpen, onClose, figureUrl, figureNumber }) => {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Reset zoom when opening new figure
    useEffect(() => {
        if (isOpen) {
            setScale(1);
            setPosition({ x: 0, y: 0 });
        }
    }, [isOpen, figureUrl]);

    // Handle keyboard shortcuts
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === '+' || e.key === '=') handleZoomIn();
            if (e.key === '-') handleZoomOut();
            if (e.key === '0') handleReset();
            if (e.key === 'p' || e.key === 'P') handlePrint();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, scale]);

    const handleZoomIn = useCallback(() => {
        setScale(prev => Math.min(prev + 0.25, 4));
    }, []);

    const handleZoomOut = useCallback(() => {
        setScale(prev => Math.max(prev - 0.25, 0.25));
    }, []);

    const handleReset = useCallback(() => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    }, []);

    const handlePrint = useCallback(() => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head>
                    <title>FAA Figure ${figureNumber}</title>
                    <style>
                        body { 
                            margin: 0; 
                            padding: 20px; 
                            display: flex; 
                            justify-content: center; 
                            align-items: center; 
                            min-height: 100vh;
                            background: white;
                        }
                        img { 
                            max-width: 100%; 
                            max-height: 100vh;
                            object-fit: contain;
                        }
                        @media print {
                            body { padding: 0; }
                            img { max-width: 100%; }
                        }
                    </style>
                </head>
                <body>
                    <img src="${figureUrl}" alt="FAA Figure ${figureNumber}" onload="window.print();window.close();" />
                </body>
                </html>
            `);
            printWindow.document.close();
        }
    }, [figureUrl, figureNumber]);

    const handleDownload = useCallback(() => {
        const link = document.createElement('a');
        link.href = figureUrl;
        link.download = `FAA_Figure_${figureNumber}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [figureUrl, figureNumber]);

    // Mouse wheel zoom
    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        if (e.deltaY < 0) {
            handleZoomIn();
        } else {
            handleZoomOut();
        }
    }, [handleZoomIn, handleZoomOut]);

    // Touch pinch zoom
    const lastTouchDistance = useRef<number>(0);
    
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            const distance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            lastTouchDistance.current = distance;
        } else if (e.touches.length === 1) {
            setIsDragging(true);
            setDragStart({
                x: e.touches[0].clientX - position.x,
                y: e.touches[0].clientY - position.y
            });
        }
    }, [position]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            const distance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            const delta = distance - lastTouchDistance.current;
            lastTouchDistance.current = distance;
            
            setScale(prev => {
                const newScale = prev + (delta * 0.005);
                return Math.max(0.25, Math.min(4, newScale));
            });
        } else if (e.touches.length === 1 && isDragging) {
            setPosition({
                x: e.touches[0].clientX - dragStart.x,
                y: e.touches[0].clientY - dragStart.y
            });
        }
    }, [isDragging, dragStart]);

    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Mouse drag
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (scale > 1) {
            setIsDragging(true);
            setDragStart({
                x: e.clientX - position.x,
                y: e.clientY - position.y
            });
        }
    }, [scale, position]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    }, [isDragging, dragStart]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                flexShrink: 0,
            }}>
                <span style={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>
                    Figure {figureNumber}
                </span>
                
                {/* Zoom controls */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', minWidth: '50px', textAlign: 'center' }}>
                        {Math.round(scale * 100)}%
                    </span>
                    <button
                        onClick={handleZoomOut}
                        style={{
                            padding: '0.5rem',
                            borderRadius: '6px',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        title="Zoom Out (-)"
                    >
                        <ZoomOut size={18} />
                    </button>
                    <button
                        onClick={handleZoomIn}
                        style={{
                            padding: '0.5rem',
                            borderRadius: '6px',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        title="Zoom In (+)"
                    >
                        <ZoomIn size={18} />
                    </button>
                    <button
                        onClick={handleReset}
                        style={{
                            padding: '0.5rem',
                            borderRadius: '6px',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        title="Reset Zoom (0)"
                    >
                        <RotateCcw size={18} />
                    </button>
                    
                    <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.2)', margin: '0 0.25rem' }} />
                    
                    <button
                        onClick={handlePrint}
                        style={{
                            padding: '0.5rem',
                            borderRadius: '6px',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        title="Print (P)"
                    >
                        <Printer size={18} />
                    </button>
                    <button
                        onClick={handleDownload}
                        style={{
                            padding: '0.5rem',
                            borderRadius: '6px',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        title="Download"
                    >
                        <Download size={18} />
                    </button>
                </div>

                <button
                    onClick={onClose}
                    style={{
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    title="Close (Esc)"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Image container */}
            <div
                ref={containerRef}
                style={{
                    flex: 1,
                    overflow: 'hidden',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                    touchAction: 'none',
                }}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <img
                    ref={imageRef}
                    src={figureUrl}
                    alt={`FAA Figure ${figureNumber}`}
                    style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                        transition: isDragging ? 'none' : 'transform 0.1s ease',
                        userSelect: 'none',
                    }}
                    draggable={false}
                />
            </div>

            {/* Mobile instructions */}
            <div style={{
                padding: '0.75rem',
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.75rem',
                flexShrink: 0,
            }}>
                <span className="desktop-only">Scroll to zoom • Drag to pan • Press Esc to close</span>
                <span className="mobile-only">Pinch to zoom • Drag to pan • Tap X to close</span>
            </div>

            <style>{`
                .desktop-only { display: inline; }
                .mobile-only { display: none; }
                
                @media (max-width: 768px) {
                    .desktop-only { display: none; }
                    .mobile-only { display: inline; }
                }
            `}</style>
        </div>
    );
};
