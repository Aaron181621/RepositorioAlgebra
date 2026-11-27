'use strict';

/**
 * PROYECTO IF0012 - Lógica matemática pura (sin dependencias externas).
 */

const MAX_COORD = 10;

/** Convierte texto decimal o con coma a número válido. */
function leerNumero(entrada) {
  const texto = String(entrada).trim();
  if (!/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:[eE][+-]?\d+)?$/.test(texto)) return null;
  const valor = Number(texto.replace(',', '.'));
  return Number.isFinite(valor) ? valor : null;
}

/** Formatea números evitando ceros decimales innecesarios (ej. 0.006000000000000001 -> 0.006). */
function fmt(n) {
  return String(Number(Number(n).toPrecision(12)));
}

/** Regla de Sarrus para una matriz 3x3: suma de diagonales principales menos secundarias. */
function calcularSarrus(m) {
  if (!Array.isArray(m) || m.length !== 3 || m.some(fila => !Array.isArray(fila) || fila.length !== 3)) {
    throw new Error('Se requiere una matriz numérica de 3 × 3.');
  }

  // Convertimos cada celda a número
  const num = m.map(fila => fila.map(v => {
    const n = typeof v === 'number' ? v : leerNumero(v);
    if (n === null || !Number.isFinite(n)) throw new Error('Valor numérico inválido en la matriz.');
    return n;
  }));

  const [a, b, c] = num[0];
  const [d, e, f] = num[1];
  const [g, h, i] = num[2];

  // 3 diagonales principales (↘) y 3 secundarias (↗)
  const positivas = [[a, e, i], [b, f, g], [c, d, h]];
  const negativas = [[c, e, g], [a, f, h], [b, d, i]];

  const prodPos = positivas.map(([x, y, z]) => x * y * z);
  const prodNeg = negativas.map(([x, y, z]) => x * y * z);

  const sumaPos = prodPos.reduce((acc, val) => acc + val, 0);
  const sumaNeg = prodNeg.reduce((acc, val) => acc + val, 0);
  const det = sumaPos - sumaNeg;

  if (![...prodPos, ...prodNeg, sumaPos, sumaNeg, det].every(Number.isFinite)) {
    throw new RangeError('Los valores son demasiado grandes para calcular con precisión.');
  }

  return {
    positivas: positivas.map(fila => fila.map(fmt)),
    negativas: negativas.map(fila => fila.map(fmt)),
    productosPositivos: prodPos.map(fmt),
    productosNegativos: prodNeg.map(fmt),
    sumaPositiva: fmt(sumaPos),
    sumaNegativa: fmt(sumaNeg),
    determinante: fmt(det),
    matriz: num.map(fila => fila.map(fmt))
  };
}

/** Transformación de escala uniforme desde el origen (0,0). */
function escalarPunto(punto, escala) {
  return { x: punto.x * escala, y: punto.y * escala };
}

/** Propiedades geométricas de un segmento de recta. */
function propiedadesSegmento(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return {
    distancia: Math.sqrt(dx * dx + dy * dy),
    pendiente: dx === 0 ? null : dy / dx,
    medio: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
  };
}

if (typeof module !== 'undefined') {
  module.exports = { calcularSarrus, sarrusExacto: calcularSarrus, escalarPunto, leerNumero, fmt, propiedadesSegmento };
}