export interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  telephone: string;
  role: 'PATIENT' | 'AGENT' | 'MEDECIN' | 'ADMIN';
  active: boolean;
  createdAt: string;
  // Doctor fields
  specialite?: string;
  numeroOrdre?: string;
  joursTravail?: string;
  heureDebut?: string;
  heureFin?: string;
  fileAttenteId?: number;
  fileAttenteNom?: string;
  disponible?: boolean;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  userId: number;
  email: string;
  nom: string;
  prenom: string;
  role: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  telephone: string;
  role: string;
}

export interface Ticket {
  id: number;
  numeroTicket: string;
  statut: TicketStatus;
  priorite: string;
  scoreTotal: number;
  motif: string;
  estUrgence: boolean;
  positionActuelle: number;
  tempsAttenteEstime: number;
  heureCreation: string;
  patientNom: string;
  patientPrenom: string;
  medecinNom: string;
  medecinJoursTravail?: string;
  medecinHeureDebut?: string;
  medecinHeureFin?: string;
  fileAttenteNom: string;
  scoreNoShow: number;
}

export type TicketStatus = 'CREATED' | 'WAITING' | 'PRESENT' | 'READY' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface FileAttente {
  id: number;
  nom: string;
  type: string;
  actif: boolean;
  capaciteMax: number;
  nombreTicketsEnAttente: number;
  tempsAttenteEstime: number;
}

export interface Message {
  id: number;
  contenu: string;
  expediteurNom: string;
  statut: string;
  dateEnvoi: string;
}

export interface Conversation {
  id: number;
  participants: string[];
  dernierMessage: string;
  nonLus: number;
}

export interface Notification {
  id: number;
  type: string;
  titre: string;
  contenu: string;
  lue: boolean;
  dateCreation: string;
  ticketId: number;
}

export interface Consultation {
  id: number;
  symptomes: string;
  diagnostic: string;
  traitement: string;
  examens: string;
  dateDebut: string;
  dateFin: string;
  dureeReelle: number;
  medecinNom: string;
  patientNom: string;
}

export interface Feedback {
  id: number;
  noteGlobale: number;
  noteAttenteTemps: number;
  noteAccueil: number;
  noteMedecin: number;
  noteProprete: number;
  commentaire: string;
  recommande: boolean;
  anonyme: boolean;
  modere: boolean;
  dateCreation: string;
}

export interface FeedbackRequest {
  ticketId: number;
  noteGlobale: number;
  noteAttenteTemps: number;
  noteAccueil: number;
  noteMedecin: number;
  noteProprete: number;
  commentaire: string;
  recommande: boolean;
  anonyme: boolean;
}

export interface StatsDashboard {
  ticketsActifs: number;
  ticketsAujourdhui: number;
  tauxOccupation: number;
  tempsAttenteMoyen: number;
  medecinsDisponibles: number;
  tauxNoShow: number;
  tauxSatisfaction: number;
  // Agent KPI fields
  enAttente: number;
  enCours: number;
  absences: number;
  satisfaction: number;
}

export interface ReglePriorisation {
  id: number;
  nom: string;
  description: string;
  critere: string;
  valeurSeuil: number;
  scoreAjoute: number;
  actif: boolean;
  ordreApplication: number;
}

export interface ParametreSysteme {
  id: number;
  cle: string;
  valeur: string;
  description: string;
}
