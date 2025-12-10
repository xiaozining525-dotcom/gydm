
import React, { useState, useEffect, useCallback, useRef } from 'react';
import DanmuLayer from './components/DanmuLayer';
import InputBar from './components/InputBar';
import { DanmuItem } from './types';
import { MAX_TRACKS, FONT_OPTIONS } from './constants';

// Cloudflare Pages API Endpoint
const API_URL = '/api/danmu';

// Interface for DB Row structure
interface DBComment {
  text: string;
  color?: string;
  font?: string;
}

const App: React.FC = () => {
  const [activeItems, setActiveItems] = useState<DanmuItem[]>([]);
  const [commentPool, setCommentPool] = useState<DBComment[]>([]);
  
  // Background State: Track if video is ready to show
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [stars, setStars] = useState<{id: number, left: string, top: string, size: string, duration: string}[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Track Management: Store the timestamp when a track was last used
  const trackLastUsedTime = useRef<number[]>(new Array(MAX_TRACKS).fill(0));
  
  // Throttle Management: Track when a specific text was last spawned
  const lastSpawnedMap = useRef<Map<string, number>>(new Map());

  // Initialize: Generate Stars & Check Video
  useEffect(() => {
    // 1. Generate Stars for fallback background
    const starArray = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 60}%`, // Mostly in upper sky
      size: `${Math.random() * 3 + 1}px`,
      duration: `${Math.random() * 3 + 2}s`
    }));
    setStars(starArray);

    // 2. Check if video is already ready (e.g. cached)
    if (videoRef.current) {
        // Ensure muted is set for autoplay policy
        videoRef.current.defaultMuted = true;
        videoRef.current.muted = true;
        
        if (videoRef.current.readyState >= 3) {
            setVideoLoaded(true);
        }
    }
  }, []);

  // Initialize: Fetch comments from Cloudflare D1 API
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(API_URL);
        
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            console.log(`Successfully loaded ${data.length} comments from database.`);
            const validComments: DBComment[] = data.map((d: any) => ({
                text: d.text || d, 
                color: d.color || '#ffffff',
                font: d.font || FONT_OPTIONS[0].value
            }));
            setCommentPool(validComments);
          } else {
            console.log("Database connected but empty.");
            setCommentPool([]); // Explicitly empty
          }
        } else {
            console.warn("API request failed, status:", res.status);
            // Don't fallback to defaults, just keep empty
            setCommentPool([]);
        }
      } catch (e) {
        console.error("Failed to fetch comments:", e);
        setCommentPool([]);
      }
    };
    fetchComments();
  }, []);

  // Helper: Find the best track (least recently used)
  const getBestTrack = useCallback(() => {
    const now = Date.now();
    let bestTrack = 0;
    let maxGap = -1;

    // Try to find a track that hasn't been used in a while (e.g., 2500ms)
    const safeTracks: number[] = [];
    
    for (let i = 0; i < MAX_TRACKS; i++) {
        const gap = now - trackLastUsedTime.current[i];
        if (gap > 2500) { 
            safeTracks.push(i);
        }
        if (gap > maxGap) {
            maxGap = gap;
            bestTrack = i;
        }
    }

    if (safeTracks.length > 0) {
        return safeTracks[Math.floor(Math.random() * safeTracks.length)];
    }
    return bestTrack; // Fallback to the one used longest ago
  }, []);

  // Helper: Spawn a single Danmu
  const spawnDanmu = useCallback((text: string, color: string = '#ffffff', font: string = FONT_OPTIONS[0].value) => {
    const track = getBestTrack();
    trackLastUsedTime.current[track] = Date.now();
    lastSpawnedMap.current.set(text, Date.now());

    const newItem: DanmuItem = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      color,
      font,
      track,
      speed: 12 + Math.random() * 6, // 12-18 seconds
      timestamp: Date.now(),
    };
    setActiveItems(prev => [...prev, newItem]);
  }, [getBestTrack]);

  // Natural Loop Logic
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const loop = () => {
      // Only loop if we have comments in the pool
      if (activeItems.length < 25 && commentPool.length > 0) {
        const shouldSpawn = Math.random() > 0.3; 
        
        if (shouldSpawn) {
            const now = Date.now();
            // Filter: Only pick comments that haven't been shown in the last 10 seconds
            const candidates = commentPool.filter(item => {
                const lastTime = lastSpawnedMap.current.get(item.text) || 0;
                return now - lastTime >= 10000;
            });

            if (candidates.length > 0) {
                const randomItem = candidates[Math.floor(Math.random() * candidates.length)];
                spawnDanmu(randomItem.text, randomItem.color, randomItem.font);
            }
        }
      }
      
      const nextDelay = 800 + Math.random() * 1700;
      timeoutId = setTimeout(loop, nextDelay);
    };

    loop();
    return () => clearTimeout(timeoutId);
  }, [activeItems.length, commentPool, spawnDanmu]);

  // Handle User Send (Save to D1 via API)
  const handleUserSend = async (text: string, color: string, font: string) => {
    // 1. Display immediately
    spawnDanmu(text, color, font);

    // 2. Add to local pool so it loops in this session immediately
    setCommentPool(prev => {
        const newPool = [...prev, { text, color, font }];
        return newPool.length > 150 ? newPool.slice(newPool.length - 150) : newPool;
    });

    // 3. Persist to Cloudflare D1
    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, color, font, timestamp: Date.now() })
        });
    } catch (e) {
        console.error("Failed to save comment to DB", e);
    }
  };

  const handleAnimationEnd = (id: string) => {
    setActiveItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="relative w-full h-screen overflow-hidden font-sans select-none bg-black">
      {/* Background Container */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        
        {/* Layer 1: Starry Sky Fallback (Always rendered as base) */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#312e81] z-0">
            {/* Simulated Horizon Glow */}
            <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-[#fbbf24]/20 to-transparent" />
            {/* Stars */}
            {stars.map(star => (
                <div 
                    key={star.id} 
                    className="star" 
                    style={{
                        left: star.left,
                        top: star.top,
                        width: star.size,
                        height: star.size,
                        '--duration': star.duration
                    } as React.CSSProperties}
                />
            ))}
        </div>

        {/* Layer 2: Video (Fades in on load, covering the stars) */}
        <video 
            ref={videoRef}
            src="/background.mp4"
            className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
            autoPlay 
            loop 
            muted 
            playsInline
            webkit-playsinline="true"
            onCanPlay={() => setVideoLoaded(true)}
            onLoadedData={() => setVideoLoaded(true)}
            onError={(e) => {
                const err = e.currentTarget.error;
                console.warn("Video failed to load, falling back to stars.", err ? `Code: ${err.code}, Message: ${err.message}` : "Unknown error");
                setVideoLoaded(false);
            }}
        />
        
        {/* Overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/20 z-0" />
      </div>

      {/* Main Content Area - z-10 ensures it sits above background */}
      <main className="relative z-10 w-full h-full flex flex-col justify-between">
        
        {/* Title */}
        <div className="absolute top-6 left-6 z-30 animate-pulse">
            <h1 className="text-white/90 text-xl md:text-2xl font-bold tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-['Ma_Shan_Zheng']">
                随心所欲，畅所欲言！
            </h1>
        </div>

        {/* Danmu Layer */}
        <DanmuLayer 
            items={activeItems} 
            onAnimationEnd={handleAnimationEnd} 
        />

        {/* Input Control */}
        <InputBar onSend={handleUserSend} />
      </main>
    </div>
  );
};

export default App;
