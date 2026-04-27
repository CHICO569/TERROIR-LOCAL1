/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { CATEGORIES } from '../constants';
import { Product } from '../types';
import { ProductCard } from '../components/shop/ProductCard';
import { Search, Filter, SlidersHorizontal, PackageSearch, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { ProductModal } from '../components/shop/ProductModal';
import { productService } from '../services/productService';

// Mocks complets pour la simulation
const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: "Bissap Rouge", category: "Fleurs & Thé", price: 1500, stock: 50, producer: "Coop Kaolack", description: "Fleurs de bissap séchées de première qualité.", imageUrl: "https://th.bing.com/th/id/R.c0d3c7c4aae4eb38ecde0925bcb60d14?rik=Mtswoo8p%2fYTAzg&pid=ImgRaw&r=0", attributes: {} },
  { id: '2', name: "Huile d'Arachide Pure", category: "Épicerie", price: 1200, stock: 100, producer: "Terroir Pure", description: "Huile pressée à froid, 100% naturelle.", imageUrl: "https://shop.haudecoeur.fr/medias/produitsb2b/middle_square_pate-d-arachide-seaux-4-5-kg-tantie_3276650143078.jpg", attributes: {} },
  { id: '3', name: "Mangues Kent", category: "Fruits", price: 1200, stock: 30, producer: "Casamance", description: "Mangues Kent savoureuses et sucrées.", imageUrl: "https://th.bing.com/th/id/R.21ecfd0af49f46faa8fc7a786b6369e6?rik=WJlxcQ%2bnt9vHLQ&pid=ImgRaw&r=0", attributes: {} },
  { id: '4', name: "Guedj Kong (Fumé)", category: "Mer", price: 2500, stock: 20, producer: "Saly Portudal", description: "Poisson fumé traditionnel pour vos plats.", imageUrl: "https://tse3.mm.bing.net/th/id/OIP.hGgrzmLvu0BAED0NFyigdwHaFe?rs=1&pid=ImgDetMain&o=7&rm=3", attributes: {} },
  { id: '5', name: "Petit Mil", category: "Céréales", price: 800, stock: 80, producer: "Louga Local", description: "Céréale locale riche en nutriments.", imageUrl: "https://www.afriquefemme.com/images/posts/2904/_thumb1/1111111mildongo.jpg", attributes: {} },
  { id: '6', name: "Niébé Blanc", category: "Légumes Secs", price: 950, stock: 60, producer: "Thiès", description: "Haricots locaux, parfaits pour le ndambé.", imageUrl: "https://tse3.mm.bing.net/th/id/OIP.VabmkwiDKjq6L9MmVjWVXQHaEj?rs=1&pid=ImgDetMain&o=7&rm=3", attributes: {} },
  { id: '7', name: "Manioc Frais", category: "Légumes", price: 500, stock: 120, producer: "GIE Local", description: "Tubercules de manioc fraîchement récoltés.", imageUrl: "https://th.bing.com/th/id/R.bd71b56c363110e50b18b7c78ddd11d1?rik=A0VaipD8UR4zbQ&pid=ImgRaw&r=0", attributes: {} },
  { id: '8', name: "Oignons Galmi", category: "Légumes", price: 600, stock: 200, producer: "Niayes", description: "Oignons rouges de qualité supérieure.", imageUrl: "https://tse1.mm.bing.net/th/id/OIP.hZds9E0BZwFbOcNV5bnKqAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3", attributes: {} },
  { id: '10', name: "Piments Rouges", category: "Légumes", price: 500, stock: 30, producer: "Podor", description: "Piments forts pour relever vos sauces.", imageUrl: "https://tse2.mm.bing.net/th/id/OIP.iR9pYecQiOBzLOYhzwwedAHaF6?rs=1&pid=ImgDetMain&o=7&rm=3", attributes: {} },
  { id: '11', name: "Banane Plantain", category: "Fruits", price: 1200, stock: 50, producer: "Guinée/Casamance", description: "Bananes plantains mûres à point.", imageUrl: "https://tse1.mm.bing.net/th/id/OIP.hBaMQ-O26sC3p8kSH_lw4QHaEK?rs=1&pid=ImgDetMain&o=7&rm=3", attributes: {} },
  { id: '13', name: "Pâte d'Arachide (Tigadene)", category: "Épicerie", price: 1800, stock: 40, producer: "Mbacké", description: "Pâte riche pour sauce mafé authentique.", imageUrl: "https://shop.haudecoeur.fr/medias/produitsb2b/middle_square_pate-d-arachide-seaux-4-5-kg-tantie_3276650143078.jpg", attributes: {} },
  { id: '15', name: "Bouye (Poudre de Baobab)", category: "Épicerie", price: 1500, stock: 40, producer: "Kaolack", description: "Fruit du baobab en poudre, idéal pour les jus.", imageUrl: "https://tse1.mm.bing.net/th/id/OIP.DudiltXanbmAifxOcWT_AgHaHa?rs=1&pid=ImgDetMain&o=7&rm=3", attributes: {} },
  { id: '17', name: "Soumbala (Néré)", category: "Épicerie", price: 1000, stock: 50, producer: "Kolda", description: "Condiment traditionnel à base de néré.", imageUrl: "https://tse2.mm.bing.net/th/id/OIP.qcgRLFVr58LYMgR9YNPDvwHaEK?rs=1&pid=ImgDetMain&o=7&rm=3", attributes: {} },
  { id: '18', name: "Kinkeliba Séché", category: "Fleurs & Thé", price: 1200, stock: 30, producer: "Tambacounda", description: "Feuilles de kinkeliba séchées pour infusion.", imageUrl: "https://tse3.mm.bing.net/th/id/OIP.-Lrv-_B0xlWNechq9tnm0wHaE8?rs=1&pid=ImgDetMain&o=7&rm=3", attributes: {} },
  { id: '19', name: "Ditakh Frais", category: "Fruits", price: 800, stock: 40, producer: "Fatick", description: "Fruit tropical riche en vitamine C.", imageUrl: "https://tse4.mm.bing.net/th/id/OIP.nE6M0GyzKgmk9E57PKQdsgHaH4?rs=1&pid=ImgDetMain&o=7&rm=3", attributes: {} },
  { id: '20', name: "Miel de Mangrove", category: "Miel", price: 5000, stock: 15, producer: "Delta Saloum", description: "Miel rare récolté dans les mangroves du Saloum.", imageUrl: "https://th.bing.com/th/id/R.b51480ba470412a29c43068d73e95024?rik=MC%2fjPK%2fVfMV3pQ&riu=http%3a%2f%2fwww.lemielsauvage.com%2f119-thickbox_default%2fmiel-des-mangroves.jpg&ehk=As9MoOC4NVVYnqqV9iytqyZ1DMOaJs6pMsDOLEJ06F0%3d&risl=&pid=ImgRaw&r=0", attributes: {} }
];

export function Shop() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await productService.getAll();
        if (data && data.length > 0) {
          setProducts(data);
          console.log('Produits chargés depuis Supabase:', data);
        } else {
          setProducts([]);
          console.warn('Base de données vide.');
        }
      } catch (error) {
        console.error('Failed to fetch from Supabase:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const [sortBy, setSortBy] = useState<string>('default');

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'Tous' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.producer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    return 0; // default
  });

  return (
    <div className="space-y-12">
      {/* Header Boutique */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-natural-border pb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <h1 className="text-5xl font-black text-natural-primary font-serif">Le Terroir</h1>

          </div>
          <p className="text-natural-secondary font-medium tracking-wide">Découvrez les trésors authentiques de nos régions</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-natural-secondary" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un produit..."
              className="w-full bg-white border border-natural-border pl-14 pr-6 py-4 rounded-2xl focus:ring-4 focus:ring-natural-primary/5 outline-none transition-all shadow-sm font-medium text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="relative w-full sm:w-48">
            <SlidersHorizontal className="absolute left-5 top-1/2 -translate-y-1/2 text-natural-secondary" size={18} />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-white border border-natural-border pl-14 pr-10 py-4 rounded-2xl focus:ring-4 focus:ring-natural-primary/5 outline-none transition-all shadow-sm font-medium text-sm appearance-none cursor-pointer"
            >
              <option value="default">Trier par défaut</option>
              <option value="price-asc">Prix Croissant</option>
              <option value="price-desc">Prix Décroissant</option>
              <option value="name-asc">De A à Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filtres Catégories */}
      <div className="flex items-center gap-4 overflow-x-auto pb-6 no-scrollbar">
        <button 
          onClick={() => setSelectedCategory('Tous')}
          className={cn(
            "px-8 py-3 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap",
            selectedCategory === 'Tous' 
              ? "bg-natural-primary text-white shadow-xl shadow-natural-primary/10" 
              : "bg-white text-natural-secondary border border-natural-border hover:border-natural-primary/30"
          )}
        >
          Tous les produits
        </button>
        {CATEGORIES.map((cat) => (
          <button 
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-8 py-3 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap",
              selectedCategory === cat 
                ? "bg-natural-primary text-white shadow-xl shadow-natural-primary/10" 
                : "bg-white text-natural-secondary border border-natural-border hover:border-natural-primary/30"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grille de produits */}
      <AnimatePresence mode="popLayout">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
             <Loader2 size={40} className="animate-spin text-natural-primary" />
             <p className="text-sm font-black uppercase tracking-widest text-natural-secondary">Chargement du terroir...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8"
          >
            {filteredProducts.map((p) => (
              <div key={p.id}>
                <ProductCard product={p} onSelect={() => setSelectedProduct(p)} />
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="bg-white p-12 rounded-[40px] border border-natural-border mb-8 shadow-sm">
              <PackageSearch size={64} className="text-natural-secondary/30" />
            </div>
            <h3 className="text-2xl font-bold font-serif mb-3">Aucun produit trouvé</h3>
            <p className="text-natural-secondary font-medium">L'agriculteur n'a pas encore ce produit en stock.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
}
