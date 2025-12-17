import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '@/features/emergency/types/incident.ts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Send, Lock, MessageSquare, Zap, User, Shield } from 'lucide-react';
import { cannedResponses } from '@/features/emergency/data/mockData.ts';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';

interface ChatPanelProps {
  messages: ChatMessage[];
  incidentId: string;
  onSendMessage: (message: string, isInternal: boolean) => void;
}

export function ChatPanel({
  messages,
  incidentId,
  onSendMessage,
}: ChatPanelProps) {
  const [message, setMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [showCanned, setShowCanned] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message, isInternal);
      setMessage('');
    }
  };

  const handleCannedSelect = (text: string) => {
    setMessage(text);
    setShowCanned(false);
  };

  return (
    <div className="flex h-full flex-col border-l border-slate-200 bg-slate-50">
      {/* 1. Header with Mode Toggle */}
      <div className="z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div className="hidden sm:block">
            <h3 className="text-sm font-semibold text-slate-800">Live Chat</h3>
            <p className="text-[10px] font-medium text-slate-500">
              Ticket #{incidentId}
            </p>
          </div>
        </div>

        {/* Toggle Internal/Public */}
        <div className="flex rounded-lg bg-slate-100 p-1 text-xs font-medium">
          <button
            onClick={() => setIsInternal(false)}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-all',
              !isInternal
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <User className="h-3 w-3" />
            Public
          </button>
          <button
            onClick={() => setIsInternal(true)}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-all',
              isInternal
                ? 'bg-amber-100 text-amber-700 shadow-sm ring-1 ring-amber-200'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <Lock className="h-3 w-3" />
            Internal
          </button>
        </div>
      </div>

      {/* 2. Messages List */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-slate-400">
            <MessageSquare className="mb-2 h-8 w-8 opacity-50" />
            <p className="text-sm">No messages yet.</p>
            <p className="text-xs">Start the conversation or add a note.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderType === 'admin';
            return (
              <div
                key={msg.id}
                className={cn(
                  'flex max-w-[85%] flex-col',
                  isMe ? 'ml-auto items-end' : 'mr-auto items-start'
                )}
              >
                {/* Message Bubble */}
                <div
                  className={cn(
                    'relative px-4 py-3 text-sm shadow-sm',
                    isMe
                      ? msg.isInternal
                        ? 'rounded-2xl rounded-tr-sm border border-amber-200 bg-amber-50 text-amber-900' // Internal Style
                        : 'rounded-2xl rounded-tr-sm bg-blue-600 text-white' // Public Admin Style
                      : 'rounded-2xl rounded-tl-sm border border-slate-200 bg-white text-slate-800' // User Style
                  )}
                >
                  {/* Internal Icon Indicator */}
                  {msg.isInternal && (
                    <div className="mb-1 flex items-center gap-1 text-[10px] font-bold tracking-wider text-amber-600 uppercase opacity-80">
                      <Lock className="h-3 w-3" />
                      Internal Note
                    </div>
                  )}

                  <p className="leading-relaxed break-words whitespace-pre-wrap">
                    {msg.message}
                  </p>
                </div>

                {/* Metadata */}
                <span className="mt-1 px-1 text-[10px] text-slate-400">
                  {isMe ? (msg.isInternal ? 'You (Internal)' : 'You') : 'User'}{' '}
                  •{' '}
                  {formatDistanceToNow(msg.createdAt, {
                    addSuffix: true,
                    locale: enUS,
                  })}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* 3. Input Area */}
      <div
        className={cn(
          'border-t border-slate-200 p-4 transition-colors duration-300',
          isInternal ? 'bg-amber-50/50' : 'bg-white'
        )}
      >
        {/* Quick Actions Bar */}
        <div className="no-scrollbar mb-3 flex items-center gap-2 overflow-x-auto pb-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCanned(!showCanned)}
            className={cn(
              'h-7 shrink-0 rounded-full border px-3 text-xs transition-colors',
              showCanned
                ? 'border-indigo-200 bg-indigo-100 text-indigo-700'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            )}
          >
            <Zap className="mr-1.5 h-3 w-3" />
            Quick Replies
          </Button>

          {showCanned &&
            cannedResponses.map((text, i) => (
              <button
                key={i}
                onClick={() => handleCannedSelect(text)}
                className="h-7 rounded-full border border-slate-200 bg-white px-3 text-xs whitespace-nowrap text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                {text.slice(0, 20)}...
              </button>
            ))}
        </div>

        {/* Text Input */}
        <div className="flex items-end gap-2">
          <div className="relative flex-1">
            {/* Visual indicator for Internal Mode inside input */}
            {isInternal && (
              <div className="absolute -top-6 left-0 flex items-center gap-1 text-[10px] font-bold text-amber-600">
                <Shield className="h-3 w-3" />
                INTERNAL NOTE MODE ACTIVE
              </div>
            )}

            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                isInternal ? 'Add a private note...' : 'Type a message...'
              }
              onKeyDown={(e) =>
                e.key === 'Enter' && !e.shiftKey && handleSend()
              }
              className={cn(
                'min-h-[44px] rounded-xl pr-10 shadow-sm transition-all',
                isInternal
                  ? 'border-amber-300 bg-white focus-visible:ring-amber-200'
                  : 'border-slate-200 bg-slate-50 focus:bg-white focus-visible:ring-blue-100'
              )}
            />
          </div>

          <Button
            onClick={handleSend}
            disabled={!message.trim()}
            className={cn(
              'h-11 w-11 shrink-0 rounded-xl shadow-sm transition-all',
              isInternal
                ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            )}
          >
            <Send className={cn('h-5 w-5', !message.trim() && 'opacity-50')} />
          </Button>
        </div>
      </div>
    </div>
  );
}
