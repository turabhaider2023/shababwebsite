import { useEffect, useState } from 'react';
import api from '../../api';

function prettyNumber(value) {
  const digits = String(value || '');
  if (digits.startsWith('91') && digits.length === 12) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return digits ? `+${digits}` : '';
}

export default function AdminWhatsApp() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    document.title = 'WhatsApp · ZAYVORN';
    let timer = 0;
    const load = () => {
      api
        .get('/admin/whatsapp')
        .then((res) => setStatus(res.data))
        .catch(() => setStatus({ connected: false, error: 'Could not reach WhatsApp' }));
    };
    load();
    timer = window.setInterval(load, 3000);
    return () => window.clearInterval(timer);
  }, []);

  const number = prettyNumber(status?.number);

  return (
    <div>
      <div className="admin-top">
        <div>
          <p className="kicker">Store phone</p>
          <h1>WhatsApp</h1>
        </div>
      </div>
      <p className="note">Orders are sent straight to {number || 'the store number'}.</p>
      {!status && <p className="center-note">Connecting…</p>}
      {status?.connected && (
        <div className="summary" style={{ marginTop: 18, maxWidth: 520 }}>
          <h2>Linked</h2>
          <p>New orders go directly to {number}. No need to press Send.</p>
        </div>
      )}
      {status && !status.connected && (
        <div className="summary" style={{ marginTop: 18, maxWidth: 520 }}>
          <h2>Scan once with your phone</h2>
          <p>Open WhatsApp on your own phone → Linked devices → Link a device, then scan this code.</p>
          <p className="note">
            The client does not scan anything. After this, every order is sent from your WhatsApp straight to {number}.
          </p>
          {status.qr ? <img src={status.qr} alt="WhatsApp QR code" style={{ width: 280, marginTop: 12 }} /> : <p>Waiting for the QR code…</p>}
          {status.error && <p className="error">{status.error}</p>}
        </div>
      )}
    </div>
  );
}
