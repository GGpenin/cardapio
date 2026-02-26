import { Link } from 'react-router-dom';
import { Utensils, QrCode, Smartphone } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <header className="bg-white shadow-sm py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xl">
          <Utensils size={24} />
          <span>MenuDigital</span>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="text-neutral-600 hover:text-neutral-900 font-medium px-4 py-2">Login</Link>
          <Link to="/register" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg transition-colors">Criar Conta</Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-neutral-900 tracking-tight max-w-3xl mb-6">
          O cardápio digital do seu restaurante em minutos.
        </h1>
        <p className="text-lg md:text-xl text-neutral-600 max-w-2xl mb-10">
          Crie seu cardápio, gere um QR Code e receba pedidos diretamente no seu WhatsApp. Sem taxas por pedido.
        </p>
        <Link to="/register" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg transition-transform hover:scale-105">
          Começar Gratuitamente
        </Link>

        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-5xl w-full">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex flex-col items-center text-center">
            <div className="bg-emerald-100 text-emerald-600 p-4 rounded-full mb-4">
              <Utensils size={32} />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">Cardápio Online</h3>
            <p className="text-neutral-600">Adicione categorias, produtos e fotos facilmente pelo painel.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex flex-col items-center text-center">
            <div className="bg-emerald-100 text-emerald-600 p-4 rounded-full mb-4">
              <QrCode size={32} />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">QR Code na Mesa</h3>
            <p className="text-neutral-600">Seus clientes escaneiam e acessam o cardápio no próprio celular.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex flex-col items-center text-center">
            <div className="bg-emerald-100 text-emerald-600 p-4 rounded-full mb-4">
              <Smartphone size={32} />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">Pedidos no WhatsApp</h3>
            <p className="text-neutral-600">Receba os pedidos formatados diretamente no seu WhatsApp.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
