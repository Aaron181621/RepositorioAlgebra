'use strict';

/**
 * PROYECTO IF0012 - Lógica implementada por el grupo.
 * Separamos los cálculos puros del código de interfaz para que sean fáciles
 * de estudiar, explicar y probar sin depender de bibliotecas matemáticas.
 */

const MAX_COORD = 10; // Los dos planos usan el mismo sistema de 0 a 10.

/** Regla de Sarrus para una matriz 3x3: tres productos descendentes menos tres ascendentes. */
function calcularSarrus(m) {
  if (!Array.isArray(m) || m.length !== 3 || m.some(fila => !Array.isArray(fila) || fila.length !== 3 || fila.some(v => !Number.isFinite(v)))) {
    throw new Error('Se requiere una matriz numérica de 3 × 3.');
  }
  const a = m[0][0], b = m[0][1], c = m[0][2];
  const d = m[1][0], e = m[1][1], f = m[1][2];
  const g = m[2][0], h = m[2][1], i = m[2][2];

  // Diagonales principales (↘): a·e·i, b·f·g, c·d·h.
  const positivas = [[a,e,i], [b,f,g], [c,d,h]];
  // Diagonales secundarias (↗): c·e·g, a·f·h, b·d·i.
  const negativas = [[c,e,g], [a,f,h], [b,d,i]];
  const productosPositivos = positivas.map(valores => valores[0] * valores[1] * valores[2]);
  const productosNegativos = negativas.map(valores => valores[0] * valores[1] * valores[2]);
  const sumaPositiva = productosPositivos.reduce((suma, valor) => suma + valor, 0);
  const sumaNegativa = productosNegativos.reduce((suma, valor) => suma + valor, 0);
  const determinante = sumaPositiva - sumaNegativa;
  // Un número de entrada puede ser válido y, aun así, provocar desbordamiento
  // durante los productos (por ejemplo, 1e300 × 1e300). Se controla aquí.
  if (![...productosPositivos, ...productosNegativos, sumaPositiva, sumaNegativa, determinante].every(Number.isFinite)) {
    throw new RangeError('Los valores son demasiado grandes para realizar el cálculo con precisión numérica. Utiliza números de menor magnitud.');
  }

  return { positivas, negativas, productosPositivos, productosNegativos, sumaPositiva, sumaNegativa, determinante };
}

/** Transformación geométrica de escala, con el origen (0,0) fijo. */
function escalarPunto(punto, escala) {
  return { x: punto.x * escala, y: punto.y * escala };
}

/** Acepta positivos, negativos, decimales con coma/punto y notación científica. */
function leerNumero(entrada) {
  const texto = String(entrada).trim();
  if (!/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:[eE][+-]?\d+)?$/.test(texto)) return null;
  const valor = Number(texto.replace(',', '.'));
  return Number.isFinite(valor) ? valor : null;
}

/** Presentación legible sin crear ceros decimales falsos en los cálculos. */
function fmt(n) {
  return String(Number(Number(n).toPrecision(12)));
}


/** Convierte texto decimal a entero y escala, sin pasar por Number. */
function decimalExacto(raw){const s=String(raw).trim().replace(',','.');const m=/^([+-]?)(?:(\d+)(?:\.(\d*))?|\.(\d+))(?:[eE]([+-]?\d+))?$/.exec(s);if(!m||s.length>100)throw Error('Número inválido o demasiado largo');const frac=m[3]??m[4]??'', exp=Number(m[5]??0);if(!Number.isInteger(exp)||Math.abs(exp)>100)throw Error('Exponente fuera de rango (±100)');let n=BigInt((m[2]??'0')+frac)*(m[1]==='-'?-1n:1n),d=frac.length-exp;if(d<0){n*=10n**BigInt(-d);d=0;}return {n,d};}
function decimalTexto(n,d){const neg=n<0n;n=neg?-n:n;let s=n.toString().padStart(d+1,'0');if(d)s=(s.slice(0,-d)+'.'+s.slice(-d)).replace(/0+$/,'').replace(/\.$/,'');return (neg?'-':'')+s;}
function sarrusExacto(m){if(m.length!==3||m.some(r=>r.length!==3))throw Error('Matriz 3×3 requerida');const parsed=m.map(r=>r.map(decimalExacto));const d=Math.max(...parsed.flat().map(v=>v.d));const q=parsed.map(r=>r.map(v=>v.n*10n**BigInt(d-v.d)));const [a,b,c,e,f,g,h,i,j]=q.flat();const pos=[[a,f,j],[b,g,h],[c,e,i]],neg=[[c,f,h],[a,g,i],[b,e,j]];const prod=t=>t.map(r=>r[0]*r[1]*r[2]);const p=prod(pos),n=prod(neg),sp=p.reduce((a,b)=>a+b,0n),sn=n.reduce((a,b)=>a+b,0n);const out=v=>decimalTexto(v,3*d);return {positivas:pos.map(r=>r.map(v=>decimalTexto(v,d))),negativas:neg.map(r=>r.map(v=>decimalTexto(v,d))),productosPositivos:p.map(out),productosNegativos:n.map(out),sumaPositiva:out(sp),sumaNegativa:out(sn),determinante:out(sp-sn),matriz:q.map(r=>r.map(v=>decimalTexto(v,d)))};}
function propiedadesSegmento(a,b){const dx=b.x-a.x,dy=b.y-a.y;return {distancia:Math.sqrt(dx*dx+dy*dy),pendiente:dx===0?null:dy/dx,medio:{x:(a.x+b.x)/2,y:(a.y+b.y)/2}};}
if(typeof module!=='undefined')module.exports={calcularSarrus,escalarPunto,leerNumero,fmt,sarrusExacto,decimalExacto,propiedadesSegmento};
