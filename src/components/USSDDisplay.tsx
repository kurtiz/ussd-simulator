import { useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Monitor, X, Trash2, Clock, User, Smartphone } from 'lucide-react';
import { USSDSession } from './USSDSimulator';
import { format } from 'date-fns';

interface USSDDisplayProps {
  session: USSDSession | null;
  isLoading: boolean;
  onEndSession: () => void;
  onClearSession: () => void;
}

export function USSDDisplay({ session, isLoading, onEndSession, onClearSession }: USSDDisplayProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages]);
  const formatTime = (date: Date) => {
    return format(date, 'HH:mm:ss');
  };

  return (
    <Card className="border-slate-600 h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            USSD Display
          </CardTitle>
          <div className="flex items-center gap-2">
            {session && (
              <Badge variant={session.isActive ? "default" : "secondary"}>
                {session.isActive ? 'Active' : 'Ended'}
              </Badge>
            )}
            {session && (
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEndSession}
                  disabled={!session.isActive}
                >
                  <X className="w-3 h-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearSession}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-muted rounded-lg border border-slate-600 h-80">
          {!session ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Monitor className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No active session</p>
                <p className="text-sm">Dial a USSD code to start</p>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-full p-4">
              <div className="space-y-3">
                {/* Session info */}
                <div className="flex items-center justify-between text-xs mb-4 pb-2 border-b border-slate-700">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Started: {formatTime(session.startTime)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-3 h-3" />
                    Session: {session.id.slice(-6)}
                  </div>
                </div>

                {/* Messages */}
                {session?.messages.map((message, index) => (
                  <div key={message.id} ref={index === session.messages.length - 1 ? messagesEndRef : null}>
                    <div className="space-y-2">
                      <div className={`flex ${message.type === 'request' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-3 py-2 rounded-lg ${
                          message.type === 'request' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-slate-700 text-slate-100'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex items-center gap-1 text-xs opacity-75">
                              {message.type === 'request' ? (
                                <User className="w-3 h-3" />
                              ) : (
                                <Smartphone className="w-3 h-3" />
                              )}
                              {formatTime(message.timestamp)}
                            </div>
                          </div>
                          <p className="whitespace-pre-wrap font-mono text-sm">
                            {message.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-700 text-slate-100 max-w-xs px-3 py-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="animate-pulse flex space-x-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <span className="text-xs">Processing...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
        
        {session && session.messages.length > 0 && (
          <div className="mt-3 text-xs text-slate-400 flex justify-between">
            <span>{session.messages.length} messages</span>
            <span>Last activity: {formatTime(session.messages[session.messages.length - 1]?.timestamp)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}