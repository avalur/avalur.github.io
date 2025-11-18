/* Reveal.js Pointer Circle Plugin
 * Keeps the native pointer and draws a 16px yellow filled circle centered on it.
 * Usage:
 *   <link rel="stylesheet" href="plugin/pointer-circle/pointer-circle.css">
 *   <script src="plugin/pointer-circle/pointer-circle.js"></script>
 *   Reveal.initialize({ plugins: [ RevealPointerCircle ] });
 */
(function(){
  const ID = 'pointer-circle';

  function init(deck){
    // Create the circle element
    const circle = document.createElement('div');
    circle.className = 'reveal-pointer-circle';
    document.body.appendChild(circle);

    let x = 0, y = 0;
    let raf = null;
    let dirty = false;

    // Drawing state
    let drawing = false;
    let strokeCanvas = null;
    let ctx = null;
    let dpr = Math.max(1, window.devicePixelRatio || 1);
    let startX = 0, startY = 0;
    let moved = false;

    function onMove(e){
      x = e.clientX;
      y = e.clientY;
      dirty = true;
      if(!raf){
        raf = requestAnimationFrame(update);
      }

      // If currently drawing, extend the stroke
      if (drawing && ctx) {
        const px = x * dpr, py = y * dpr;
        // Mark as moved if the pointer traveled a couple of physical pixels
        if (!moved) {
          const dx = px - startX * dpr;
          const dy = py - startY * dpr;
          moved = (dx*dx + dy*dy) > (2 * dpr) * (2 * dpr);
        }
        ctx.lineTo(px, py);
        ctx.stroke();
      }
    }

    function onLeave(){
      circle.style.display = 'none';
      // End any active stroke when cursor leaves window
      endStroke();
    }

    function onEnter(){
      circle.style.display = '';
    }

    function onDown(e){
      if (e.button !== 0) return; // only left button
      beginStroke(e.clientX, e.clientY);
    }

    function onUp(){
      endStroke();
    }

    function update(){
      if(dirty){
        circle.style.left = x + 'px';
        circle.style.top = y + 'px';
        dirty = false;
      }
      raf = null;
    }

    function sizeCanvasToViewport(canvas){
      const w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      const h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      // CSS sizes are set via class (100vw/100vh)
    }

    function beginStroke(sx, sy){
      if (drawing) endStroke();
      drawing = true;
      moved = false;
      startX = sx; startY = sy;

      strokeCanvas = document.createElement('canvas');
      strokeCanvas.className = 'reveal-pointer-stroke';
      sizeCanvasToViewport(strokeCanvas);
      document.body.appendChild(strokeCanvas);

      ctx = strokeCanvas.getContext('2d');
      // High-DPI scaling handled via width/height above; no ctx.scale needed if using dpr for coords
      ctx.strokeStyle = '#ffd400';
      ctx.lineWidth = 4 * dpr; // nice visible line
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(startX * dpr, startY * dpr);
    }

    function endStroke(){
      if (!drawing) return;
      drawing = false;

      if (strokeCanvas){
        // If there was no movement, render a visible point at the click location
        if (!moved && ctx) {
          const r = 6 * dpr; // radius of the point
          ctx.beginPath();
          ctx.arc(startX * dpr, startY * dpr, r, 0, Math.PI * 2);
          ctx.fillStyle = '#ffd400';
          ctx.fill();
        }
        // Keep the stroke fully visible for 1s, THEN fade it out
        const toRemove = strokeCanvas;
        
        // Start fade-out after 1 second
        setTimeout(() => {
          toRemove.classList.add('fade-out');
          
          const cleanup = () => {
            try { document.body.removeChild(toRemove); } catch(_) {}
          };
          toRemove.addEventListener('transitionend', cleanup, { once: true });
          // Fallback in case transitionend doesn't fire
          setTimeout(cleanup, 2500);
        }, 1000);
      }

      strokeCanvas = null;
      ctx = null;
      moved = false;
    }

    function onResize(){
      if (!strokeCanvas) return;
      // If resizing mid-stroke, we end the current stroke to avoid distortion
      endStroke();
    }

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseleave', onLeave, { passive: true });
    window.addEventListener('mouseenter', onEnter, { passive: true });
    window.addEventListener('mousedown', onDown, { passive: true });
    window.addEventListener('mouseup', onUp, { passive: true });
    window.addEventListener('blur', onUp, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    // Clean up when the deck is destroyed
    deck.on('destroy', () => {
      window.removeEventListener('mousemove', onMove, { passive: true });
      window.removeEventListener('mouseleave', onLeave, { passive: true });
      window.removeEventListener('mouseenter', onEnter, { passive: true });
      window.removeEventListener('mousedown', onDown, { passive: true });
      window.removeEventListener('mouseup', onUp, { passive: true });
      window.removeEventListener('blur', onUp, { passive: true });
      window.removeEventListener('resize', onResize, { passive: true });
      try { document.body.removeChild(circle); } catch(_) {}
      // remove any leftover strokes
      document.querySelectorAll('.reveal-pointer-stroke').forEach(el => {
        try { document.body.removeChild(el); } catch(_){}
      });
    });
  }

  const plugin = { id: ID, init };

  // UMD-ish export
  if (typeof window !== 'undefined') window.RevealPointerCircle = plugin;
  if (typeof module === 'object' && module.exports) module.exports = plugin;
})();
