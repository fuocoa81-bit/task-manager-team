export const members = [
  { id: 'federico', name: 'Federico Ramella', initials: 'FR', email: 'federico@company.it', role: 'Manager' },
  { id: 'andrea', name: 'Andrea Piloni', initials: 'AP', email: 'andrea@company.it', role: 'Lead Developer' },
];

export const COPILOT_URL = 'https://m365.cloud.microsoft/chat/?titleId=T_a5c90206-3587-b990-bf87-32710e8c4c97&source=embedded-builder';

export const initialData = {
  version: 1,
  updatedAt: new Date().toISOString(),
  tasks: [
    {
      id: 't1',
      title: 'Predisporre memo complessivo Operazione Equita',
      owner: 'Federico Ramella',
      project: 'Equita',
      due: '12 ott',
      priority: 'Alta',
      status: 'In corso',
      progress: 45,
      source: 'Email Fabio Carlozzo',
      description: 'Preparare memo con razionale, storia dell\'operazione, ruolo di Invimit e documentazione necessaria.'
    },
    {
      id: 't2',
      title: 'Verificare management contract PBSA anonimizzato',
      owner: 'Andrea Piloni',
      project: 'PBSA',
      due: '13 ott',
      priority: 'Media',
      status: 'Da fare',
      progress: 10,
      source: 'Thread PBSA',
      description: 'Verifica perimetro Manager/OpCo, struttura contrattuale e fee.'
    },
    {
      id: 't3',
      title: 'Consolidare commenti negoziali NBO Lotto 5',
      owner: 'Federico Ramella',
      project: 'NIDO',
      due: '10 ott',
      priority: 'Alta',
      status: 'Bloccata',
      progress: 65,
      source: 'Email PBSA platform',
      description: 'Consolidare timing, long stop date, parcheggi e clausole da eliminare.'
    },
    {
      id: 't4',
      title: 'Analisi competitiva mercato PBSA',
      owner: 'Andrea Piloni',
      project: 'PBSA',
      due: '15 ott',
      priority: 'Media',
      status: 'Da fare',
      progress: 0,
      source: 'Inserimento manuale',
      description: 'Raccogliere dati su competitor e trend mercato gestione immobiliare.'
    }
  ],
  suggestions: [
    {
      id: 'a1',
      sender: 'Fabio Carlozzo',
      subject: 'R: Operazione Equita/Organizzazione',
      suggestion: 'Predisporre un memo che illustri l\'operazione',
      evidence: 'Cominciamo a predisporre un piccolo memo.',
      confidence: 96,
      due: 'Da definire',
      owner: 'Federico Ramella',
      project: 'Equita'
    },
    {
      id: 'a2',
      sender: 'Andrea Cavanna',
      subject: 'R: PBSA-dettaglio servizi Gestore',
      suggestion: 'Analizzare la bozza anonimizzata del contratto',
      evidence: 'Condividere la bozza del contratto di gestione in forma anonimizzata.',
      confidence: 88,
      due: 'Da definire',
      owner: 'Andrea Piloni',
      project: 'PBSA'
    }
  ],
  investors: [
    { id: 'i1', name: 'PATRIZIA', stage: 'Dialogo attivo', owner: 'Andrea Piloni', nextAction: 'Ricevere chiarimenti sul modello di gestione', priority: 'Alta' },
    { id: 'i2', name: 'Nido Living', stage: 'Negoziazione', owner: 'Federico Ramella', nextAction: 'Consolidare commenti alla NBO', priority: 'Alta' },
    { id: 'i3', name: 'Invimit', stage: 'Analisi', owner: 'Federico Ramella', nextAction: 'Chiarire ruolo nell\'operazione', priority: 'Media' }
  ],
  projects: [
    { id: 'p1', name: 'Ex Macello Lotto 5', phase: 'NBO', owner: 'Federico Ramella', progress: 60, milestone: 'Allineamento clausole', risk: 'Medio' },
    { id: 'p2', name: 'Bovisa Goccia R12A', phase: 'Investor dialogue', owner: 'Andrea Piloni', progress: 35, milestone: 'Follow-up investitori', risk: 'Basso' },
    { id: 'p3', name: 'Torino PBSA', phase: 'Management model', owner: 'Andrea Piloni', progress: 70, milestone: 'Definizione fee', risk: 'Medio' }
  ]
};

export const statusClass = {
  'Da fare': 'bg-amber-100/80 text-amber-900 border border-amber-300/50',
  'In corso': 'bg-blue-100/80 text-blue-900 border border-blue-300/50',
  'In revisione': 'bg-violet-100/80 text-violet-900 border border-violet-300/50',
  'Bloccata': 'bg-red-100/80 text-red-900 border border-red-300/50',
  'Completata': 'bg-emerald-100/80 text-emerald-900 border border-emerald-300/50'
};

export const priorityClass = {
  'Alta': 'bg-red-100/80 text-red-900 border border-red-300/50',
  'Media': 'bg-amber-100/80 text-amber-900 border border-amber-300/50',
  'Bassa': 'bg-slate-100/80 text-slate-700 border border-slate-300/50'
};
