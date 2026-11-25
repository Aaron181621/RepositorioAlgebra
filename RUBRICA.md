# Verificación contra Especificaciones Proyecto IF0012, páginas 2–6
La siguiente tabla identifica implementaciones, no una nota asignada por la docente.

| Criterio | Puntos | Evidencia de implementación |
|---|---:|---|
| Dos paneles y deslizador | 5 | index.html: visual-grid, zoom-slider debajo del original |
| Puntos con un clic | 8 | geometria.js: pointerdown, modo punto |
| Segmentos con dos clics | 8 | inicioSegmento y segundo clic |
| Conservación de objetos | 4 | historial de elementos originales |
| Zoom geométrico | 10 | escalarPunto y redibujado |
| Primer cuadrante y sincronización | 5 | aCoordenada, límites y dibujarAmbosPlanos |
| Nueve entradas | 5 | matrix-form |
| Validación | 7 | obtenerMatriz y decimalExacto |
| Matriz organizada | 3 | mostrarMatriz |
| Diagonales visuales | 8 | dibujarSarrus y SVG |
| Seis productos | 8 | pasosEnLista |
| Dos sumas | 6 | sarrusExacto y bloques de resultados |
| Determinante y resta | 5 | final-exp |
| Negativos, decimales, ceros | 3 | pruebas matemáticas |
| Integración | 2 | navegación en una página |
| Interfaz | 2 | diseño responsive, temas, controles |
| Ejecución | 1 | pruebas Chromium |
| Lógica propia de geometría | 5 | coordenadas, segmentos y escala manual |
| Lógica propia de Sarrus | 5 | seis productos explícitos y resta exacta |
| Total | 100 | Criterios trazados; evaluación final corresponde a la docente |

## Resultados de pruebas ejecutadas
- Node.js: 118 comprobaciones matemáticas aprobadas, incluyendo comparación independiente con cofactores, decimales, matrices singulares, negativas y validaciones.
- Chromium mediante Playwright: dibujo por clic, coordenadas manuales, edición, escala, undo/redo, segmentos, exportación PNG, eliminación, limpiar, Sarrus, pasos, validación de texto inválido, matriz aleatoria, TXT, historial de sesión, práctica, tema, teclado y ausencia de desbordamiento horizontal en móvil de 390 px. Sin errores JavaScript en el recorrido de escritorio.
- El acceso file:// fue bloqueado por la política del entorno; las pruebas de navegador ejecutaron el mismo HTML y código local incorporando los recursos. No se verificó la persistencia entre sesiones ni el diálogo de impresión PDF, ni se realizó una auditoría completa de accesibilidad. Deben comprobarse en el equipo de entrega.
