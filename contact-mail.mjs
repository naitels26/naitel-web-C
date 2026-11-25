const mailboxPattern = /^[a-z0-9.!#$%&'*+/=?^_\x60{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i;
const controlCharacters = /[\x00-\x1f\x7f]/;
const appointmentWindowDays = 90;

function validateAppointment(body) {
  const { appointmentDate: date = '', appointmentTime: time = '', appointmentTimeZone: timeZone = '' } = body;
  if (date === '' && time === '' && timeZone === '') return undefined;
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      typeof time !== 'string' || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time) ||
      typeof timeZone !== 'string' || !/^[a-z0-9_+/-]{1,80}$/i.test(timeZone)) return null;

  const requestedDay = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(requestedDay.getTime()) || requestedDay.toISOString().slice(0, 10) !== date) return null;
  let local;
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    });
    local = Object.fromEntries(formatter.formatToParts().map(({ type, value }) => [type, value]));
  } catch {
    return null;
  }
  const today = `${local.year}-${local.month}-${local.day}`;
  const lastDay = new Date(`${today}T00:00:00Z`);
  lastDay.setUTCDate(lastDay.getUTCDate() + appointmentWindowDays);
  if (`${date}T${time}` <= `${today}T${local.hour}:${local.minute}` || requestedDay > lastDay) return null;
  return { date, time, timeZone };
}

export function validateContact(body, reasons) {
  if (body?.consent !== true) return null;
  const fields = {};
  const limits = { name: 120, company: 140, email: 160, phone: 25, extension: 8 };
  for (const [key, max] of Object.entries(limits)) {
    const raw = body[key] ?? '';
    if (typeof raw !== 'string' || raw.length > max || controlCharacters.test(raw)) return null;
    fields[key] = raw.trim();
  }
  if (!fields.name || !fields.company || !mailboxPattern.test(fields.email) ||
      !/^[0-9+(). -]{7,25}$/.test(fields.phone) ||
      fields.phone.replace(/\D/g, '').length < 7 ||
      !/^\d{0,8}$/.test(fields.extension) || !reasons.has(body.reason)) return null;
  const appointment = validateAppointment(body);
  if (appointment === null) return null;
  return { ...fields, reason: reasons.get(body.reason), ...(appointment ? { appointment } : {}) };
}

function escapeHtml(value) {
  const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(value).replace(/[&<>"']/g, character => entities[character]);
}

function formatContactEmail(fields) {
  const details = [
    ['Persona de contacto', fields.name],
    ['Correo electrónico', fields.email],
    ['Teléfono', fields.extension ? `${fields.phone} ext. ${fields.extension}` : fields.phone],
    ['Motivo de consulta', fields.reason]
  ];
  const appointment = fields.appointment;
  const dateLabel = appointment
    ? new Intl.DateTimeFormat('es-MX', { dateStyle: 'full', timeZone: 'UTC' }).format(new Date(`${appointment.date}T00:00:00Z`))
    : '';
  const appointmentText = appointment ? `${dateLabel} · ${appointment.time} · ${appointment.timeZone}` : '';
  const subject = `Nueva solicitud de contacto · ${fields.company} | NAITEL`;
  const text = [
    'NUEVA SOLICITUD DE CONTACTO',
    `Empresa interesada: ${fields.company}`,
    `${fields.name} quiere ponerse en contacto con NAITEL para un diagnóstico técnico.`,
    '',
    ...details.map(([label, value]) => `${label}: ${value}`),
    '',
    ...(appointment ? ['Preferencia de cita pendiente de confirmación', appointmentText, ''] : []),
    `Responde a este correo para contactar a ${fields.name}.`
  ].join('\n');
  const replyAddress = escapeHtml(encodeURIComponent(fields.email).replace('%40', '@'));
  const rows = details.map(([label, value]) => `
    <tr><td style="padding:11px 13px;border-bottom:1px solid #e3edf5">
      <p style="margin:0 0 4px;color:#48637a;font-size:12px;font-weight:bold">${escapeHtml(label)}</p>
      <p style="margin:0;color:#102d43;font-size:15px;overflow-wrap:anywhere;word-break:break-word">${escapeHtml(value)}</p>
    </td></tr>`).join('');
  const appointmentBlock = appointment ? `
    <tr><td style="padding:14px 16px;background:#e9f5ff;border:1px solid #bedff5">
      <p style="margin:0 0 5px;color:#15537c;font-size:12px;font-weight:bold">PREFERENCIA DE CITA</p>
      <p style="margin:0 0 5px;color:#102d43;font-size:15px;font-weight:bold">${escapeHtml(appointmentText)}</p>
      <p style="margin:0;color:#48637a;font-size:13px">Pendiente de confirmación con la persona interesada.</p>
    </td></tr>` : '';
  const html = `<!doctype html><html lang="es"><body style="margin:0;background:#edf3f8;color:#102d43;font-family:Arial,sans-serif">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#edf3f8">
      <tr><td align="center" style="padding:20px 12px">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fff;border:1px solid #d5e3ee">
          <tr><td style="padding:25px 24px;background:#092840;border-top:4px solid #38a8f0;color:#fff">
            <p style="margin:0 0 9px;color:#a6dfff;font-size:12px;font-weight:bold;letter-spacing:2px">NAITEL · NUEVA SOLICITUD DE CONTACTO</p>
            <h1 style="margin:0;font-size:25px;line-height:1.25;overflow-wrap:anywhere;word-break:break-word">${escapeHtml(fields.company)}</h1>
          </td></tr>
          <tr><td style="padding:22px 24px">
            <p style="margin:0 0 16px;font-size:16px;line-height:1.5"><strong>${escapeHtml(fields.name)}</strong> quiere ponerse en contacto con NAITEL para un diagnóstico técnico.</p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f9fc">
              ${rows}${appointmentBlock}
            </table>
            <table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:20px">
              <tr><td bgcolor="#126ea4" style="border-radius:6px">
                <a href="mailto:${replyAddress}" style="display:inline-block;padding:12px 17px;color:#fff;font-size:14px;font-weight:bold;text-decoration:none">Contactar a la persona</a>
              </td></tr>
            </table>
          </td></tr>
          <tr><td style="padding:13px 24px;background:#f5f9fc;color:#48637a;font-size:12px">Solicitud recibida desde el formulario de NAITEL.</td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`;
  return { subject, text, html };
}

// Test recipient. Change here to ventas@naitel.com after verifying real delivery.
export const CONTACT_RECIPIENT = 'aleon@naitel.com';

function createMicrosoft365Sender(env, fetcher) {
  const tenant = env.M365_TENANT_ID?.trim();
  const client = env.M365_CLIENT_ID?.trim();
  const secret = env.M365_CLIENT_SECRET;
  const sender = env.M365_SENDER?.trim();
  const guid = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
  if (!guid.test(tenant ?? '') || !guid.test(client ?? '') || !secret ||
      !mailboxPattern.test(sender ?? '') || controlCharacters.test(sender)) return null;

  const fail = (stage, status) => Object.assign(new Error('Microsoft 365 mail request failed.'), {
    code: `M365_${stage}_${status}`
  });
  return async fields => {
    // HTTPS works in serverless environments without an SMTP connection.
    const tokenResponse = await fetcher(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
      method: 'POST', redirect: 'error', signal: AbortSignal.timeout(8000),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: client, client_secret: secret,
        scope: 'https://graph.microsoft.com/.default', grant_type: 'client_credentials' }).toString()
    });
    if (!tokenResponse.ok) throw fail('AUTH', tokenResponse.status);
    const token = await tokenResponse.json();
    if (typeof token.access_token !== 'string' || !token.access_token ||
        controlCharacters.test(token.access_token)) throw fail('AUTH', 'TOKEN');
    const { subject, html } = formatContactEmail(fields);
    const response = await fetcher(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(sender)}/sendMail`, {
      method: 'POST', redirect: 'error', signal: AbortSignal.timeout(12000),
      headers: { Authorization: `Bearer ${token.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: {
        subject, body: { contentType: 'HTML', content: html },
        toRecipients: [{ emailAddress: { address: CONTACT_RECIPIENT } }],
        replyTo: [{ emailAddress: { address: fields.email } }]
      }, saveToSentItems: true })
    });
    // Accepted by Microsoft for sending; final delivery is handled by Exchange.
    // Do not retry automatically: an uncertain response could duplicate a message.
    if (response.status !== 202) throw fail('SEND', response.status);
  };
}

export function createContactSender(env = process.env, { fetcher = fetch } = {}) {
  if (['M365_TENANT_ID', 'M365_CLIENT_ID', 'M365_CLIENT_SECRET', 'M365_SENDER'].some(key => env[key])) {
    return createMicrosoft365Sender(env, fetcher);
  }
  const host = env.SMTP_HOST?.trim();
  const user = env.SMTP_USER?.trim();
  const pass = env.SMTP_PASS;
  const port = Number(env.SMTP_PORT || 587);
  if (!host || !user || !pass || !mailboxPattern.test(user) ||
      !Number.isInteger(port) || port < 1 || port > 65535) return null;

  const to = CONTACT_RECIPIENT;
  let transport;
  return async fields => {
    if (!transport) {
      const { default: nodemailer } = await import('nodemailer');
      transport ??= nodemailer.createTransport({
        host, port, secure: port === 465, requireTLS: port !== 465,
        auth: { user, pass },
        connectionTimeout: 7000, greetingTimeout: 5000, socketTimeout: 12000,
        disableFileAccess: true, disableUrlAccess: true
      });
    }
    const result = await transport.sendMail({
      from: { name: 'NAITEL', address: user },
      to,
      envelope: { from: user, to: [to] },
      replyTo: fields.email,
      ...formatContactEmail(fields)
    });
    if (!result.accepted.includes(to)) throw new Error('SMTP did not accept the recipient.');
  };
}
