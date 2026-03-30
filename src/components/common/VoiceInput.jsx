import React from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { Button } from './Button';

export function VoiceInput({ onTranscript, value, onChange, placeholder = 'Speak to add notes...' }) {
  const { 
    isListening, 
    transcript, 
    error, 
    isSupported, 
    startListening, 
    stopListening,
    resetTranscript 
  } = useSpeechRecognition();

  React.useEffect(() => {
    if (transcript && onTranscript) {
      onTranscript(transcript);
    }
  }, [transcript, onTranscript]);

  if (!isSupported) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-vertical"
        />
        <button
          type="button"
          onClick={isListening ? stopListening : startListening}
          className={`
            absolute right-2 bottom-2 p-2 rounded-lg transition-all
            ${isListening 
              ? 'bg-red-100 text-red-600 animate-pulse' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }
          `}
          title={isListening ? 'Stop recording' : 'Start voice input'}
        >
          {isListening ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </button>
      </div>
      
      {isListening && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span>Listening... Speak now</span>
        </div>
      )}
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

export function VoiceButton({ onTranscript, className = '' }) {
  const { 
    isListening, 
    transcript, 
    isSupported, 
    startListening, 
    stopListening 
  } = useSpeechRecognition();

  React.useEffect(() => {
    if (transcript && onTranscript) {
      onTranscript(transcript);
    }
  }, [transcript, onTranscript]);

  if (!isSupported) {
    return null;
  }

  return (
    <Button
      type="button"
      variant={isListening ? 'danger' : 'secondary'}
      size="sm"
      leftIcon={isListening ? MicOff : Mic}
      onClick={isListening ? stopListening : startListening}
      className={className}
    >
      {isListening ? 'Stop' : 'Voice'}
    </Button>
  );
}
