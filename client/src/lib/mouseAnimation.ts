/**
 * Mouse animation utility for vector background effects
 * Handles parallax effects and animated blob movements
 */

// Track mouse movement across the page
export const initMouseTracking = () => {
  // Only run in browser environment
  if (typeof window === 'undefined') return;

  // Store initial mouse position
  let mouseX = 0;
  let mouseY = 0;
  
  // Store target mouse position for smooth animation
  let targetX = 0;
  let targetY = 0;
  
  // Smoothing factor (lower = smoother)
  const smoothing = 0.1;
  
  // Track window size
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  
  // Handle mouse movement
  const handleMouseMove = (e: MouseEvent) => {
    // Calculate normalized position (0 to 1)
    mouseX = e.clientX / windowWidth;
    mouseY = e.clientY / windowHeight;
  };
  
  // Apply parallax effect to blobs
  const animateBlobs = () => {
    // Smooth movement
    targetX += (mouseX - targetX) * smoothing;
    targetY += (mouseY - targetY) * smoothing;
    
    // Apply transformations to blobs with different intensities
    const blobs = document.querySelectorAll('.animated-blob') as NodeListOf<HTMLElement>;
    
    blobs.forEach((blob, index) => {
      const intensity = (index + 1) * 40;
      const moveX = (targetX - 0.5) * intensity;
      const moveY = (targetY - 0.5) * intensity;
      
      blob.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    });
    
    // Apply parallax to mouse-tracking elements
    const trackingElements = document.querySelectorAll('.mouse-tracking-content') as NodeListOf<HTMLElement>;
    
    trackingElements.forEach((el) => {
      const intensity = 30;
      const moveX = (targetX - 0.5) * intensity;
      const moveY = (targetY - 0.5) * intensity;
      
      el.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    });
    
    // Continue animation loop
    requestAnimationFrame(animateBlobs);
  };
  
  // Add event listener and start animation
  window.addEventListener('mousemove', handleMouseMove);
  animateBlobs();
  
  // Cleanup function
  return () => {
    window.removeEventListener('mousemove', handleMouseMove);
  };
};

// Handle scroll-based effects
export const initScrollEffects = () => {
  if (typeof window === 'undefined') return;
  
  const handleScroll = () => {
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    
    // Parallax for background sections
    const sections = document.querySelectorAll('.animated-background') as NodeListOf<HTMLElement>;
    
    sections.forEach((section) => {
      const sectionTop = section.getBoundingClientRect().top;
      const sectionHeight = section.offsetHeight;
      
      // Calculate how far the section is through the viewport
      const progress = (viewportHeight - sectionTop) / (viewportHeight + sectionHeight);
      
      if (progress > 0 && progress < 1) {
        // Apply subtle parallax to vector grid
        const grid = section.querySelector('.vector-grid') as HTMLElement;
        if (grid) {
          grid.style.transform = `translateY(${progress * 10}px)`;
        }
        
        // Fade in elements as they scroll into view
        const content = section.querySelector('.z-10') as HTMLElement;
        if (content) {
          content.style.opacity = Math.min(1, progress * 1.5).toString();
        }
      }
    });
  };
  
  window.addEventListener('scroll', handleScroll);
  
  // Cleanup function
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
};