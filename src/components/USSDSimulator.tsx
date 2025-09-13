import { useState, useEffect } from 'react';
import { PhoneDialer } from './PhoneDialer';
import { ConfigPanel } from './ConfigPanel';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { History, Trash2, Clock, Search } from 'lucide-react';
import { format } from 'date-fns';
import { USSDDisplay } from './USSDDisplay';
import { Input } from './ui/input';
import Dexie from 'dexie';

// Create a Dexie instance with proper typing
class USSDSimulatorDatabase extends Dexie {
  sessions: Dexie.Table<USSDSession, string>;

  constructor() {
    super('USSDSimulatorDB');
    
    this.version(1).stores({
      sessions: 'id, messages, isActive, startTime, updatedAt, phoneNumber, networkCode',
    });
    
    // Initialize the sessions table with proper typing
    this.sessions = this.table('sessions');
  }
}

const db = new USSDSimulatorDatabase();

export interface USSDConfig {
  endpoint: string;
  sessionId: string;
  phoneNumber: string;
  networkCode: '001';
  timeout: 30000
};

export interface USSDSession {
  id: string;
  messages: USSDMessage[];
  isActive: boolean;
  startTime: Date;
  updatedAt?: Date;
  phoneNumber?: string;
  networkCode?: string;
}

export interface USSDMessage {
  id: string;
  type: 'request' | 'response';
  text: string;
  timestamp: Date;
  sessionId: string;
}

const defaultConfig: USSDConfig = {
  endpoint: '',
  sessionId: '',
  phoneNumber: '+1234567890',
  networkCode: '001',
  timeout: 30000
};

export function USSDSimulator() {
  const [config, setConfig] = useState<USSDConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<USSDSession | null>(null);
  const [sessions, setSessions] = useState<USSDSession[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // Load sessions on component mount
  useEffect(() => {
    const initializeSessions = async () => {
      try {
        // Load sessions but don't set current session
        await loadSessions();
        // Ensure we start with a fresh session
        setCurrentSession(null);
      } catch (error) {
        setDbError('Failed to initialize database. Session history will not be saved.');
        console.error('Database error:', error);
      }
    };
    
    initializeSessions();
  }, []);

  const loadSessions = async () => {
    if (isLoading) return [];
    
    setIsLoading(true);
    try {
      const savedSessions = await db.sessions.toArray();
      
      // Sort sessions by updatedAt (newest first)
      const sortedSessions = (savedSessions || []).sort((a, b) => {
        const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return timeB - timeA;
      });
      
      setSessions(sortedSessions);
      return sortedSessions;
    } catch (error) {
      console.error('Failed to load sessions:', error);
      setDbError('Failed to load session history. Please refresh the page to try again.');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const handleUSSDRequest = async (input: string) => {
    if (!config.endpoint) {
      return;
    }

    setIsLoading(true);

    // Create new session if none exists
    let updatedSession: USSDSession | null = currentSession;
    const isNewSession = !currentSession?.messages?.length;
    
    if (!updatedSession) {
      const newSessionId = Date.now().toString();
      updatedSession = {
        id: newSessionId,
        messages: [],
        isActive: true,
        startTime: new Date(),
        updatedAt: new Date(),
        phoneNumber: config.phoneNumber,
        networkCode: config.networkCode
      };
      setCurrentSession(updatedSession);
    }

    // Add request message
    const requestMessage: USSDMessage = {
      id: Date.now().toString(),
      type: 'request',
      text: input,
      timestamp: new Date(),
      sessionId: updatedSession.id
    };

    updatedSession = {
      ...updatedSession,
      messages: [...updatedSession.messages, requestMessage],
      updatedAt: new Date()
    };
    setCurrentSession(updatedSession);
    await db.sessions.put(updatedSession);

    try {
      // Prepare the request payload according to the expected format
      const payload = {
        sessionID: updatedSession.id,
        userID: config.phoneNumber,
        newSession: isNewSession,
        msisdn: config.phoneNumber,
        userData: input
      };

      // Make the actual API call
      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();

      // Create response message from API response
      const responseMessage: USSDMessage = {
        id: (Date.now() + 1).toString(),
        type: 'response',
        text: responseData.response || responseData.message || 'No response message',
        timestamp: new Date(),
        sessionId: updatedSession.id
      };

      // Create updated session with response
      const updatedSessionWithResponse = {
        ...updatedSession,
        messages: [...updatedSession.messages, responseMessage],
        isActive: responseData.continueSession !== false, // Default to true if not specified
        updatedAt: new Date()
      };

      // Update both state and database
      setCurrentSession(updatedSessionWithResponse);
      await db.sessions.put(updatedSessionWithResponse);
      
      // Reload sessions to ensure UI is up to date
      await loadSessions();

    } catch (error) {
      console.error('Error in USSD request:', error);
      
      if (!updatedSession) {
        console.error('No session available to update with error');
        return;
      }

      const errorMessage: USSDMessage = {
        id: (Date.now() + 1).toString(),
        type: 'response',
        text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        timestamp: new Date(),
        sessionId: updatedSession.id
      };

      const updatedSessionWithError = {
        ...updatedSession,
        messages: [...updatedSession.messages, errorMessage],
        isActive: false,
        updatedAt: new Date()
      };

      setCurrentSession(updatedSessionWithError);
      await db.sessions.put(updatedSessionWithError);
    } finally {
      setIsLoading(false);
    }
  };


  const loadSession = async (session: USSDSession) => {
    setCurrentSession(session);
    setShowHistory(false);
  };

  const toggleHistory = async () => {
    const willShowHistory = !showHistory;
    setShowHistory(willShowHistory);
    
    if (willShowHistory) {
      // If we're showing the history, refresh the sessions
      await loadSessions(false); // Don't set current session when loading for history panel
    }
  };

  const handleEndSession = async () => {
    if (!currentSession) return;
    
    try {
      const updatedSession = {
        ...currentSession,
        isActive: false,
        updatedAt: new Date()
      };
      
      setCurrentSession(updatedSession);
      await db.sessions.put(updatedSession);
      await loadSessions();
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  const handleNewSession = () => {
    // Clear the current session to show the dialer
    setCurrentSession(null);
  };

  const handleClearSession = async () => {
    if (!currentSession) return;
    
    try {
      await db.sessions.delete(currentSession.id);
      setCurrentSession(null);
      await loadSessions();
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await db.sessions.delete(sessionId);
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
      }
      await loadSessions();
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 h-full">
      {dbError && (
        <div className="col-span-full bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
          <p className="font-bold">Warning</p>
          <p>{dbError}</p>
        </div>
      )}
      <div className="flex flex-col gap-4 col-span-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Sessions</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleHistory}
            className="flex items-center gap-1"
          >
            <History className="w-4 h-4" />
            {showHistory ? 'Hide History' : 'Show History'}
          </Button>
        </div>
        {showHistory ? (
          <Card className="flex-1 p-4 overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search sessions..."
                className="flex-1 bg-transparent border-muted outline-none text-sm"
              />
            </div>
            <ScrollArea className="h-[calc(100%-40px)] pr-2">
              <div className="space-y-2">
                {sessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No saved sessions
                  </p>
                ) : (
                  [...sessions]
                    .sort((a, b) =>
                      new Date(b.updatedAt || b.startTime).getTime() -
                      new Date(a.updatedAt || a.startTime).getTime()
                    )
                    .map(session => (
                      <div
                        key={session.id}
                        onClick={() => loadSession(session)}
                        className={`p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors ${currentSession?.id === session.id ? 'bg-accent' : ''
                          }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">
                              {session.messages[0]?.text?.substring(0, 20) || 'New Session'}
                              {session.messages[0]?.text?.length > 20 ? '...' : ''}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <Clock className="w-3 h-3" />
                              {format(new Date(session.updatedAt || session.startTime), 'MMM d, yyyy HH:mm')}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => handleDeleteSession(session.id, e)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {session.messages.length} message{session.messages.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </ScrollArea>
          </Card>
        ) : (
          <>
            <PhoneDialer
              onDial={handleUSSDRequest}
              disabled={isLoading}
              isSessionActive={!!currentSession?.messages.length}
            />

          </>
        )}
      </div>
      <div className="col-span-2">
        <USSDDisplay 
          session={currentSession} 
          isLoading={isLoading}
          onEndSession={handleEndSession}
          onClearSession={handleClearSession}
          onNewSession={handleNewSession}
        />
      </div>

      <div className="col-span-2">
        <ConfigPanel
          config={config}
          onConfigChange={setConfig}
          session={currentSession}
        />
      </div>
    </div>
  );
}