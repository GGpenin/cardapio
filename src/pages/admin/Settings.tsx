import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';

export default function AdminSettings() {
  const { restaurant } = useOutletContext<any>();
  const [name, setName] = useState(restaurant?.name || '');
  const [whatsapp, setWhatsapp] = useState(restaurant?.whatsapp || '');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setLoading(true);

    try {
      const docRef = doc(db, 'restaurants', auth.currentUser.uid);
      await updateDoc(docRef, {
        name,
        whatsapp
      });
      
      setMessage('Configurações salvas com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Erro ao salvar configurações.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Configurações</h1>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
        <form onSubmit={handleSave} className="space-y-6">
          {message && (
            <div className={`p-3 rounded-lg text-sm font-medium ${message.includes('Erro') ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
              {message}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Nome do Restaurante</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">WhatsApp para Pedidos</label>
            <div className="flex rounded-lg shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-neutral-300 bg-neutral-50 text-neutral-500 sm:text-sm">
                +55
              </span>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="11999999999"
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-lg border border-neutral-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
              />
            </div>
            <p className="mt-1 text-sm text-neutral-500">
              Apenas números com DDD. Ex: 11999999999
            </p>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
