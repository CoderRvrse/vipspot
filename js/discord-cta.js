(() => {
  const root = document.querySelector('.vip-discord');
  const orb  = root?.querySelector('.orb');
  if (!root || !orb) return;
  let raf = null, tx = 0, ty = 0, _x = 0, _y = 0;
  const lerp = (a,b,t)=>a+(b-a)*t;
  function onMove(e){
    const r = root.getBoundingClientRect();
    const nx = (e.clientX - (r.left + r.width/2)) / (r.width/2);
    const ny = (e.clientY - (r.top  + r.height/2)) / (r.height/2);
    tx = nx * 6; ty = ny * 6; if(!raf) loop();
  }
  function loop(){
    raf = requestAnimationFrame(loop);
    _x = lerp(_x, tx, 0.12); _y = lerp(_y, ty, 0.12);
    orb.style.transform = `translate3d(${_x}px, ${_y}px, 0)`;
    if (Math.abs(_x - tx) < .05 && Math.abs(_y - ty) < .05) { cancelAnimationFrame(raf); raf = null; }
  }
  root.addEventListener('pointerenter', onMove);
  root.addEventListener('pointermove',  onMove);
  root.addEventListener('pointerleave', () => { tx = ty = 0; if(!raf) loop(); });
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) {
    root.removeEventListener('pointerenter', onMove);
    root.removeEventListener('pointermove',  onMove);
    root.removeEventListener('pointerleave', onMove);
    orb.style.transform = 'none';
  }
})();