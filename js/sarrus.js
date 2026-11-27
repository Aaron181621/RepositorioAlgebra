function initSarrus() {
  const $ = id => document.getElementById(id);
  let ultimaMatriz = null;
  let ultimoResultado = null;
  let direccion = 'positiva';
  let paso = -1;
  let timer = null;

  const campos = Array.from({ length: 3 }, (_, fila) =>
    Array.from({ length: 3 }, (_, col) => $(`m${fila}${col}`))
  );

  function detenerAnimacion() {
    clearInterval(timer);
    timer = null;
    $('step-play').textContent = 'Animar';
  }

  function mostrarError(texto) {
    $('form-error').hidden = !texto;
    $('form-error').textContent = texto || '';
  }

  function obtenerMatriz() {
    let primerInvalido = null;
    let mensajeError = '';

    const matriz = campos.map((fila, r) => fila.map((input, c) => {
      const vacio = !input.value.trim();
      const numero = vacio ? null : leerNumero(input.value);
      const invalido = vacio || numero === null;

      input.classList.toggle('invalid', invalido);
      input.setAttribute('aria-invalid', String(invalido));

      if (invalido && !primerInvalido) {
        primerInvalido = input;
        mensajeError = `Revisa la fila ${r + 1}, columna ${c + 1}: ${vacio ? 'el campo está vacío' : 'el valor no es numérico válido'}.`;
      }
      return numero;
    }));

    if (primerInvalido) {
      detenerAnimacion();
      ultimaMatriz = null;
      $('result-content').hidden = true;
      $('result-placeholder').hidden = false;
      $('result-placeholder').textContent = 'Corrige los campos señalados para calcular el determinante.';
      mostrarError(mensajeError);
      primerInvalido.focus();
      return null;
    }

    mostrarError('');
    return matriz;
  }

  function dibujarSarrus(m) {
    const svg = $('sarrus-svg');
    svg.replaceChildren();
    const NS = 'http://www.w3.org/2000/svg';
    const xs = [55, 157, 259, 361, 463];
    const ys = [42, 112, 182];

    const crearSvg = (tag, attrs, texto = null) => {
      const el = document.createElementNS(NS, tag);
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
      if (texto !== null) el.textContent = String(texto);
      return el;
    };

    svg.appendChild(crearSvg('rect', { x: 310, y: 20, width: 197, height: 186, rx: 10, fill: '#e0e7ff' }));
    svg.appendChild(crearSvg('text', { x: 155, y: 15, 'text-anchor': 'middle', fill: '#718197', 'font-size': 12, 'font-weight': 700 }, 'Matriz original'));
    svg.appendChild(crearSvg('text', { x: 408, y: 15, 'text-anchor': 'middle', fill: '#718197', 'font-size': 12, 'font-weight': 700 }, 'Columnas repetidas'));

    const esPositiva = direccion === 'positiva';
    const color = esPositiva ? '#147d92' : '#b25b2f';

    for (let j = 0; j < 3; j++) {
      if (paso === 6 || (paso >= 0 && paso < 6 && j !== paso % 3)) continue;
      svg.appendChild(crearSvg('line', {
        x1: esPositiva ? xs[j] : xs[j + 2],
        y1: ys[0],
        x2: esPositiva ? xs[j + 2] : xs[j],
        y2: ys[2],
        stroke: color,
        'stroke-width': 4,
        'stroke-linecap': 'round',
        opacity: 0.72
      }));
    }

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 5; c++) {
        const valor = m[r][c % 3];
        svg.appendChild(crearSvg('circle', {
          cx: xs[c], cy: ys[r], r: 22, fill: 'white',
          stroke: c >= 3 ? '#bcd1e7' : '#d4e1ee', 'stroke-width': 1.4
        }));
        svg.appendChild(crearSvg('text', {
          x: xs[c], y: ys[r] + 5, 'text-anchor': 'middle',
          'font-size': Math.min(16, 72 / Math.max(1, String(valor).length)),
          'font-weight': 700, fill: '#20374f'
        }, valor));
      }
    }
  }

  function actualizarPaso() {
    if (!ultimaMatriz) return;
    $('step-label').textContent = paso < 0
      ? 'Vista de tres diagonales'
      : paso === 6
        ? 'Paso 7: resta final'
        : `Paso ${paso + 1}/7: ${paso < 3 ? 'principal' : 'secundaria'} ${(paso % 3) + 1}`;

    if (paso >= 0 && paso < 6) {
      direccion = paso < 3 ? 'positiva' : 'negativa';
    }

    [['show-positive', 'positiva'], ['show-negative', 'negativa']].forEach(([id, dir]) => {
      $(id).classList.toggle('selected', direccion === dir);
      $(id).setAttribute('aria-pressed', String(direccion === dir));
    });

    document.querySelectorAll('#positive-steps li, #negative-steps li').forEach((li, i) => {
      li.classList.toggle('current-step', i === paso);
    });

    dibujarSarrus(ultimaMatriz);
    $('step-prev').disabled = paso <= 0;
    $('step-next').disabled = paso === 6;
  }

  function renderHistory() {
    const el = $('history-list');
    el.replaceChildren();
    const historial = readStore('linear-history', []);
    if (!historial.length) {
      el.textContent = 'Todavía no hay cálculos guardados.';
      return;
    }
    historial.forEach(item => {
      const row = document.createElement('div');
      row.className = 'history-row';
      const span = document.createElement('span');
      span.textContent = `${item.fecha} · ${item.m.map(r => r.join(', ')).join(' / ')} · det = ${item.det}`;
      const btn = document.createElement('button');
      btn.className = 'button secondary';
      btn.textContent = 'Abrir';
      btn.onclick = () => { cargarMatriz(item.m, false); navigate('sarrus'); };
      row.append(span, btn);
      el.appendChild(row);
    });
  }

  function calcularYMostrar(registrar = true) {
    const m = obtenerMatriz();
    if (!m) return;

    let res;
    try {
      res = calcularSarrus(m);
    } catch (error) {
      detenerAnimacion();
      ultimaMatriz = null;
      $('result-content').hidden = true;
      $('result-placeholder').hidden = false;
      $('result-placeholder').textContent = 'No se pudo completar el cálculo con esos valores.';
      mostrarError(error.message);
      return;
    }

    ultimaMatriz = res.matriz;
    ultimoResultado = res;
    paso = -1;
    detenerAnimacion();

    $('result-placeholder').hidden = true;
    $('result-content').hidden = false;

    const zonaMatriz = $('matrix-view');
    zonaMatriz.replaceChildren();
    res.matriz.flat().forEach(v => {
      const celda = document.createElement('span');
      celda.textContent = v;
      zonaMatriz.appendChild(celda);
    });

    $('det-result').textContent = res.determinante;

    const llenarPasos = (id, diagonales, productos) => {
      const ol = $(id);
      ol.replaceChildren();
      diagonales.forEach((vals, idx) => {
        const li = document.createElement('li');
        li.textContent = `(${vals.join(') × (')}) = ${productos[idx]}`;
        ol.appendChild(li);
      });
    };

    llenarPasos('positive-steps', res.positivas, res.productosPositivos);
    llenarPasos('negative-steps', res.negativas, res.productosNegativos);

    $('positive-sum').textContent = `${res.productosPositivos.map(v => `(${v})`).join(' + ')} = ${res.sumaPositiva}`;
    $('negative-sum').textContent = `${res.productosNegativos.map(v => `(${v})`).join(' + ')} = ${res.sumaNegativa}`;
    $('final-exp').textContent = `det(A) = (${res.sumaPositiva}) − (${res.sumaNegativa}) = ${res.determinante}`;
    $('classification').textContent = res.determinante === '0'
      ? 'Matriz singular: no tiene inversa.'
      : 'Matriz no singular: tiene inversa.';

    dibujarSarrus(res.matriz);
    actualizarPaso();

    if (registrar) {
      const historial = readStore('linear-history', []);
      historial.unshift({ m: res.matriz, det: res.determinante, fecha: new Date().toLocaleString('es-CR') });
      writeStore('linear-history', historial.slice(0, 50));
      renderHistory();
    }
  }

  function matrizAleatoria() {
    return Array.from({ length: 3 }, () =>
      Array.from({ length: 3 }, () => String(Math.floor(Math.random() * 19) - 9))
    );
  }

  function cargarMatriz(m, registrar = true) {
    campos.forEach((fila, i) => fila.forEach((input, j) => {
      input.value = m[i][j];
      input.classList.remove('invalid');
      input.setAttribute('aria-invalid', 'false');
    }));
    mostrarError('');
    calcularYMostrar(registrar);
  }

  $('matrix-form').addEventListener('submit', e => { e.preventDefault(); calcularYMostrar(); });
  $('btn-example').addEventListener('click', () => cargarMatriz([[1, 2, 3], [0, 4, 5], [1, 0, 6]]));
  $('random-matrix').addEventListener('click', () => cargarMatriz(matrizAleatoria()));

  $('btn-clear-matrix').addEventListener('click', () => {
    campos.flat().forEach(input => {
      input.value = '';
      input.classList.remove('invalid');
      input.setAttribute('aria-invalid', 'false');
    });
    detenerAnimacion();
    ultimaMatriz = null;
    $('result-content').hidden = true;
    $('result-placeholder').hidden = false;
    $('result-placeholder').textContent = 'Completa la matriz y presiona «Calcular determinante».';
    mostrarError('');
    campos[0][0].focus();
  });

  campos.flat().forEach(input => input.addEventListener('input', () => {
    input.classList.remove('invalid');
    input.setAttribute('aria-invalid', 'false');
    mostrarError('');
    detenerAnimacion();
    ultimaMatriz = null;
    $('result-content').hidden = true;
    $('result-placeholder').hidden = false;
    $('result-placeholder').textContent = 'La matriz cambió. Presiona «Calcular determinante» para actualizar.';
  }));

  $('show-positive').addEventListener('click', () => { paso = -1; detenerAnimacion(); direccion = 'positiva'; actualizarPaso(); });
  $('show-negative').addEventListener('click', () => { paso = -1; detenerAnimacion(); direccion = 'negativa'; actualizarPaso(); });
  $('step-prev').onclick = () => { detenerAnimacion(); paso = Math.max(0, paso - 1); actualizarPaso(); };
  $('step-next').onclick = () => { detenerAnimacion(); paso = Math.min(6, paso + 1); actualizarPaso(); };
  $('step-play').onclick = () => {
    if (timer) { detenerAnimacion(); return; }
    paso = 0;
    actualizarPaso();
    $('step-play').textContent = 'Pausar';
    timer = setInterval(() => {
      paso++;
      actualizarPaso();
      if (paso === 6) detenerAnimacion();
    }, 1000);
  };

  $('history-clear').onclick = () => { writeStore('linear-history', []); renderHistory(); };
  $('print-result').onclick = () => window.print();
  $('export-result').onclick = () => {
    const r = ultimoResultado;
    if (!r) return;
    const texto = [
      'LinearLab 2.0 — Regla de Sarrus',
      ...r.matriz.map(x => x.join('  ')),
      ...r.positivas.map((x, i) => x.join(' × ') + ' = ' + r.productosPositivos[i]),
      ...r.negativas.map((x, i) => x.join(' × ') + ' = ' + r.productosNegativos[i]),
      'Suma principal: ' + r.sumaPositiva,
      'Suma secundaria: ' + r.sumaNegativa,
      `det(A) = (${r.sumaPositiva}) − (${r.sumaNegativa}) = ${r.determinante}`
    ].join('\n');
    downloadText(texto, 'sarrus.txt');
  };

  // Modo Práctica
  let matrizPractica;
  function nuevoEjercicio() {
    matrizPractica = matrizAleatoria();
    const el = $('practice-matrix');
    el.replaceChildren();
    matrizPractica.flat().forEach(n => {
      const span = document.createElement('span');
      span.textContent = n;
      el.appendChild(span);
    });
    $('practice-answer').value = '';
    $('practice-feedback').textContent = '';
  }

  $('practice-new').onclick = nuevoEjercicio;
  $('practice-form').onsubmit = e => {
    e.preventDefault();
    const resp = leerNumero($('practice-answer').value);
    if (resp === null) {
      $('practice-feedback').textContent = 'Introduce un número válido.';
      return;
    }
    const correcto = calcularSarrus(matrizPractica).determinante;
    $('practice-feedback').textContent = fmt(resp) === correcto
      ? '¡Correcto!'
      : 'Incorrecto. Revisa las seis diagonales y la resta final.';
  };
  $('practice-solution').onclick = () => { cargarMatriz(matrizPractica); navigate('sarrus'); };

  nuevoEjercicio();
  renderHistory();
  calcularYMostrar(false);
}