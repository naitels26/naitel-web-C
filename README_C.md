# NAITEL — Versión C

Versión independiente creada a partir de A. No requiere las carpetas A, B ni comparador. Mantiene HTML/CSS/JavaScript, Node y Nodemailer; no agrega dependencias. Se copiaron los recursos y la dependencia instalada de A, el catálogo y los logotipos reales de B y su carrusel, adaptado a C.

## Abrir

Desde la raíz `C:\Comparativa_Naitels`, ejecutar:

```powershell
& ".\Versión C\Iniciar.cmd"
```

También puede abrir Iniciar.cmd con doble clic. El lanzador busca Node en PATH, en ubicaciones habituales y en el runtime de Codex verificado en este equipo. No instala software ni cambia PATH. La ruta de Codex depende de su versión; si se desinstala o cambia y Node no está instalado por separado, habrá que actualizarla. Cuando Node esté disponible en PATH, también sirve `node ".\Versión C\server.mjs"`.

Abrir la dirección que imprime el servidor: por defecto http://127.0.0.1:8094. Si el puerto está ocupado y no se especificó PORT, el servidor elige otro. Para fijarlo, configurar `$env:PORT='8094'`. Si se cambia, actualizar también el proxy en web.config cuando se use IIS. Detener con Ctrl+C.

También se puede abrir index.html para una vista estática; el servidor es necesario para enviar el formulario y conectar Gemini. La copia local del catálogo permite ver las marcas sin HTTP. Para actualizarla tras editar partners.csv: `node export-partners-preview.mjs` desde esta carpeta.

## Cambios

- Conserva los videos, el fondo tecnológico, las transiciones y el mapa de conexiones de A. Reduce barridos, zooms y animaciones simultáneas. Los títulos se escriben una vez por diapositiva e idioma, en menos de un segundo.
- Avance automático de 11 segundos y 18 segundos para el mapa, también en pantallas táctiles. Sin indicadores ni contador inferior. Flechas laterales permiten avanzar y regresar entre todas las diapositivas. El menú abierto, el formulario, el asistente, el foco dentro de una diapositiva y las pestañas ocultas detienen el avance. Soluciones conserva su lista compacta.
- Movimiento reducido desactiva videos, animaciones y avance automático, mantiene los títulos completos y muestra todas las marcas en una tira desplazable. El menú permite consultar los servicios.
- Carrusel de 38 marcas reales de B en una franja de 32 px de alto, con escala óptica ajustada a las letras y márgenes vacíos compensados. Para Cisco, Hanwha, Rittal y CPI se encuadra el texto del recurso original dentro de la franja; Huawei utiliza la variante horizontal existente. No se estiran las imágenes. Los logos completos del mapa conservan sus recursos originales. La tira mantiene menor velocidad y pausa al enfocar o pasar el cursor, sin botón de pausa.
- Asistente flotante fijo en la esquina inferior derecha, con sombra y solo ícono por debajo de 600 px. Conserva la apertura del chat. Formulario desplazable, campos de 16 px y asistente ajustado al viewport visual. Las sugerencias se ocultan con teclado o poco espacio.
- Pie del hero: únicamente aviso de privacidad de 12 px en color tenue, sobre fondo transparente; franja de marcas intacta. Los datos de contacto se conservan en la diapositiva del formulario. Las llamadas generales a conversar o solicitar diagnóstico abren el formulario.
- Identidad NAITEL y controles en español e inglés. El asistente local existente se identifica como información del sitio; Gemini conserva su integración real.
- Google Ads se carga al aceptar tecnologías opcionales, siguiendo el comportamiento de B. El aviso de cookies describe este comportamiento y permite revisar la elección.

## Configuración pendiente

- SMTP_HOST, SMTP_PORT (587 o 465), SMTP_USER y SMTP_PASS para el envío real. El destinatario existente del módulo de correo es `aleon@naitel.com`. No se guardaron credenciales ni se envió correo real. Sin SMTP, el servidor responde 503 y la interfaz informa que el envío no está disponible.
- GEMINI_API_KEY; opcionalmente GEMINI_MODEL. La clave permanece en el servidor. Sin ella funciona el modo local existente, identificado como tal, sin aparentar respuestas de Gemini.
- No se encontraron perfiles oficiales de redes sociales en los recursos revisados ni se proporcionaron enlaces. Quedan pendientes de suministro para incorporarlos sin inventar direcciones.
- En IIS, configurar Node para C y URL Rewrite/ARR según web.config. No servir archivos privados o credenciales como contenido estático. El servidor Node incluido restringe las rutas públicas.
- La revisión de espacio con teclado se realizó reduciendo el viewport y revisando el manejo de VisualViewport; falta una comprobación con el teclado virtual de un dispositivo iOS/Android real. No se probó el envío real SMTP ni una respuesta real de Gemini.

## Verificar

Desde esta carpeta:

```powershell
node verify-site.mjs
```

Comprueba sintaxis JavaScript, 68 rutas de páginas/estilos/scripts/imágenes/videos/logos, rangos de video, bloqueo de archivos privados, validación de contacto, ausencia de configuración y lógica de pausa/reanudación, formulario, asistente y movimiento reducido. El remitente de la prueba es una función aislada: no se manda correo ni se modifica el envío de producción.

Revisión en navegador: las 10 diapositivas a 320×568, 390×844, 768×1024, 1440×900 y 844×390, sin desbordamientos horizontales de página o de su contenedor de contenido. Se revisaron ambos idiomas, asistente compacto, flechas, menú compacto, franja de marcas, enlaces de contacto, diagnóstico hacia el formulario y preselección de energía desde el asistente. La preferencia de movimiento reducido se verificó mediante las pruebas de lógica y las reglas CSS; no se cambió la configuración de movimiento del sistema operativo.

`verification/original-integrity.json` confirma por SHA-256 que los 3,243 archivos originales de A, B y comparador coinciden con el inventario previo. Los archivos originales no se modificaron.

## Ajuste del hero — 24 de noviembre de 2026

Se retiraron HTML, estilos y listeners de los indicadores, contador y flechas. El autoplay ya no depende de la posición del cursor. Header, contenido de las diapositivas y HTML del carrusel de marcas conservados íntegramente.

Ajuste posterior: flechas laterales en todas las diapositivas; logos del carrusel reducidos visualmente un 10 %, conservando proporciones y movimiento. El menú Soluciones muestra nueve diapositivas (excluye Contacto) y el botón del asistente permite arrastrarlo con mouse o dedo.
