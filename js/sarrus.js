function initSarrus(){
const $=id=>document.getElementById(id);let ultimaMatriz=null,direccion='positiva',ultimoResultado=null,paso=-1,timer=null;
function detener(){clearInterval(timer);timer=null;$('step-play').textContent='Animar';}
function actualizarPaso(){if(!ultimaMatriz)return;$('step-label').textContent=paso<0?'Vista de tres diagonales':paso===6?'Paso 7: resta final':`Paso ${paso+1}/7: ${paso<3?'principal':'secundaria'} ${paso%3+1}`;if(paso>=0&&paso<6){direccion=paso<3?'positiva':'negativa';}for(const [id,d] of [['show-positive','positiva'],['show-negative','negativa']]){$(id).classList.toggle('selected',direccion===d);$(id).setAttribute('aria-pressed',String(direccion===d));}document.querySelectorAll('#positive-steps li,#negative-steps li').forEach((li,i)=>li.classList.toggle('current-step',i===paso));dibujarSarrus(ultimaMatriz);$('step-prev').disabled=paso<=0;$('step-next').disabled=paso===6;}
function guardarHistorial(r){let h=readStore('linear-history',[]);h.unshift({m:r.matriz,det:r.determinante,fecha:new Date().toLocaleString('es-CR')});writeStore('linear-history',h.slice(0,50));renderHistory();}
function renderHistory(){const el=$('history-list');el.replaceChildren();const h=readStore('linear-history',[]);if(!h.length)el.textContent='Todavía no hay cálculos guardados.';h.forEach(item=>{const row=document.createElement('div');row.className='history-row';const t=document.createElement('span');t.textContent=`${item.fecha} · ${item.m.map(r=>r.join(', ')).join(' / ')} · det = ${item.det}`;const b=document.createElement('button');b.className='button secondary';b.textContent='Abrir';b.onclick=()=>{load(item.m,false);navigate('sarrus');};row.append(t,b);el.append(row);});}
function random(){return Array.from({length:3},()=>Array.from({length:3},()=>String(Math.floor(Math.random()*19)-9)));}
function load(m,record=true){campos.forEach((r,i)=>r.forEach((input,j)=>input.value=m[i][j]));calcularYMostrar(record);}
    // --- Parte II: validación y regla de Sarrus. ---
    const campos = Array.from({ length: 3 }, (_, fila) => Array.from({ length: 3 }, (_, col) => $(`m${fila}${col}`)));
    function mostrarError(texto) {
      $('form-error').hidden = !texto;
      $('form-error').textContent = texto || '';
    }
    function obtenerMatriz() {
      let primerInvalido = null, error = '';
      const matriz = campos.map((fila, r) => fila.map((input, c) => {
        const vacio = !input.value.trim();
        let numero=null; try { decimalExacto(input.value); numero=input.value.trim(); } catch {}
        const invalido = vacio || numero === null;
        input.classList.toggle('invalid', invalido);
        input.setAttribute('aria-invalid', String(invalido));
        if (invalido && !primerInvalido) {
          primerInvalido = input;
          error = `Revisa la fila ${r + 1}, columna ${c + 1}: ${vacio ? 'el campo está vacío' : 'el valor no es numérico válido'}.`;
        }
        return numero;
      }));
      if (primerInvalido) {
        detener(); ultimaMatriz = null;
        $('result-content').hidden = true;
        $('result-placeholder').hidden = false;
        $('result-placeholder').textContent = 'Corrige los campos señalados para poder calcular el determinante.';
        mostrarError(error);
        primerInvalido.focus();
        return null;
      }
      mostrarError(''); return matriz;
    }
    function llenarEjemplo() {
      const ejemplo = [[1,2,3],[0,4,5],[1,0,6]];
      campos.forEach((fila, r) => fila.forEach((input, c) => { input.value = String(ejemplo[r][c]); input.classList.remove('invalid'); input.setAttribute('aria-invalid', 'false'); }));
      mostrarError(''); calcularYMostrar();
    }
    function pasosEnLista(id, diagonales, productos) {
      const ol = $(id); ol.replaceChildren();
      diagonales.forEach((valores, index) => {
        const li = document.createElement('li');
        li.textContent = `(${valores.map(String).join(') × (')}) = ${String(productos[index])}`;
        ol.appendChild(li);
      });
    }
    function mostrarMatriz(m) {
      const zona = $('matrix-view'); zona.replaceChildren();
      m.flat().forEach(v => {
        const celda = document.createElement('span'); celda.textContent = String(v); zona.appendChild(celda);
      });
    }
    const NS = 'http://www.w3.org/2000/svg';
    function svgNodo(etiqueta, atributos = {}, texto = null) {
      const nodo = document.createElementNS(NS, etiqueta);
      Object.entries(atributos).forEach(([k,v]) => nodo.setAttribute(k, String(v)));
      if (texto !== null) nodo.textContent = String(texto);
      return nodo;
    }
    function dibujarSarrus(m) {
      const svg = $('sarrus-svg'); svg.replaceChildren();
      const xs = [55,157,259,361,463], ys = [42,112,182];
      svg.appendChild(svgNodo('rect', { x: 310, y: 20, width: 197, height: 186, rx: 10, fill: '#e0e7ff' }));
      svg.appendChild(svgNodo('text', { x: 155, y: 15, 'text-anchor': 'middle', fill: '#718197', 'font-size': 12, 'font-weight': 700 }, 'Matriz original'));
      svg.appendChild(svgNodo('text', { x: 408, y: 15, 'text-anchor': 'middle', fill: '#718197', 'font-size': 12, 'font-weight': 700 }, 'Columnas repetidas'));
      const esPositiva = direccion === 'positiva';
      const color = esPositiva ? '#147d92' : '#b25b2f';
      // Tres líneas geométricas reales sobre los valores repetidos de la matriz.
      for (let j = 0; j < 3; j++) {
        if(paso===6 || (paso>=0 && paso<6 && j!==paso%3)) continue;
        svg.appendChild(svgNodo('line', {
          x1: esPositiva ? xs[j] : xs[j + 2], y1: ys[0],
          x2: esPositiva ? xs[j + 2] : xs[j], y2: ys[2],
          stroke: color, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: .72
        }));
      }
      for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
        const numero = m[r][c % 3];
        svg.appendChild(svgNodo('circle', { cx: xs[c], cy: ys[r], r: 22, fill: 'white', stroke: c >= 3 ? '#bcd1e7' : '#d4e1ee', 'stroke-width': 1.4 }));
        svg.appendChild(svgNodo('text', { x: xs[c], y: ys[r] + 5, 'text-anchor': 'middle', 'font-size': Math.min(16, 72 / Math.max(1,String(numero).length)), 'font-weight': 700, fill: '#20374f' }, String(numero)));
      }
      svg.setAttribute('aria-label', esPositiva ? 'Tres diagonales positivas descendentes sobre la matriz 3 por 3 con sus dos columnas repetidas' : 'Tres diagonales negativas ascendentes sobre la matriz 3 por 3 con sus dos columnas repetidas');
    }
    function cambiarDireccion(positiva) {
      paso=-1; detener(); actualizarPaso(); direccion = positiva ? 'positiva' : 'negativa';
      $('show-positive').classList.toggle('selected', positiva);
      $('show-negative').classList.toggle('selected', !positiva);
      $('show-positive').setAttribute('aria-pressed', String(positiva));
      $('show-negative').setAttribute('aria-pressed', String(!positiva));
      if (ultimaMatriz) dibujarSarrus(ultimaMatriz);
    }
    $('show-positive').addEventListener('click', () => cambiarDireccion(true));
    $('show-negative').addEventListener('click', () => cambiarDireccion(false));

    function calcularYMostrar(registrar=true) {
      const m = obtenerMatriz();
      if (!m) return;
      let r;
      try {
        r = sarrusExacto(m);
      } catch (error) {
        detener(); ultimaMatriz = null;
        $('result-content').hidden = true;
        $('result-placeholder').hidden = false;
        $('result-placeholder').textContent = 'No se pudo completar el cálculo con esos valores.';
        mostrarError(error.message);
        return;
      }
      ultimaMatriz = r.matriz; ultimoResultado=r; paso=-1; detener();
      $('result-placeholder').hidden = true;
      $('result-content').hidden = false;
      mostrarMatriz(r.matriz);
      $('det-result').textContent = String(r.determinante);
      pasosEnLista('positive-steps', r.positivas, r.productosPositivos);
      pasosEnLista('negative-steps', r.negativas, r.productosNegativos);
      $('positive-sum').textContent = `${r.productosPositivos.map(v => `(${String(v)})`).join(' + ')} = ${String(r.sumaPositiva)}`;
      $('negative-sum').textContent = `${r.productosNegativos.map(v => `(${String(v)})`).join(' + ')} = ${String(r.sumaNegativa)}`;
      $('final-exp').textContent = `det(A) = (${String(r.sumaPositiva)}) − (${String(r.sumaNegativa)}) = ${String(r.determinante)}`;
      dibujarSarrus(r.matriz); actualizarPaso(); $('classification').textContent=r.determinante==='0'?'Matriz singular: no tiene inversa.':'Matriz no singular: tiene inversa.'; if(registrar) guardarHistorial(r);
    }
    $('matrix-form').addEventListener('submit', e => { e.preventDefault(); calcularYMostrar(); });
    $('btn-example').addEventListener('click', llenarEjemplo);
    $('btn-clear-matrix').addEventListener('click', () => {
      campos.flat().forEach(input => { input.value = ''; input.classList.remove('invalid'); input.setAttribute('aria-invalid', 'false'); });
      detener(); ultimaMatriz = null; $('result-content').hidden = true; $('result-placeholder').hidden = false;
      $('result-placeholder').textContent = 'Completa la matriz y presiona «Calcular determinante».';
      mostrarError(''); campos[0][0].focus();
    });
    campos.flat().forEach(input => input.addEventListener('input', () => {
      input.classList.remove('invalid');
      input.setAttribute('aria-invalid', 'false');
      mostrarError('');
      detener(); ultimaMatriz = null;
      $('result-content').hidden = true;
      $('result-placeholder').hidden = false;
      $('result-placeholder').textContent = 'La matriz cambió. Presiona «Calcular determinante» para actualizar los resultados.';
    }));


$('step-prev').onclick=()=>{detener();paso=Math.max(0,paso-1);actualizarPaso();};$('step-next').onclick=()=>{detener();paso=Math.min(6,paso+1);actualizarPaso();};$('step-play').onclick=()=>{if(timer){detener();return;}paso=0;actualizarPaso();$('step-play').textContent='Pausar';timer=setInterval(()=>{paso++;actualizarPaso();if(paso===6)detener();},1000);};
$('random-matrix').onclick=()=>load(random());$('history-clear').onclick=()=>{writeStore('linear-history',[]);renderHistory();};
$('export-result').onclick=()=>{const r=ultimoResultado;if(!r)return;const text=['LinearLab 2.0 — Regla de Sarrus',...r.matriz.map(x=>x.join('  ')),...r.positivas.map((x,i)=>x.join(' × ')+' = '+r.productosPositivos[i]),...r.negativas.map((x,i)=>x.join(' × ')+' = '+r.productosNegativos[i]),'Suma principal: '+r.sumaPositiva,'Suma secundaria: '+r.sumaNegativa,`det(A) = (${r.sumaPositiva}) − (${r.sumaNegativa}) = ${r.determinante}`].join('\n');downloadText(text,'sarrus.txt');};$('print-result').onclick=()=>window.print();
let practice;function newPractice(){practice=random();const el=$('practice-matrix');el.replaceChildren();practice.flat().forEach(n=>{const span=document.createElement('span');span.textContent=n;el.append(span);});$('practice-answer').value='';$('practice-feedback').textContent='';}
$('practice-new').onclick=newPractice;$('practice-form').onsubmit=e=>{e.preventDefault();try{const a=decimalExacto($('practice-answer').value);const correct=sarrusExacto(practice).determinante;$('practice-feedback').textContent=decimalTexto(a.n,a.d)===correct?'Correcto.':'Incorrecto. Revisa las seis diagonales y la resta final.';}catch{$('practice-feedback').textContent='Introduce un número válido.';}};$('practice-solution').onclick=()=>{load(practice);navigate('sarrus');};newPractice();renderHistory();calcularYMostrar(false);
}
