import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Settings, RotateCcw, Globe, Phone, Hash, Clock } from 'lucide-react';
import { USSDConfig, USSDSession } from './USSDSimulator';

interface ConfigPanelProps {
  config: USSDConfig;
  onConfigChange: (config: USSDConfig) => void;
  session: USSDSession | null;
}

export function ConfigPanel({ config, onConfigChange, session }: ConfigPanelProps) {
  const handleConfigChange = (field: keyof USSDConfig, value: string | number) => {
    onConfigChange({
      ...config,
      [field]: value
    });
  };

  const resetConfig = () => {
    onConfigChange({
      endpoint: 'http://localhost:8000/ussd',
      sessionId: '',
      phoneNumber: '+1234567890',
      networkCode: '001',
      timeout: 30000
    });
  };

  const generateSessionId = () => {
    const sessionId = 'USSD-' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    handleConfigChange('sessionId', sessionId);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="endpoint" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              USSD Endpoint
            </Label>
            <Input
              id="endpoint"
              value={config.endpoint}
              onChange={(e) => handleConfigChange('endpoint', e.target.value)}
              placeholder="https://your-ussd-gateway.com/ussd"
              className="bg-muted border-slate-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sessionId" className="flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Session ID
            </Label>
            <div className="flex gap-2">
              <Input
                id="sessionId"
                value={config.sessionId}
                onChange={(e) => handleConfigChange('sessionId', e.target.value)}
                placeholder="Auto-generated if empty"
                className="bg-muted border-slate-400"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={generateSessionId}
                className="bg-muted border-slate-400 hover:bg-primary hover:text-white"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number
            </Label>
            <Input
              id="phoneNumber"
              value={config.phoneNumber}
              onChange={(e) => handleConfigChange('phoneNumber', e.target.value)}
              placeholder="+1234567890"
              className="bg-muted border-slate-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="networkCode">Network Code</Label>
            <Input
              id="networkCode"
              value={config.networkCode}
              onChange={(e) => handleConfigChange('networkCode', e.target.value)}
              placeholder="001"
              className="bg-muted border-slate-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeout" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Timeout (ms)
            </Label>
            <Input
              id="timeout"
              type="number"
              value={config.timeout}
              onChange={(e) => handleConfigChange('timeout', parseInt(e.target.value))}
              placeholder="30000"
              className="bg-muted border-slate-400"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetConfig}
              className="bg-muted border-slate-400 hover:bg-primary hover:text-white"
            >
              <RotateCcw className="w-3 h-3 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Session Status */}
      <Card className="">
        <CardHeader>
          <CardTitle className="">Session Status</CardTitle>
        </CardHeader>
        <CardContent>
          {session ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={session.isActive ? "default" : "secondary"}>
                  {session.isActive ? 'Active' : 'Ended'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Messages:</span>
                <Badge variant="outline" className="bg-muted">
                  {session.messages.length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <Badge variant="outline" className="bg-muted">
                  {Math.round((Date.now() - session.startTime.getTime()) / 1000)}s
                </Badge>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No active session</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleConfigChange('endpoint', 'http://localhost:8000/ussd')}
              className="bg-muted text-muted-foreground text-xs"
            >
              Local Dev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleConfigChange('endpoint', 'https://api.example.com/ussd')}
              className="bg-muted text-muted-foreground text-xs"
            >
              Production
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}