import { useEffect, useRef } from 'react';

export default function WaveEffect() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    
    // Create waves on mouse move
    const handleMouseMove = (e: MouseEvent) => {
      // Create a new wave element
      const wave = document.createElement('div');
      wave.className = 'wave';
      wave.style.left = `${e.clientX}px`;
      wave.style.top = `${e.clientY}px`;
      
      // Add to container
      container.appendChild(wave);
      
      // Remove after animation completes
      setTimeout(() => {
        wave.remove();
      }, 2000); // Match with CSS animation duration
    };
    
    // Add event listener
    window.addEventListener('mousemove', handleMouseMove);
    
    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  return <div ref={containerRef} className="wave-container" />;
}