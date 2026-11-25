# LinearLab 2.0 — IF0012
Laboratorio de Álgebra Lineal para Informática Empresarial. Universidad de Costa Rica. Proyecto académico, entrega 29/11/2026 a las 15:00.

## Ejecutar
Descomprime el ZIP y abre index.html en Chrome, Edge o Firefox actualizado. No requiere Internet, npm ni servidor para utilizarse. Si el navegador restringe localStorage en archivos locales, el historial y tema se mantienen solo durante la sesión; para persistencia puede abrirse desde un servidor local (`python -m http.server 8000` en esta carpeta y visitar http://localhost:8000).

## Uso
- Inicio: acceso directo a las herramientas.
- Geometría: selecciona Punto (un clic) o Segmento (dos clics). También puedes introducir coordenadas mediante teclado. El plano original abarca 0–10, y el transformado mantiene el mismo rango por defecto. Ajustar área visible cambia los límites de visualización, no los datos. El slider está debajo del plano izquierdo. Tabla de elementos con edición, eliminación, coordenadas originales y transformadas; las propiedades se refieren al segmento original. Deshacer/rehacer incluye borrar, editar y limpiar. Exporta cada canvas como PNG.
- Sarrus: introduce nueve valores y calcula. Alterna grupos de diagonales, avanza paso a paso o anima automáticamente. El procedimiento completo permanece visible. Exporta TXT o utiliza Imprimir / PDF (elige guardar como PDF en el diálogo de impresión).
- Práctica: genera una matriz, responde y verifica; puedes abrir la solución completa. Historial: hasta 50 cálculos, con opción de recuperar una matriz o borrar el registro.
- Tema claro/oscuro: botón en la barra lateral. Navegación con Tab y Enter; formularios etiquetados y mensajes de estado.

## Estructura
- index.html: estructura semántica y controles.
- styles.css: diseño adaptable, temas, impresión.
- js/matematica.js: funciones puras, escalado, propiedades y Sarrus decimal exacto.
- js/geometria.js: estado, eventos, canvas, edición, exportación.
- js/sarrus.js: validación, SVG, pasos, historial y práctica.
- js/app.js: navegación, preferencias y descarga de texto.
- tests/matematica.js: pruebas Node.js; `node tests/matematica.js`.
- tests/interfaz.py: Playwright y Chromium; `pip install playwright` y `python tests/interfaz.py` (variable CHROMIUM para indicar ruta del navegador). Pruebas con recursos locales incorporados al HTML, porque el entorno de prueba restringe file://. No son dependencias de uso de la app.
- GUIA_DEFENSA.md y RUBRICA.md: explicación y trazabilidad.

## Límites y precisión
Sarrus usa BigInt y escala decimal común: resultado exacto para los textos decimales admitidos. Admite punto/coma y notación científica, hasta 100 caracteres por entrada y exponente entre -100 y 100. La geometría utiliza Number; clics redondeados a cuatro decimales y salida formateada a 12 cifras significativas. Zoom de 0.5 a 2.5. El dibujo se conserva mientras la página está abierta. La persistencia del historial depende de localStorage; no hay base de datos ni conexión remota. No se hizo auditoría completa de lectores de pantalla ni pruebas en todos los navegadores. Los nombres de los integrantes no se suministraron.
