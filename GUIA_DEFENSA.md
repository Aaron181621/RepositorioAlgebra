# Guía de defensa — LinearLab 2.0

## Arquitectura
HTML representa controles, CSS controla apariencia y JavaScript conserva estado y realiza cálculos. Los módulos se cargan con scripts defer en orden: matemática, geometría, Sarrus, coordinación. No usamos funciones externas para determinantes, segmentos ni escala.

## Geometría
Cada objeto tiene tipo, etiqueta y coordenadas originales. Punto: {x,y}; segmento: inicio y fin. El primer clic de segmento guarda un extremo temporal; el segundo crea el objeto. El plano original limita las coordenadas a [0,10]. El canvas tiene origen arriba a la izquierda; por ello se calcula px = izquierda + x/rango × lado, py = abajo − y/rango × lado. El lado es el mismo en ambos ejes, para no deformar ángulos. La conversión inversa obtiene coordenadas al hacer clic. Se dibujan ejes, cuadrícula y objetos, usando recorte del área. Las etiquetas distinguen objetos P y S.

Escala uniforme S = [[k,0],[0,k]], P′ = (kx,ky). Si P=(2,3) y k=2, P′=(4,6). No modificamos P. Para un segmento A=(0,0), B=(3,4): distancia √(9+16)=5, pendiente 4/3 y punto medio (1.5,2). Si dx=0 la pendiente no está definida; una distancia nula es posible. El ajuste de vista solo cambia el rango del plano derecho. Las copias del arreglo permiten deshacer y rehacer operaciones; una nueva edición elimina el historial de rehacer. Exportar usa canvas.toDataURL, no modifica las coordenadas.

## Determinantes
Matriz A = [[a,b,c],[d,e,f],[g,h,i]]. Las tres diagonales principales son aei, bfg, cdh; las secundarias ceg, afh, bdi. det(A) = (aei+bfg+cdh) − (ceg+afh+bdi). El SVG repite las primeras dos columnas y dibuja líneas sobre ellas. La animación resalta cada producto, sin sustituir el resultado completo.

Ejemplo [[1,2,3],[0,4,5],[1,0,6]]: principales 24,10,0; secundarias 12,0,0; sumas 34 y 12; resultado 22.

Precisión: decimalExacto convierte cada texto a n/10^d usando BigInt. Se toma el máximo d de los nueve valores y se multiplican los numeradores por potencias de diez para igualar denominadores. Los productos tienen denominador 10^(3d). Sumas y resta se hacen sobre enteros exactos; decimalTexto inserta el punto y elimina ceros finales. Ejemplo 0.1 × 0.2 × 0.3 = 0.006 exacto. No redondeamos el determinante. La geometría sí emplea punto flotante porque sus coordenadas provienen de píxeles y sus distancias pueden ser irracionales.

## Preguntas de defensa
1. ¿Por qué invertir Y al dibujar? El canvas crece hacia abajo y el plano cartesiano hacia arriba.
2. ¿Qué pasa al reducir k? Se multiplican ambas coordenadas por un factor menor que uno.
3. ¿Por qué el ajuste de vista no cambia la matriz de transformación? Solo cambia la conversión a píxeles.
4. ¿Cómo se distingue una matriz singular? El determinante es exactamente cero.
5. ¿Por qué no basta Number para decimales? La representación binaria no representa exactamente muchos decimales.
6. ¿Cómo se valida un campo? Se comprueba su formato, longitud y exponente antes de operar.
7. ¿Cómo comprobar la fórmula? Comparar con expansión por cofactores; las pruebas incluyen 100 matrices de enteros.
8. ¿Qué ocurre al agregar tras deshacer? Se elimina la rama de rehacer.

## Demostración sugerida
Abrir Inicio; crear dos puntos y un segmento por clic; introducir (2,3) manualmente; cambiar k a 2; comprobar tabla; editar, deshacer y rehacer; exportar PNG. Abrir Sarrus, calcular 22 y recorrer pasos; probar matriz con negativos, campos inválidos y decimales. Mostrar historial, práctica y tema oscuro. Cada integrante debe comprender ambos módulos, aunque se repartan el trabajo.
