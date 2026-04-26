-- ==========================================
-- SCRIPT DE MISE À JOUR TERROIR LOCAL
-- Collez ce contenu dans l'éditeur SQL de Supabase
-- ==========================================

-- 1. Création de la table des Produits
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  stock INTEGER DEFAULT 50,
  producer TEXT,
  description TEXT,
  "imageUrl" TEXT,
  attributes JSONB DEFAULT '{}',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Création de la table des Commandes
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_amount NUMERIC NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  neighborhood TEXT,
  shipping_method TEXT NOT NULL, -- standard, express, pickup
  instructions TEXT,
  payment_method TEXT NOT NULL, -- wave, om, free, card
  status TEXT DEFAULT 'confirmed' NOT NULL, -- confirmed, processing, shipped, delivered
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Création de la table des Items de Commande
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC NOT NULL
);

-- 4. Nettoyage et mise à jour complète du catalogue
DELETE FROM products;

INSERT INTO products (id, name, category, price, stock, producer, description, "imageUrl") VALUES
('1', 'Bissap Rouge', 'Fleurs & Thé', 1500, 50, 'Coop Kaolack', 'Fleurs de bissap séchées de première qualité.', 'https://th.bing.com/th/id/R.c0d3c7c4aae4eb38ecde0925bcb60d14?rik=Mtswoo8p%2fYTAzg&pid=ImgRaw&r=0'),
('2', 'Huile d''Arachide Pure', 'Épicerie', 1200, 100, 'Terroir Pure', 'Huile pressée à froid, 100% naturelle.', 'https://shop.haudecoeur.fr/medias/produitsb2b/middle_square_pate-d-arachide-seaux-4-5-kg-tantie_3276650143078.jpg'),
('3', 'Mangues Kent', 'Fruits', 1200, 30, 'Casamance', 'Mangues Kent savoureuses et sucrées.', 'https://th.bing.com/th/id/R.21ecfd0af49f46faa8fc7a786b6369e6?rik=WJlxcQ%2bnt9vHLQ&pid=ImgRaw&r=0'),
('4', 'Guedj Kong (Fumé)', 'Mer', 2500, 20, 'Saly Portudal', 'Poisson fumé traditionnel pour vos plats.', 'https://tse3.mm.bing.net/th/id/OIP.hGgrzmLvu0BAED0NFyigdwHaFe?rs=1&pid=ImgDetMain&o=7&rm=3'),
('5', 'Petit Mil', 'Céréales', 800, 80, 'Louga Local', 'Céréale locale riche en nutriments.', 'https://www.afriquefemme.com/images/posts/2904/_thumb1/1111111mildongo.jpg'),
('6', 'Niébé Blanc', 'Légumes Secs', 950, 60, 'Thiès', 'Haricots locaux, parfaits pour le ndambé.', 'https://tse3.mm.bing.net/th/id/OIP.VabmkwiDKjq6L9MmVjWVXQHaEj?rs=1&pid=ImgDetMain&o=7&rm=3'),
('7', 'Manioc Frais', 'Légumes', 500, 120, 'GIE Local', 'Tubercules de manioc fraîchement récoltés.', 'https://th.bing.com/th/id/R.bd71b56c363110e50b18b7c78ddd11d1?rik=A0VaipD8UR4zbQ&pid=ImgRaw&r=0'),
('8', 'Oignons Galmi', 'Légumes', 600, 200, 'Niayes', 'Oignons rouges de qualité supérieure.', 'https://tse1.mm.bing.net/th/id/OIP.hZds9E0BZwFbOcNV5bnKqAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3'),
('10', 'Piments Rouges', 'Légumes', 500, 30, 'Podor', 'Piments forts pour relever vos sauces.', 'https://tse2.mm.bing.net/th/id/OIP.iR9pYecQiOBzLOYhzwwedAHaF6?rs=1&pid=ImgDetMain&o=7&rm=3'),
('11', 'Banane Plantain', 'Fruits', 1200, 50, 'Guinée/Casamance', 'Bananes plantains mûres à point.', 'https://tse1.mm.bing.net/th/id/OIP.hBaMQ-O26sC3p8kSH_lw4QHaEK?rs=1&pid=ImgDetMain&o=7&rm=3'),
('13', 'Pâte d''Arachide (Tigadene)', 'Épicerie', 1800, 40, 'Mbacké', 'Pâte riche pour sauce mafé authentique.', 'https://shop.haudecoeur.fr/medias/produitsb2b/middle_square_pate-d-arachide-seaux-4-5-kg-tantie_3276650143078.jpg'),
('15', 'Bouye (Poudre de Baobab)', 'Épicerie', 1500, 40, 'Kaolack', 'Fruit du baobab en poudre, idéal pour les jus.', 'https://tse1.mm.bing.net/th/id/OIP.DudiltXanbmAifxOcWT_AgHaHa?rs=1&pid=ImgDetMain&o=7&rm=3'),
('17', 'Soumbala (Néré)', 'Épicerie', 1000, 50, 'Kolda', 'Condiment traditionnel à base de néré.', 'https://tse2.mm.bing.net/th/id/OIP.qcgRLFVr58LYMgR9YNPDvwHaEK?rs=1&pid=ImgDetMain&o=7&rm=3'),
('18', 'Kinkeliba Séché', 'Fleurs & Thé', 1200, 30, 'Tambacounda', 'Feuilles de kinkeliba séchées pour infusion.', 'https://tse3.mm.bing.net/th/id/OIP.-Lrv-_B0xlWNechq9tnm0wHaE8?rs=1&pid=ImgDetMain&o=7&rm=3'),
('19', 'Ditakh Frais', 'Fruits', 800, 40, 'Fatick', 'Fruit tropical riche en vitamine C.', 'https://tse4.mm.bing.net/th/id/OIP.nE6M0GyzKgmk9E57PKQdsgHaH4?rs=1&pid=ImgDetMain&o=7&rm=3'),
('20', 'Miel de Mangrove', 'Miel', 5000, 15, 'Delta Saloum', 'Miel rare récolté dans les mangroves du Saloum.', 'https://th.bing.com/th/id/R.b51480ba470412a29c43068d73e95024?rik=MC%2fjPK%2fVfMV3pQ&riu=http%3a%2f%2fwww.lemielsauvage.com%2f119-thickbox_default%2fmiel-des-mangroves.jpg&ehk=As9MoOC4NVVYnqqV9iytqyZ1DMOaJs6pMsDOLEJ06F0%3d&risl=&pid=ImgRaw&r=0');

-- 5. Sécurité (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-only access to products" ON products;
CREATE POLICY "Allow public read-only access to products" ON products FOR SELECT USING (true);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anyone to insert orders" ON orders;
CREATE POLICY "Allow anyone to insert orders" ON orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() IS NOT NULL AND email = auth.jwt()->>'email');

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anyone to insert order items" ON order_items;
CREATE POLICY "Allow anyone to insert order items" ON order_items FOR INSERT WITH CHECK (true);
