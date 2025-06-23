interface City {
    id: string;
    name: string;
  }

export const CITIES: City[] = [
    { id: '1', name: 'Anderlecht' },
    { id: '2', name: 'Auderghem' },
    { id: '3', name: 'Berchem-Sainte-Agathe' },
    { id: '4', name: 'Bruxelles' },
    { id: '5', name: 'Etterbeek' },
    { id: '6', name: 'Evere' },
    { id: '7', name: 'Forest' },
    { id: '8', name: 'Ganshoren' },
    { id: '9', name: 'Ixelles' },
    { id: '10', name: 'Jette' },
    { id: '11', name: 'Koekelberg' },
    { id: '12', name: 'Molenbeek-Saint-Jean' },
    { id: '13', name: 'Saint-Gilles' },
    { id: '14', name: 'Saint-Josse-ten-Noode' },
    { id: '15', name: 'Schaerbeek' },
    { id: '16', name: 'Uccle' },
    { id: '17', name: 'Watermael-Boitsfort' },
    { id: '18', name: 'Woluwe-Saint-Lambert' },
    { id: '19', name: 'Woluwe-Saint-Pierre' },
  ];

  export const COUNTRIES = [
    { label: '🇧🇪 Belgique', value: 'Belgique' },
    { label: '🇹🇳 Tunisie', value: 'Tunisie' },
  ];
  
  export const COMMUNES_BY_COUNTRY: Record<string, string[]> = {
    Belgique: [
      'Anderlecht', 'Auderghem', 'Berchem-Sainte-Agathe', 'Bruxelles', 'Etterbeek',
      'Evere', 'Forest', 'Ganshoren', 'Ixelles', 'Jette', 'Koekelberg', 'Molenbeek-Saint-Jean',
      'Saint-Gilles', 'Saint-Josse-ten-Noode', 'Schaerbeek', 'Uccle', 'Watermael-Boitsfort',
      'Woluwe-Saint-Lambert', 'Woluwe-Saint-Pierre'
    ],
    Tunisie: [
      'Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte', 'Gabès', 'Ariana', 'Gafsa', 'Monastir', 'Ben Arous'
    ]
  };