import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Phone, PhoneCall, Delete } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

interface PhoneDialerProps {
  onDial: (input: string) => Promise<void>;
  disabled: boolean;
  isSessionActive?: boolean;
}

export function PhoneDialer({ onDial, disabled, isSessionActive = false }: PhoneDialerProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleKeyPress = (key: string) => {
    if (key === 'clear') {
      setInput('');
    } else if (key === 'backspace') {
      setInput(prev => prev.slice(0, -1));
    } else {
      setInput(prev => prev + key);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setIsLoading(true);
      try {
        await onDial(input);
        setInput('');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCall = async () => {
    if (input.trim()) {
      setIsLoading(true);
      try {
        await onDial(input);
        setInput('');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const keypadButtons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#']
  ];

  return (
    <Card className="border-slate-600">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5" />
          Phone Dialer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Display */}
        <form onSubmit={handleSubmit}>
          <div className="bg-secondary rounded-lg p-4 min-h-[60px] border border-slate-600">
            <Input
              value={input}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCall();
                }
              }}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isSessionActive ? "Enter response..." : "Dial USSD code (e.g., *123#)"}
              className="bg-transparent shadow-none border-none text-lg font-mono focus-visible:ring-0"
              disabled={disabled}
            />
          </div>
        </form>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2">
          {keypadButtons.map((row) => (
            row.map((key) => (
              <Button
                key={key}
                variant="outline"
                className="h-12 bg-secondary hover:bg-primary hover:text-white border-slate-400 font-semibold text-lg"
                onClick={() => handleKeyPress(key)}
                disabled={isLoading}
              >
                {key}
              </Button>
            ))
          ))}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <Button
            variant="outline"
            className="h-12 bg-red-400 text-white hover:bg-red-500 hover:text-white"
            onClick={() => handleKeyPress('backspace')}
            disabled={isLoading}
          >
            <Delete className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            className="h-12 bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
            onClick={() => handleKeyPress('clear')}
            disabled={isLoading}
          >
            Clear
          </Button>
        </div>

        {/* Call/Send button */}
        <Button
          type="button"
          className="w-full h-12 bg-primary text-white font-semibold"
          onClick={handleCall}
          disabled={!input.trim() || disabled || isLoading}
        >
          <PhoneCall className="w-4 h-4 mr-2" />
          {isLoading ? 'Sending...' : isSessionActive ? 'Send' : 'Dial'}
        </Button>
      </CardContent>
    </Card>
  );
}