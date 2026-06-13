import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export const BeforeAfterSlider: React.FC = () => {
  const { beforeAfterItems } = useApp();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 0 to 100
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<boolean>(false);

  // Get list of unique treatment categories
  const categories = ['All', ...Array.from(new Set(beforeAfterItems.map(item => item.treatment)))];

  // Filter items based on active category
  const filteredItems = activeCategory === 'All' 
    ? beforeAfterItems 
    : beforeAfterItems.filter(item => item.treatment === activeCategory);

  // Reset active item index if category changes
  useEffect(() => {
    setActiveItemIndex(0);
    setSliderPosition(50);
  }, [activeCategory]);

  const activeItem = filteredItems[activeItemIndex];

  // Handle slider drag movement
  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const startDragging = () => {
    isDragging.current = true;
  };

  const stopDragging = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    const handleMouseUp = () => {
      isDragging.current = false;
    };
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h2 className="font-serif text-3xl md:text-5xl font-bold text-emerald-950 tracking-tighter">Clinical Transformations</h2>
        <p className="text-neutral-500 text-sm mt-2 font-medium">Real results from Dr. Megha's specialized clinical procedures</p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeCategory === cat
                ? 'bg-emerald-900 text-white shadow-md'
                : 'bg-white border border-neutral-100 text-neutral-500 hover:bg-neutral-50 hover:text-emerald-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <div className="glass-card bg-white/60 p-12 rounded-[32px] text-center border border-white text-neutral-400 font-bold uppercase tracking-wider shadow-xl shadow-emerald-950/5">
          <span className="material-symbols-outlined text-4xl text-neutral-300 mb-2">image_not_supported</span>
          <p>No Transformation Records Found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
          {/* Main Slider Display Area - 3 columns */}
          <div className="md:col-span-3 space-y-4">
            <div 
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              onMouseDown={startDragging}
              onTouchStart={startDragging}
              onMouseLeave={stopDragging}
              className="relative aspect-[4/3] rounded-[24px] overflow-hidden shadow-2xl select-none cursor-ew-resize border-4 border-white"
            >
              {/* Before Image (Background) */}
              <img 
                src={activeItem.beforeUrl} 
                alt="Before" 
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
              <div className="absolute top-4 left-4 bg-emerald-950/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full z-10">
                Before
              </div>

              {/* After Image (Overlay, width controlled by slider) */}
              <div 
                className="absolute inset-y-0 right-0 overflow-hidden pointer-events-none"
                style={{ left: `${sliderPosition}%` }}
              >
                <img 
                  src={activeItem.afterUrl} 
                  alt="After" 
                  className="absolute top-0 right-0 w-full h-full object-cover max-w-none pointer-events-none"
                  style={{ width: containerRef.current?.getBoundingClientRect().width }}
                />
              </div>
              <div className="absolute top-4 right-4 bg-emerald-500/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full z-10">
                After
              </div>

              {/* Drag Handle Divider */}
              <div 
                className="absolute inset-y-0 w-1 bg-white cursor-ew-resize z-20"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white text-emerald-950 rounded-full flex items-center justify-center shadow-2xl border-2 border-emerald-900/10">
                  <span className="material-symbols-outlined text-lg">unfold_more</span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-neutral-400 text-center font-semibold uppercase tracking-widest">
              Drag the center slider handle left & right to compare
            </p>
          </div>

          {/* Details & Selectors - 2 columns */}
          <div className="md:col-span-2 space-y-6">
            <div className="glass-card bg-white/70 border border-white rounded-[32px] p-6 shadow-xl shadow-emerald-950/5 space-y-4">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-emerald-800 bg-emerald-100/40 px-3 py-1 rounded-full border border-emerald-900/5 inline-block">
                  Case File
                </span>
                <h3 className="font-serif text-2xl font-bold text-emerald-950 mt-3">{activeItem.title}</h3>
                <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-1">{activeItem.treatment}</p>
              </div>

              <div className="h-px bg-emerald-900/5 my-2" />

              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Treatment Details</h4>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                  This patient underwent a custom session targeting skin irregularities. Full results were captured 4-6 weeks post-procedure. Results may vary depending on patient skin factors.
                </p>
              </div>
            </div>

            {/* Pagination/Item Selector */}
            {filteredItems.length > 1 && (
              <div className="flex items-center justify-between px-2">
                <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">
                  Transformation {activeItemIndex + 1} of {filteredItems.length}
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveItemIndex(prev => Math.max(0, prev - 1))}
                    disabled={activeItemIndex === 0}
                    className="w-10 h-10 rounded-full border border-neutral-100 flex items-center justify-center bg-white/50 hover:bg-emerald-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">chevron_left</span>
                  </button>
                  <button 
                    onClick={() => setActiveItemIndex(prev => Math.min(filteredItems.length - 1, prev + 1))}
                    disabled={activeItemIndex === filteredItems.length - 1}
                    className="w-10 h-10 rounded-full border border-neutral-100 flex items-center justify-center bg-white/50 hover:bg-emerald-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
