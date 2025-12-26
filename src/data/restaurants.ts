export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  popular?: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  categories: string[];
  featured?: boolean;
  address: string;
  menu: MenuItem[];
}

export const categories = [
  { id: 'all', name: 'Wszystko', icon: '🍽️' },
  { id: 'polish', name: 'Polska', icon: '🥟' },
  { id: 'pizza', name: 'Pizza', icon: '🍕' },
  { id: 'kebab', name: 'Kebab', icon: '🥙' },
  { id: 'burgers', name: 'Burgery', icon: '🍔' },
  { id: 'asian', name: 'Azjatycka', icon: '🍜' },
  { id: 'desserts', name: 'Desery', icon: '🍰' },
];

export const restaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Karczma Góralska',
    description: 'Tradycyjna kuchnia góralska i regionalne specjały',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop',
    rating: 4.8,
    reviewCount: 234,
    deliveryTime: '30-45 min',
    deliveryFee: 5,
    minOrder: 30,
    categories: ['polish'],
    featured: true,
    address: 'ul. Główna 15, Rabka-Zdrój',
    menu: [
      {
        id: 'm1',
        name: 'Pierogi z Oscypkiem',
        description: 'Domowe pierogi z wędzonym oscypkiem i skwarkami',
        price: 28,
        category: 'Dania główne',
        popular: true,
      },
      {
        id: 'm2',
        name: 'Żurek Góralski',
        description: 'Tradycyjny żurek z białą kiełbasą i jajkiem',
        price: 18,
        category: 'Zupy',
        popular: true,
      },
      {
        id: 'm3',
        name: 'Kotlet Schabowy',
        description: 'Klasyczny schabowy z ziemniakami i kapustą',
        price: 35,
        category: 'Dania główne',
      },
      {
        id: 'm4',
        name: 'Kwaśnica',
        description: 'Góralska zupa z kiszonej kapusty z żeberkami',
        price: 16,
        category: 'Zupy',
      },
    ],
  },
  {
    id: '2',
    name: 'Pizzeria Napoli',
    description: 'Autentyczna włoska pizza pieczona w piecu opalanym drewnem',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop',
    rating: 4.6,
    reviewCount: 189,
    deliveryTime: '25-40 min',
    deliveryFee: 4,
    minOrder: 25,
    categories: ['pizza'],
    featured: true,
    address: 'ul. Orkana 8, Rabka-Zdrój',
    menu: [
      {
        id: 'p1',
        name: 'Margherita',
        description: 'Sos pomidorowy, mozzarella, świeża bazylia',
        price: 26,
        category: 'Pizza',
        popular: true,
      },
      {
        id: 'p2',
        name: 'Quattro Formaggi',
        description: 'Cztery sery: mozzarella, gorgonzola, parmezan, ricotta',
        price: 34,
        category: 'Pizza',
      },
      {
        id: 'p3',
        name: 'Diavola',
        description: 'Sos pomidorowy, mozzarella, pikantne salami',
        price: 32,
        category: 'Pizza',
        popular: true,
      },
    ],
  },
  {
    id: '3',
    name: 'Kebab Sultan',
    description: 'Najlepszy kebab w regionie z świeżych składników',
    image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800&auto=format&fit=crop',
    rating: 4.5,
    reviewCount: 312,
    deliveryTime: '20-30 min',
    deliveryFee: 3,
    minOrder: 20,
    categories: ['kebab'],
    address: 'ul. Podhalańska 22, Rabka-Zdrój',
    menu: [
      {
        id: 'k1',
        name: 'Kebab Duży',
        description: 'Mięso z rożna, świeże warzywa, sosy do wyboru',
        price: 24,
        category: 'Kebab',
        popular: true,
      },
      {
        id: 'k2',
        name: 'Kebab na Talerzu',
        description: 'Mięso, frytki, sałatka, sosy',
        price: 28,
        category: 'Kebab',
      },
      {
        id: 'k3',
        name: 'Falafel Wrap',
        description: 'Wegański wrap z falafelem i hummusem',
        price: 22,
        category: 'Wegetariańskie',
      },
    ],
  },
  {
    id: '4',
    name: 'Burger House',
    description: 'Craft burgery z lokalnego mięsa',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop',
    rating: 4.7,
    reviewCount: 156,
    deliveryTime: '25-35 min',
    deliveryFee: 5,
    minOrder: 30,
    categories: ['burgers'],
    featured: true,
    address: 'ul. Słoneczna 5, Rabka-Zdrój',
    menu: [
      {
        id: 'b1',
        name: 'Classic Burger',
        description: 'Wołowina, ser cheddar, sałata, pomidor, cebula',
        price: 28,
        category: 'Burgery',
        popular: true,
      },
      {
        id: 'b2',
        name: 'Góralski Burger',
        description: 'Wołowina, oscypek, boczek, żurawina',
        price: 35,
        category: 'Burgery',
        popular: true,
      },
      {
        id: 'b3',
        name: 'Frytki Belgijskie',
        description: 'Duża porcja frytek z sosem',
        price: 14,
        category: 'Dodatki',
      },
    ],
  },
  {
    id: '5',
    name: 'Wok & Roll',
    description: 'Kuchnia azjatycka - sushi, pho, stir-fry',
    image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=800&auto=format&fit=crop',
    rating: 4.4,
    reviewCount: 98,
    deliveryTime: '35-50 min',
    deliveryFee: 6,
    minOrder: 40,
    categories: ['asian'],
    address: 'ul. Parkowa 12, Rabka-Zdrój',
    menu: [
      {
        id: 'a1',
        name: 'Pad Thai',
        description: 'Makaron ryżowy z krewetkami, tofu, orzeszkami',
        price: 38,
        category: 'Makarony',
        popular: true,
      },
      {
        id: 'a2',
        name: 'Pho Bo',
        description: 'Wietnamska zupa z wołowiną i makaronem',
        price: 32,
        category: 'Zupy',
      },
      {
        id: 'a3',
        name: 'Sushi Mix 12szt',
        description: 'Zestaw 12 kawałków sushi',
        price: 48,
        category: 'Sushi',
        popular: true,
      },
    ],
  },
  {
    id: '6',
    name: 'Cukiernia Malina',
    description: 'Domowe ciasta, torty i słodkości',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop',
    rating: 4.9,
    reviewCount: 267,
    deliveryTime: '20-30 min',
    deliveryFee: 4,
    minOrder: 20,
    categories: ['desserts'],
    address: 'ul. Zdrojowa 3, Rabka-Zdrój',
    menu: [
      {
        id: 'd1',
        name: 'Sernik Tradycyjny',
        description: 'Domowy sernik na kruchym spodzie',
        price: 14,
        category: 'Ciasta',
        popular: true,
      },
      {
        id: 'd2',
        name: 'Szarlotka',
        description: 'Ciasto z jabłkami i cynamonem',
        price: 12,
        category: 'Ciasta',
        popular: true,
      },
      {
        id: 'd3',
        name: 'Pączki (3szt)',
        description: 'Świeże pączki z różnymi nadzieniami',
        price: 10,
        category: 'Wypieki',
      },
    ],
  },
];
