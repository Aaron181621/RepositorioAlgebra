function initGeometria(){
const $=id=>document.getElementById(id), canvasIzquierdo=$('canvas-original'), canvasDerecho=$('canvas-transformed');
let historial=[], modo='punto', inicioSegmento=null, zoom=1, serial=0, editIndex=-1; const undo=[],redo=[];
const dark=()=>document.documentElement.dataset.theme==='dark';
// Cada modificación guarda una copia de las coordenadas originales.
function commit(){undo.push(structuredClone(historial));redo.length=0;}
function cancelar(){editIndex=-1;$('coord-submit').textContent='Agregar';$('cancel-edit').hidden=true;}
function coord(p){return `(${fmt(p.x)}, ${fmt(p.y)})`;}
function renderTable(){const body=$('elements');body.replaceChildren();historial.forEach((e,i)=>{const tr=document.createElement('tr');const pts=e.tipo==='punto'?[e.punto]:[e.inicio,e.fin];const props=e.tipo==='segmento'?propiedadesSegmento(e.inicio,e.fin):null;[e.label,pts.map(coord).join(' → '),pts.map(p=>coord(escalarPunto(p,zoom))).join(' → '),props?`d=${fmt(props.distancia)}; m=${props.pendiente===null?'indefinida':fmt(props.pendiente)}; M=${coord(props.medio)}`:'—'].forEach(t=>{const td=document.createElement('td');td.textContent=t;tr.append(td);});const td=document.createElement('td');for(const [name,fn] of [['Editar',()=>{cambiarModo(e.tipo);editIndex=i; $('coord-x').value=pts[0].x;$('coord-y').value=pts[0].y;if(pts[1]){$('coord-x2').value=pts[1].x;$('coord-y2').value=pts[1].y;}$('coord-submit').textContent='Guardar cambios';$('cancel-edit').hidden=false;$('coord-x').focus();}],['Eliminar',()=>{commit();historial.splice(i,1);cancelar();dibujarAmbosPlanos();}]]){const b=document.createElement('button');b.className='button secondary';b.textContent=name;b.setAttribute('aria-label',name+' '+e.label);b.onclick=fn;td.append(b);}tr.append(td);body.append(tr);});$('btn-redo').disabled=!redo.length;$('btn-undo').disabled=!undo.length&&!inicioSegmento;}
    // --- Parte I: visualizador geométrico 2D. ---
    // En Canvas (0,0) está arriba a la izquierda. En coordenadas cartesianas,
    // (0,0) debe verse abajo a la izquierda: por ello invertimos la coordenada Y.
    function zonaPlano(w, h) {
      const lado = Math.max(1, Math.min(w - 65, h - 63));
      const izquierda = (w-lado)/2, derecha = izquierda+lado, arriba = 24, abajo = arriba+lado;
      return { izquierda, derecha, arriba, abajo, ancho: derecha - izquierda, alto: abajo - arriba, max: MAX_COORD };
    }
    function aPixel(punto, zona) {
      return {
        x: zona.izquierda + (punto.x / zona.max) * zona.ancho,
        y: zona.abajo - (punto.y / zona.max) * zona.alto
      };
    }
    function aCoordenada(px, py, zona) {
      if (px < zona.izquierda || px > zona.derecha || py < zona.arriba || py > zona.abajo) return null;
      return {
        x: Number((((px - zona.izquierda) / zona.ancho) * MAX_COORD).toFixed(4)),
        y: Number((((zona.abajo - py) / zona.alto) * MAX_COORD).toFixed(4))
      };
    }
    function prepararCanvas(canvas) {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return null;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, r.width, r.height);
      return { ctx, zona: zonaPlano(r.width, r.height), w: r.width, h: r.height };
    }
    function dibujarCuadricula(ctx, z, w, h) {
      ctx.fillStyle = dark() ? '#152238' : '#ffffff'; ctx.fillRect(0, 0, w, h);
      for (let unidad = 0; unidad <= z.max; unidad += z.max > 10 ? 5 : 1) {
        const x = aPixel({ x: unidad, y: 0 }, z).x;
        const y = aPixel({ x: 0, y: unidad }, z).y;
        ctx.beginPath(); ctx.lineWidth = 1; ctx.strokeStyle = dark() ? '#293951' : '#e7edf5';
        ctx.moveTo(x, z.arriba); ctx.lineTo(x, z.abajo);
        ctx.moveTo(z.izquierda, y); ctx.lineTo(z.derecha, y); ctx.stroke();
        if (unidad % 2 === 0) {
          ctx.font = '11px system-ui, sans-serif'; ctx.fillStyle = dark() ? '#b5c4da' : '#73879a';
          ctx.textAlign = 'center'; ctx.fillText(String(unidad), x, z.abajo + 17);
          if (unidad > 0) { ctx.textAlign = 'right'; ctx.fillText(String(unidad), z.izquierda - 9, y + 4); }
        }
      }
      ctx.beginPath(); ctx.strokeStyle = '#68829a'; ctx.lineWidth = 2;
      ctx.moveTo(z.izquierda, z.arriba); ctx.lineTo(z.izquierda, z.abajo); ctx.lineTo(z.derecha, z.abajo); ctx.stroke();
      ctx.font = 'bold 12px system-ui, sans-serif'; ctx.fillStyle = '#526f8e';
      ctx.fillText('y', z.izquierda - 7, z.arriba - 8);
      ctx.fillText('x', z.derecha + 9, z.abajo + 5);
    }
    function dibujarPunto(ctx, pixel, color, radio = 5, relleno = true) {
      ctx.beginPath(); ctx.arc(pixel.x, pixel.y, radio, 0, 2 * Math.PI);
      ctx.fillStyle = relleno ? color : 'white'; ctx.strokeStyle = color; ctx.lineWidth = 2.5;
      ctx.fill(); ctx.stroke();
    }
    function dibujarPlano(canvas, factorEscala, esIzquierdo) {
      const preparado = prepararCanvas(canvas);
      if (!preparado) return;
      const { ctx, zona, w, h } = preparado;
      if (!esIzquierdo && $('fit-plane').checked) zona.max = Math.max(10, Math.ceil(MAX_COORD * factorEscala / 5) * 5);
      dibujarCuadricula(ctx, zona, w, h);
      // Recorte explícito de la visualización: solo se representa el primer cuadrante.
      ctx.save(); ctx.beginPath(); ctx.rect(zona.izquierda, zona.arriba, zona.ancho, zona.alto); ctx.clip();
      for (const elemento of historial) {
        if (elemento.tipo === 'punto') {
          const q = aPixel(escalarPunto(elemento.punto, factorEscala), zona); dibujarPunto(ctx, q, '#2869d5'); etiqueta(ctx,q,elemento.label);
        } else {
          const a = aPixel(escalarPunto(elemento.inicio, factorEscala), zona);
          const b = aPixel(escalarPunto(elemento.fin, factorEscala), zona);
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = '#da8441'; ctx.lineWidth = 3.2; ctx.lineCap = 'round'; ctx.stroke();
          dibujarPunto(ctx, a, '#da8441', 4); dibujarPunto(ctx, b, '#da8441', 4); etiqueta(ctx,a,elemento.label+'₁'); etiqueta(ctx,b,elemento.label+'₂');
        }
      }
      if (inicioSegmento) {
        dibujarPunto(ctx, aPixel(escalarPunto(inicioSegmento, factorEscala), zona), '#da8441', 6, false);
      }
      ctx.restore();
    }
    function etiqueta(ctx,p,t){ctx.font="bold 12px system-ui";ctx.fillStyle=dark()?"#e5eaff":"#18243a";ctx.textAlign="left";ctx.fillText(t,p.x+7,p.y-7);}
    function dibujarAmbosPlanos() {
      dibujarPlano(canvasIzquierdo, 1, true);
      dibujarPlano(canvasDerecho, zoom, false);
      const puntos = historial.filter(x => x.tipo === 'punto').length;
      const segmentos = historial.filter(x => x.tipo === 'segmento').length;
      $('stat-count').textContent = historial.length; $('stat-scale').textContent = zoom+'×'; $('scale-matrix').textContent = `S = [ ${zoom}  0 ; 0  ${zoom} ]`; renderTable();
      $('draw-counter').textContent = `${puntos} punto${puntos === 1 ? '' : 's'} · ${segmentos} segmento${segmentos === 1 ? '' : 's'}`;
    }
    function mensajeDibujo(texto) { $('draw-status').textContent = texto; }
    function cambiarModo(nuevo) {
      modo = nuevo; editIndex = -1; $('cancel-edit').hidden=true; $('coord-submit').textContent='Agregar'; document.querySelectorAll('.endpoint').forEach(e=>e.hidden=nuevo!=='segmento'); ['coord-x2','coord-y2'].forEach(id=>$(id).required=nuevo==='segmento');
      inicioSegmento = null;
      for (const [id, m] of [['mode-point','punto'],['mode-segment','segmento']]) {
        $(id).classList.toggle('active', m === modo);
        $(id).setAttribute('aria-pressed', String(m === modo));
      }
      mensajeDibujo(modo === 'punto' ? 'Modo punto: cada clic añade un punto.' : 'Modo segmento: primer clic = inicio; segundo clic = final.');
      dibujarAmbosPlanos();
    }
    $('mode-point').addEventListener('click', () => cambiarModo('punto'));
    $('mode-segment').addEventListener('click', () => cambiarModo('segmento'));
    canvasIzquierdo.addEventListener('pointerdown', e => {
      const rect = canvasIzquierdo.getBoundingClientRect();
      const p = aCoordenada(e.clientX - rect.left, e.clientY - rect.top, zonaPlano(rect.width, rect.height));
      if (!p) { mensajeDibujo('Haz clic dentro de la cuadrícula (de 0 a 10 en ambos ejes).'); return; }
      cancelar();
      if (modo === 'punto') {
        commit(); historial.push({ tipo: 'punto', punto: p, label: 'P'+(++serial) });
        mensajeDibujo(`Punto registrado en (${fmt(p.x)}, ${fmt(p.y)}).`);
      } else if (!inicioSegmento) {
        inicioSegmento = p;
        mensajeDibujo(`Inicio (${fmt(p.x)}, ${fmt(p.y)}) guardado. Haz el segundo clic para cerrar el segmento.`);
      } else {
        commit(); historial.push({ tipo: 'segmento', inicio: inicioSegmento, fin: p, label: 'S'+(++serial) });
        inicioSegmento = null;
        mensajeDibujo(`Segmento registrado. Puedes seguir añadiendo elementos.`);
      }
      dibujarAmbosPlanos();
    });
    $('btn-undo').addEventListener('click', () => {
      if (inicioSegmento) { inicioSegmento = null; mensajeDibujo('Se canceló el inicio de segmento pendiente.'); }
      else if (undo.length) { redo.push(structuredClone(historial)); historial = undo.pop(); cancelar(); mensajeDibujo('Acción deshecha.'); }
      else mensajeDibujo('No hay elementos para deshacer.');
      dibujarAmbosPlanos();
    });
    $('btn-clear').addEventListener('click', () => {
      commit(); historial.length = 0; inicioSegmento = null; cancelar();
      mensajeDibujo('Se limpió el plano. Puedes comenzar un nuevo dibujo.');
      dibujarAmbosPlanos();
    });
    function actualizarZoom() {
      zoom = Number($('zoom-slider').value);
      $('zoom-value').textContent = `${Math.round(zoom * 100)} %`;
      $('transform-formula').textContent = `(x′, y′) = (${zoom.toFixed(1)}x, ${zoom.toFixed(1)}y)`;
      dibujarAmbosPlanos();
    }
    $('zoom-slider').addEventListener('input', actualizarZoom);
    $('reset-zoom').addEventListener('click', () => { $('zoom-slider').value = '1'; actualizarZoom(); });
    new ResizeObserver(dibujarAmbosPlanos).observe(canvasIzquierdo);
    new ResizeObserver(dibujarAmbosPlanos).observe(canvasDerecho);


$('btn-redo').onclick=()=>{if(redo.length){undo.push(structuredClone(historial));historial=redo.pop();inicioSegmento=null;cancelar();dibujarAmbosPlanos();}};
$('cancel-edit').onclick=cancelar;$('fit-plane').onchange=dibujarAmbosPlanos;
$('coord-form').onsubmit=e=>{e.preventDefault();const read=(x,y)=>{const a=$(x).value,b=$(y).value;return a.trim()&&b.trim()&&[a,b].every(v=>Number.isFinite(Number(v))&&Number(v)>=0&&Number(v)<=10)?{x:Number(a),y:Number(b)}:null;};const a=read('coord-x','coord-y'),b=modo==='segmento'?read('coord-x2','coord-y2'):null;if(!a||(modo==='segmento'&&!b)){$('coord-error').textContent='Introduce coordenadas válidas entre 0 y 10.';return;}$('coord-error').textContent='';commit();const label=editIndex>=0?historial[editIndex].label:(modo==='punto'?'P':'S')+(++serial);const obj=modo==='punto'?{tipo:modo,punto:a,label}:{tipo:modo,inicio:a,fin:b,label};if(editIndex>=0)historial[editIndex]=obj;else historial.push(obj);inicioSegmento=null;cancelar();dibujarAmbosPlanos();mensajeDibujo('Elemento guardado: '+label);};
for(const [id,c] of [['export-original',canvasIzquierdo],['export-transformed',canvasDerecho]]) $(id).onclick=()=>{const a=document.createElement('a');a.href=c.toDataURL('image/png');a.download=id+'.png';a.click();};
actualizarZoom();return dibujarAmbosPlanos;
}
