import { useOutletContext, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ExternalLink, Copy, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function AdminDashboard() {
  const { restaurant } = useOutletContext<any>();
  const [copied, setCopied] = useState(false);

  const menuUrl = `${window.location.origin}/${restaurant.slug}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(menuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Bem-vindo, {restaurant.name}!</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* QR Code Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col items-center text-center">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Seu QR Code</h2>
          <div className="bg-white p-4 rounded-xl border border-neutral-100 shadow-sm mb-4">
            <QRCodeSVG value={menuUrl} size={200} />
          </div>
          <p className="text-sm text-neutral-500 mb-4">
            Imprima este QR Code e coloque nas mesas do seu restaurante.
          </p>
          <button 
            onClick={() => {
              const svg = document.querySelector('svg');
              if (!svg) return;
              const svgData = new XMLSerializer().serializeToString(svg);
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              const img = new Image();
              img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx?.drawImage(img, 0, 0);
                const pngFile = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.download = `qrcode-${restaurant.slug}.png`;
                downloadLink.href = `${pngFile}`;
                downloadLink.click();
              };
              img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
            }}
            className="text-emerald-600 font-medium hover:text-emerald-700"
          >
            Baixar QR Code
          </button>
        </div>

        {/* Link Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col justify-center">
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">Link do Cardápio</h2>
          <p className="text-sm text-neutral-500 mb-6">
            Compartilhe este link no Instagram, WhatsApp ou onde preferir.
          </p>
          
          <div className="flex items-center gap-2 mb-6">
            <div className="flex-1 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-600 truncate">
              {menuUrl}
            </div>
            <button 
              onClick={copyToClipboard}
              className="p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors"
              title="Copiar Link"
            >
              {copied ? <CheckCircle2 size={20} className="text-emerald-600" /> : <Copy size={20} />}
            </button>
          </div>

          <a 
            href={menuUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 font-medium transition-colors"
          >
            <ExternalLink size={20} />
            Acessar Cardápio
          </a>
        </div>
      </div>
    </div>
  );
}
