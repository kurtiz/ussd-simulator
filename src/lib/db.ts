import Dexie, { type Table } from 'dexie';

export interface USSDSession {
  id: string;
  name: string;
  phoneNumber: string;
  messages: Array<{
    id: string;
    content: string;
    timestamp: Date;
    direction: 'incoming' | 'outgoing';
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class USSDDatabase extends Dexie {
  sessions!: Table<USSDSession, string>;

  constructor() {
    super('USSD_Simulator_DB');
    
    this.version(1).stores({
      sessions: 'id, name, phoneNumber, isActive, createdAt, updatedAt'
    });
  }
}

export const db = new USSDDatabase();

// Helper functions
export const getAllSessions = async (): Promise<USSDSession[]> => {
  return db.sessions.toArray();
};

export const getSession = async (id: string): Promise<USSDSession | undefined> => {
  return db.sessions.get(id);
};

export const saveSession = async (session: USSDSession): Promise<string> => {
  await db.sessions.put(session);
  return session.id;
};

export const deleteSession = async (id: string): Promise<void> => {
  await db.sessions.delete(id);
};

export const clearSessions = async (): Promise<void> => {
  await db.sessions.clear();
};
