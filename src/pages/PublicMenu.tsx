import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingBag, Plus, Minus, Trash2, Utensils, MessageCircle } from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export default function PublicMenu() {
  const { slug } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{ product: any; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        if (!slug) throw new Error('No slug');

        // 1. Get restaurant ID from slug
        const slugDoc = await getDoc(doc(db, 'slugs', slug));
        if (!slugDoc.exists()) {
          throw new Error('Restaurant not found');
        }
        
        const restaurantId = slugDoc.data().restaurantId;

        // 2. Get restaurant details
        const restaurantDoc = await getDoc(doc(db, 'restaurants', restaurantId));
        if (!restaurantDoc.exists()) {
          throw new Error('Restaurant not found');
        }

        // 3. Get categories
        const catQ = query(
          collection(db, 'categories'), 
          where('restaurantId', '==', restaurantId),
          orderBy('createdAt', 'asc')
        );
        const catSnap = await getDocs(catQ);
        const categories = catSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        // 4. Get products
        const prodQ = query(
          collection(db, 'products'), 
          where('restaurantId', '==', restaurantId),
          orderBy('createdAt', 'asc')
        );
        const prodSnap = await getDocs(prodQ);
        const products = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        setData({
          restaurant: { id: restaurantId, ...restaurantDoc.data() },
          categories,
          products
        });
      } catch (error) {
        console.error("Error fetching menu:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [slug]);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const sendWhatsAppOrder = () => {
    if (!data?.restaurant?.whatsapp) {
      alert('O restaurante não configurou o WhatsApp para pedidos.');
      return;
    }

    let message = `*Novo Pedido - ${data.restaurant.name}*\n\n`;
    cart.forEach(item => {
      message += `${item.quantity}x ${item.product.name} - R$ ${(item.product.price * item.quantity).toFixed(2).replace('.', ',')}\n`;
    });
    message += `\n*Total: R$ ${cartTotal.toFixed(2).replace('.', ',')}*\n\n`;
    message += `Por favor, confirme meu pedido.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/55${data.restaurant.whatsapp}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando cardápio...</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center text-red-600">Restaurante não encontrado.</div>;

  return (
    <div className="min-h-screen bg-neutral-50 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xl">
            <Utensils size={24} />
            <span className="text-neutral-900">{data.restaurant.name}</span>
          </div>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-neutral-600 hover:text-emerald-600 transition-colors"
          >
            <ShoppingBag size={24} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-emerald-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center transform translate-x-1 -translate-y-1">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Menu Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {data.categories.length === 0 ? (
          <div className="text-center text-neutral-500 py-12">Nenhum produto cadastrado ainda.</div>
        ) : (
          <div className="space-y-10">
            {data.categories.map((category: any) => {
              const categoryProducts = data.products.filter((p: any) => p.categoryId === category.id);
              if (categoryProducts.length === 0) return null;

              return (
                <section key={category.id}>
                  <h2 className="text-2xl font-bold text-neutral-900 mb-6 border-b border-neutral-200 pb-2">
                    {category.name}
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {categoryProducts.map((product: any) => (
                      <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100 flex gap-4 hover:shadow-md transition-shadow">
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-semibold text-neutral-900 text-lg">{product.name}</h3>
                            <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{product.description}</p>
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <span className="font-bold text-emerald-600">
                              R$ {product.price.toFixed(2).replace('.', ',')}
                            </span>
                            <button 
                              onClick={() => addToCart(product)}
                              className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                            >
                              Adicionar
                            </button>
                          </div>
                        </div>
                        {product.imageUrl && (
                          <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-neutral-100">
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right">
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-white">
              <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <ShoppingBag size={20} /> Seu Pedido
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-full">
                <span className="sr-only">Fechar</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="text-center text-neutral-500 mt-10">Seu carrinho está vazio.</div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex gap-4 items-center bg-neutral-50 p-3 rounded-xl">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-neutral-900 truncate">{item.product.name}</h4>
                        <div className="text-emerald-600 font-medium text-sm">
                          R$ {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-white border border-neutral-200 rounded-lg p-1">
                        <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1 text-neutral-500 hover:text-emerald-600">
                          <Minus size={16} />
                        </button>
                        <span className="w-4 text-center text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, 1)} className="p-1 text-neutral-500 hover:text-emerald-600">
                          <Plus size={16} />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item.product.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t border-neutral-200 bg-white">
                <div className="flex justify-between items-center mb-4 text-lg font-bold text-neutral-900">
                  <span>Total</span>
                  <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <button 
                  onClick={sendWhatsAppOrder}
                  className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-500/20"
                >
                  <MessageCircle size={20} />
                  Pedir pelo WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Cart Button (Mobile) */}
      {cartCount > 0 && !isCartOpen && (
        <div className="fixed bottom-6 left-0 right-0 px-4 z-40 md:hidden">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-between shadow-lg shadow-emerald-600/20"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} />
              <span>{cartCount} {cartCount === 1 ? 'item' : 'itens'}</span>
            </div>
            <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
          </button>
        </div>
      )}
    </div>
  );
}
