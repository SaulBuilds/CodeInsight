import { useEffect, useRef, useState } from 'react';

export default function WaveEffect() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Create wave elements on component mount
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const waveCount = 5; // Number of wave elements to create
    const waves: HTMLDivElement[] = [];
    
    // Create fixed number of wave elements
    for (let i = 0; i < waveCount; i++) {
      const wave = document.createElement('div');
      wave.className = 'wave';
      
      // Distribute waves across the screen initially
      const xPos = Math.random() * window.innerWidth;
      const yPos = Math.random() * window.innerHeight;
      
      wave.style.left = `${xPos}px`;
      wave.style.top = `${yPos}px`;
      wave.style.opacity = '0';
      wave.style.transform = 'translate(-50%, -50%) scale(0.5)';
      wave.style.transition = 'transform 1s ease-out, opacity 1s ease-out, left 1.5s ease-out, top 1.5s ease-out';
      
      container.appendChild(wave);
      waves.push(wave);
    }
    
    // Move waves based on mouse position
    const animateWaves = () => {
      const { x, y } = mousePosition;
      
      waves.forEach((wave, index) => {
        // Get normalized mouse position (0 to 1)
        const normX = x / window.innerWidth;
        const normY = y / window.innerHeight;
        
        // Calculate position with offset based on index 
        // Each wave moves differently from center
        const offsetX = (normX - 0.5) * 600 * ((index % 3) * 0.4 + 0.8);
        const offsetY = (normY - 0.5) * 600 * ((index % 2) * 0.5 + 0.7);
        
        // Center position plus offset
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        // Apply new position with delay based on index
        setTimeout(() => {
          wave.style.opacity = '0.15';
          wave.style.left = `${centerX + offsetX}px`;
          wave.style.top = `${centerY + offsetY}px`;
          wave.style.transform = 'translate(-50%, -50%) scale(1)';
        }, index * 100);
      });
    };
    
    // Handle mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    // Start initial animation
    setTimeout(animateWaves, 200);
    
    // Listen for mouse movement
    window.addEventListener('mousemove', handleMouseMove);
    
    // Setup interval for occasional wave animation
    const waveInterval = setInterval(() => {
      // Randomly pulse a wave
      const randomWave = waves[Math.floor(Math.random() * waves.length)];
      randomWave.style.transform = 'translate(-50%, -50%) scale(1.2)';
      setTimeout(() => {
        randomWave.style.transform = 'translate(-50%, -50%) scale(1)';
      }, 1000);
    }, 3000);
    
    // Cleanup
    return () => {
      clearInterval(waveInterval);
      window.removeEventListener('mousemove', handleMouseMove);
      waves.forEach(wave => wave.remove());
    };
  }, []);
  
  // Animate waves when mouse position changes
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const waves = container.querySelectorAll('.wave');
    
    if (waves.length === 0) return;
    
    // Get normalized mouse position (0 to 1)
    const normX = mousePosition.x / window.innerWidth;
    const normY = mousePosition.y / window.innerHeight;
    
    waves.forEach((wave, index) => {
      const htmlWave = wave as HTMLElement;
      
      // Calculate position with offset based on index
      const offsetX = (normX - 0.5) * 600 * ((index % 3) * 0.4 + 0.8);
      const offsetY = (normY - 0.5) * 600 * ((index % 2) * 0.5 + 0.7);
      
      // Center position plus offset
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      htmlWave.style.left = `${centerX + offsetX}px`;
      htmlWave.style.top = `${centerY + offsetY}px`;
    });
  }, [mousePosition]);
  
  return <div ref={containerRef} className="wave-container" />;
}