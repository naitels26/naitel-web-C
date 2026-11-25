# NAITEL — Versión C

## Envío por Microsoft 365 — configuración actual

Para el formulario en Vercel se agregó Microsoft Graph con OAuth. La guía vigente es [MICROSOFT365_VERCEL.md](MICROSOFT365_VERCEL.md): autorización de la aplicación por el administrador, variables privadas en Vercel y prueba de entrega. El destinatario temporal de pruebas es **aleon@naitel.com**, centralizado en `CONTACT_RECIPIENT` dentro de `contact-mail.mjs`. Las referencias históricas a ventas y a SMTP más abajo describen la configuración previa; SMTP sigue disponible cuando no hay variables M365. Sin credenciales configuradas y autorización del buzón no se envía correo.

## Despliegue en Vercel

El chat selecciona hasta tres apartados completos del catálogo según la pregunta y la última consulta de la conversación. Conserva siempre identidad, restricciones comerciales e índice completo de servicios, evitando enviar todo el catálogo en cada turno. La sugerencia inicial desaparece al comenzar a escribir, al enviar y mientras existe una conversación; también se mantiene oculta si la respuesta llega cuando el visitante ya escribe otra pregunta.

Gemini admite `GEMINI_API_KEY`, `GEMINI_MODEL` (opcional, por defecto `gemini-3.5-flash-lite`) y `GEMINI_FALLBACK_MODEL` (opcional, por defecto `gemini-3.8-flash`). Ante errores temporales de Google o un timeout del primer intento, espera brevemente y realiza un único intento con el modelo de respaldo. El primer intento dispone de 12 s; el segundo aprovecha el tiempo restante, hasta 24 s si el primero falla rápidamente. El límite total sigue siendo 26 s en el servidor y 28 s en el navegador, dentro de los 30 s de Vercel. Se usa razonamiento low en 3.8 Flash y minimal en 3.6 Flash y los Flash-Lite conocidos para reducir latencia; las respuestas habituales se solicitan en menos de 150 palabras. Un 503 de Google puede persistir aunque la configuración sea correcta; el modo local continúa disponible si fallan ambos intentos. Las variables nuevas requieren otro despliegue.

`vercel.json` prepara `public/` con las tres páginas y los recursos permitidos; los videos se sirven como archivos estáticos. `api/index.mjs` exporta el handler del chat y contacto sin abrir un puerto. La función incluye explícitamente el HTML y el catálogo que necesita al arrancar. El servidor local continúa funcionando con `Iniciar.cmd`.

Vercel ejecuta `node prepare-vercel.mjs` y publica `public/`. Configurar `GEMINI_API_KEY` y las variables SMTP en Vercel para habilitar esos servicios. Sin ellas, las APIs devuelven 503 y la página sigue disponible. No subir archivos `.env`.

Verificar con `node verify-site.mjs` y `node verify-vercel.mjs`. La segunda comprobación valida el paquete estático y el cuerpo de las solicitudes tal como lo entrega Vercel, con correo e IA simulados únicamente dentro de la prueba.

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
- Pie del hero: teléfono y correo de ventas en una fila discreta, aviso de privacidad y configuración de cookies; franja de marcas intacta. Los datos de contacto también están en la diapositiva del formulario. Las llamadas generales a conversar o solicitar diagnóstico abren el formulario.
- Identidad NAITEL y controles en español e inglés. El asistente local existente se identifica como información del sitio; Gemini conserva su integración real.
- Google Ads AW-18496508499 se configura desde assets/consent.js en el encabezado. Consent Mode establece los cuatro permisos de publicidad/analítica como denegados por defecto; la librería de Google solo se solicita tras aceptar. El panel permite guardar solo esenciales o autorizar publicidad, recordar la elección y retirarla. Al retirar el permiso se actualiza el consentimiento y se recarga para descargar la librería.

## Configuración pendiente

- SMTP_HOST, SMTP_PORT (587 o 465), SMTP_USER y SMTP_PASS para el envío real. El destinatario existente del módulo de correo es `ventas@naitel.com`. No se guardaron credenciales ni se envió correo real. Sin SMTP, el servidor responde 503 y la interfaz informa que el envío no está disponible.
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

## Contacto y cookies — 25 de noviembre de 2026

- Destinatario y sobre SMTP fijados a ventas@naitel.com; Reply-To conserva el correo del visitante. No se envían los campos del formulario a Google Ads.
- Teléfono confirmado: 800 188 6248, con enlace tel:+528001886248. Correo con enlace mailto, visibles en todas las diapositivas y en Contacto.
- El pie permite abrir Configurar cookies en español e inglés. Rechazar publicidad no impide enviar el formulario. El navegador recuerda la elección si permite almacenamiento local; si lo bloquea, la decisión funciona durante la visita.
- Etiqueta implementada siguiendo https://developers.google.com/tag-platform/security/guides/consent?consentmode=basic . Se añadió la etiqueta base solicitada; no se configuró un evento de conversión porque no se proporcionó una etiqueta de conversión.

### Habilitar la entrega de correos en Vercel

Configurar estas variables en Settings → Environment Variables para el entorno de producción, usando los datos del proveedor del correo:

| Variable | Valor |
| --- | --- |
| SMTP_HOST | Servidor SMTP del proveedor |
| SMTP_PORT | 587 con STARTTLS o 465 con TLS |
| SMTP_USER | Correo autorizado para enviar |
| SMTP_PASS | Contraseña SMTP o contraseña de aplicación del proveedor |

El remitente será SMTP_USER y el destinatario será ventas@naitel.com. Después de guardar las variables, desplegar nuevamente y enviar una solicitud de prueba. No incluir credenciales en HTML, JavaScript público ni en el repositorio. El servidor local lee variables del proceso; no carga archivos .env automáticamente.

La entrega real queda pendiente: no había variables SMTP disponibles en esta sesión. No se envió correo de prueba real ni se publicó el sitio.

### Comprobaciones de este cambio

- node verify-site.mjs y node verify-vercel.mjs: rutas, formulario, validación y paquete estático correctos.
- node verify-contact-consent.mjs: destinatario, sobre y Reply-To mediante transporte simulado; consentimiento inicial, aceptación, persistencia, retirada, bloqueo de almacenamiento y ausencia de etiquetas duplicadas.
- Navegador Edge sin ventana a 1440×900, 390×844 y 320×568: pie y panel de cookies, aceptar/retirar/recargar, traducción inglesa, sin desbordamiento horizontal ni errores JavaScript. Recursos externos simulados para no transmitir datos a Google durante la prueba. Capturas en verification/contact-footer-*.png y verification/cookie-settings-*.png.
