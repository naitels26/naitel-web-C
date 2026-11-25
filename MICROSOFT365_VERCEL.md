# Formulario con Microsoft 365 en Vercel

El código envía por Microsoft Graph (HTTPS) usando una aplicación de Entra con OAuth. No necesita la contraseña personal del buzón ni SMTP AUTH. El destinatario de pruebas es **aleon@naitel.com**; el remitente se configura por separado.

## 1. Autorizar la aplicación con el administrador

1. Entrar en [Microsoft Entra](https://entra.microsoft.com/) → App registrations → New registration. Nombre sugerido: `NAITEL Formulario Web`. Elegir solo cuentas de este directorio. No requiere URI de redirección.
2. En Overview copiar **Directory (tenant) ID** y **Application (client) ID**.
3. En Certificates & secrets crear un client secret. Guardar su **Value**, no el Secret ID. Registrar su fecha de vencimiento para renovarlo.
4. Elegir un buzón de Exchange Online habilitado como remitente, por ejemplo `aleon@naitel.com`. El administrador debe registrar el service principal en Exchange Online y asignar **Application Mail.Send** mediante **RBAC for Applications**, con un ámbito limitado a ese buzón. No requiere permisos para leer correos. Seguir la [guía de roles y ámbitos de Exchange](https://learn.microsoft.com/en-us/graph/auth-limit-mailbox-access) y comprobar con `Test-ServicePrincipalAuthorization` que el buzón elegido está autorizado y otro buzón queda fuera del ámbito.
5. Con esta configuración limitada por RBAC, no conceder además el permiso global `Mail.Send` de aplicación en Entra: los permisos se suman y ese permiso sin ámbito permitiría enviar como cualquier buzón, anulando la limitación esperada. Si la aplicación ya lo tiene, el administrador debe retirarlo antes de validar el ámbito.

Referencia: [OAuth para aplicaciones sin usuario](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-client-creds-grant-flow) y [Graph sendMail](https://learn.microsoft.com/en-us/graph/api/user-sendmail?view=graph-rest-1.0).

## 2. Configurar Vercel

En el proyecto conectado a GitHub → Settings → Environment Variables, guardar:

| Variable | Valor |
| --- | --- |
| `M365_TENANT_ID` | Directory (tenant) ID |
| `M365_CLIENT_ID` | Application (client) ID |
| `M365_CLIENT_SECRET` | Value del secreto de la aplicación |
| `M365_SENDER` | Correo del buzón autorizado como remitente |

Seleccionar Production. Agregar Preview solamente si se desea probar también desde despliegues de vista previa. Guardar el secreto directamente en Vercel, nunca en GitHub, HTML o el chat.

Verificar que Root Directory apunte a la carpeta que contiene `package.json`, `vercel.json` y `api/index.mjs` de la versión C. El build existente `node prepare-vercel.mjs` prepara `public/`; las rutas `/api/contact` y `/api/chat` usan la función `api/index.mjs`.

Después de subir el código a la rama conectada, realizar un nuevo despliegue. Si se agregan variables después del despliegue, hacer Redeploy para que se apliquen. Las variables locales no se transfieren con GitHub.

Si existe alguna variable M365, se usa Graph: una configuración incompleta devuelve servicio no configurado, sin recurrir silenciosamente a SMTP. Si no hay ninguna variable M365, se conserva el envío SMTP anterior.

## 3. Prueba real

1. Abrir la URL HTTPS del nuevo despliegue y enviar una solicitud de prueba con datos propios.
2. Revisar `/api/contact` en Network: `200` con `sent: true` indica que Microsoft aceptó la solicitud para envío, no que se haya confirmado la entrega final.
3. Verificar la llegada a `aleon@naitel.com`, incluida la carpeta de correo no deseado, y los elementos enviados del buzón remitente. Reply-To apunta al correo capturado en el formulario.
4. Si falla, consultar los logs de la función en Vercel. Compartir solamente el código de `[Contacto]`, sin secretos ni tokens:
   - `M365_AUTH_400` / `M365_AUTH_401`: revisar tenant, aplicación, Value y vencimiento del secreto.
   - `M365_SEND_403`: revisar el rol Application Mail.Send y el ámbito de acceso al buzón remitente.
   - `M365_SEND_404`: revisar `M365_SENDER` y la existencia del buzón.
   - `M365_SEND_429`: Microsoft limitó temporalmente las solicitudes.
   - Sin configuración: revisar que las cuatro variables estén en el entorno del despliegue y volver a desplegar.

No hay reenvío automático después de un fallo: evita duplicar correos si la respuesta se pierde.

## 4. Pasar de pruebas a ventas

Cambiar `CONTACT_RECIPIENT` en `contact-mail.mjs` de `aleon@naitel.com` a `ventas@naitel.com`, ajustar las expectativas del destinatario en `verify-contact-consent.mjs` y `verify-m365.mjs`, ejecutar `npm test` y volver a desplegar. El remitente puede seguir siendo el mismo buzón autorizado.

## Estado

Integración preparada y pruebas con respuestas simuladas. Falta crear/autorizar la aplicación, guardar las variables en Vercel, desplegar y verificar la llegada real. No se incluyeron credenciales ni se enviaron correos reales.
