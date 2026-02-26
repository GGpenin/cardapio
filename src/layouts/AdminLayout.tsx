import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ListTree, Package, Settings, LogOut, Menu, X, Utensils } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, 'restaurants', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setRestaurant({ id: user.uid, ...docSnap.data() });
          } else {
            console.error('No such document!');
            navigate('/login');
          }
        } catch (error) {
          console.error('Error fetching restaurant:', error);
        } finally {
          setLoading(false);
        }
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Categorias', path: '/admin/categories', icon: ListTree },
    { name: 'Produtos', path: '/admin/products', icon: Package },
    { name: 'Configurações', path: '/admin/settings', icon: Settings },
  ];

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  if (!restaurant) return null;

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar Desktop */}
      <div className="hidden md:flex flex-col w-64 bg-white border-r border-neutral-200">
        <div className="h-16 flex items-center px-6 border-b border-neutral-200">
          <Utensils className="text-emerald-600 mr-2" size={24} />
          <span className="font-bold text-xl text-neutral-900 truncate">{restaurant.name}</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <item.icon className={`mr-3 flex-shrink-0 h-5 w-5 ${isActive ? 'text-emerald-600' : 'text-neutral-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-neutral-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="mr-3 flex-shrink-0 h-5 w-5 text-red-500" />
            Sair
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 z-50">
        <div className="flex items-center">
          <Utensils className="text-emerald-600 mr-2" size={24} />
          <span className="font-bold text-lg text-neutral-900 truncate">{restaurant.name}</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-neutral-500">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white pt-16">
          <nav className="px-4 py-6 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-3 text-base font-medium rounded-lg ${
                    isActive 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  <item.icon className={`mr-3 flex-shrink-0 h-6 w-6 ${isActive ? 'text-emerald-600' : 'text-neutral-400'}`} />
                  {item.name}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-3 mt-4 text-base font-medium text-red-600 rounded-lg hover:bg-red-50"
            >
              <LogOut className="mr-3 flex-shrink-0 h-6 w-6 text-red-500" />
              Sair
            </button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden pt-16 md:pt-0">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet context={{ restaurant }} />
        </div>
      </main>
    </div>
  );
}
