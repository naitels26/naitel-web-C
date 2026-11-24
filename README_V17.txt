NAITEL V17 - Archivos MOV licenciados convertidos a WebM VP9, 1600x900, 24fps, sin audio.
Slides actualizados: 1, 3, 4, 6, 7 y 8.
Pendientes de sustituir: slide 2 (brazo robotico), slide 5 (centro de datos).
El video adicional del saludo empresarial no fue incorporado porque no tiene un slide asignado.

CHAT CON GEMINI

El chat usa Gemini cuando la pagina se sirve con el servidor Node.js y este tiene
GEMINI_API_KEY configurada. En PowerShell 7, desde esta carpeta:

  $env:GEMINI_API_KEY = Read-Host 'Clave de Gemini' -MaskInput
  node server.mjs

Abre la direccion que imprime el servidor. Usa el puerto 8080 cuando esta
disponible y elige otro si Windows no permite abrirlo.
La respuesta de /api/chat identifica a Gemini en el campo provider.
Gemini usa los capitulos tecnicos de assistant-catalog.txt junto con el contenido
de la pagina. Incluye ese archivo junto a server.mjs en el despliegue y
reinicia Node al actualizar el catalogo. El archivo queda fuera de las
rutas publicas. El asistente local usa el contenido de la pagina.
La clave se crea en https://aistudio.google.com/apikey y queda en el servidor.
Puedes cambiar el modelo con GEMINI_MODEL y el puerto con PORT.

Si abres index.html como archivo local o lo sirves desde un alojamiento
exclusivamente estatico, el chat usa el asistente local. Para activar Gemini
en un sitio publicado, sirve la pagina y /api/chat desde el mismo origen
con un servidor Node.js y configura GEMINI_API_KEY en ese entorno.

ENVIO DEL FORMULARIO

El servidor envia las solicitudes a aleon@naitel.com por SMTP.
Instala la dependencia con `npm install` en la carpeta del proyecto.
Configura estas variables en el mismo entorno que ejecuta server.mjs.

  SMTP_HOST: servidor de correo saliente del proveedor.
  SMTP_PORT: puerto de envio (587 por defecto, o 465 para TLS directo).
  SMTP_USER: correo de la cuenta que autentica y figura como remitente.
  SMTP_PASS: credencial SMTP de esa cuenta.

En PowerShell, puedes introducir la credencial sin que aparezca en pantalla:

  $smtpSecret = Read-Host -Prompt 'Credencial SMTP' -AsSecureString
  $env:SMTP_PASS = [System.Net.NetworkCredential]::new('', $smtpSecret).Password

Reinicia server.mjs con las variables configuradas. En IIS, reenvia
`/api/contact` a Node por el mismo origen, igual que `/api/chat`.

Para Microsoft 365, usa smtp.office365.com, puerto 587 y erp@naitel.com en
SMTP_USER. El remitente visible sera NAITEL <erp@naitel.com>.

PARTNERS

1. Guarda el logo en assets/logos/ con un nombre sin espacios (por ejemplo, nueva-marca.svg).
   Se aceptan SVG, PNG, JPG, JPEG, WebP y AVIF.
2. Agrega una fila a assets/logos/partners.csv (UTF-8, separado por comas) con
   marca,logo,categoria_es,categoria_en,alto_logo,pais_origen. Usa los mismos nombres de categoria para
   agrupar marcas. Una categoria nueva aparece en el selector automaticamente.
   Si un campo contiene comas, escribelo entre comillas dobles.
   alto_logo es opcional y permite ajustar el alto visual del logo en pixeles.
   pais_origen es opcional y acepta el codigo ISO de dos letras (SE, DE, MX).
   La diapositiva 08 usa ese dato para ubicar las marcas en el mapa.
3. Guarda el CSV y el logo junto a los demas archivos del sitio. Las marcas
   aparecen en el orden del CSV al recargar la pagina. Usa node server.mjs
   para abrir Partners desde la direccion HTTP que imprime.

Al abrir index.html con doble clic, Partners muestra una copia del CSV porque
el navegador bloquea la lectura de archivos locales. Para actualizar esa copia
despues de editar el CSV, ejecuta node export-partners-preview.mjs y recarga.

La seleccion inicial viene de assistant-catalog.txt. Los archivos de logo se
obtuvieron de Wikimedia Commons (https://commons.wikimedia.org/).
