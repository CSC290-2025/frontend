import { useState, useEffect, useRef } from 'react';
import { Send, User, CornerUpLeft, Siren } from 'lucide-react';
import { Input } from '@/features/emergency/components/ui/input';
import { Button } from '@/features/emergency/components/ui/button';
import { Card, CardContent } from '@/features/emergency/components/ui/card';

interface Message {
  id: string;
  sender: 'user' | 'admin';
  text: string;
  timestamp: Date;
}

export default function AdminChatPage() {
  const CHANNEL_NAME = 'emergency_chat_channel';

  const channelRef = useRef<BroadcastChannel | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');

  const urlParams = new URLSearchParams(window.location.search);
  const currentRole = urlParams.get('role') === 'admin' ? 'admin' : 'user';

  useEffect(() => {
    channelRef.current = new BroadcastChannel(CHANNEL_NAME);

    channelRef.current.onmessage = (event) => {
      const incomingMsg = event.data;
      incomingMsg.timestamp = new Date(incomingMsg.timestamp);
      setMessages((prev) => [...prev, incomingMsg]);
    };

    return () => {
      if (channelRef.current) {
        channelRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: currentRole,
      text: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);

    if (channelRef.current) {
      channelRef.current.postMessage(newMessage);
    }

    setInputMessage('');
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    const isMe = message.sender === currentRole;
    const alignmentClass = isMe ? 'justify-end' : 'justify-start';

    const IconComponent = message.sender === 'user' ? User : Siren;
    const iconBgColor = isMe ? 'bg-red-400' : 'bg-gray-400';

    return (
      <div className={`flex ${alignmentClass} mb-4`}>
        {!isMe && (
          <div
            className={`mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${iconBgColor} text-white`}
          >
            <IconComponent className="h-4 w-4" />
          </div>
        )}

        <div
          className={`max-w-[80%] rounded-lg p-3 shadow-md ${
            isMe ? 'bg-red-400 text-white' : 'bg-gray-200 text-gray-800'
          } ${isMe ? 'rounded-br-none' : 'rounded-tl-none'}`}
        >
          <p className="text-sm break-words">{message.text}</p>
          <span
            className={`mt-1 block text-xs ${
              isMe ? 'text-red-200' : 'text-gray-500'
            } text-right`}
          >
            {formatTime(message.timestamp)}
          </span>
        </div>

        {isMe && (
          <div
            className={`ml-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${iconBgColor} text-white`}
          >
            <IconComponent className="h-4 w-4" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen max-h-screen flex-col p-2 sm:p-6">
      <header className="mb-4 flex flex-shrink-0 items-center gap-2 border-b pb-4">
        <Button
          size="icon"
          variant="ghost"
          className="mr-2"
          onClick={() => (window.location.href = '/sos')}
        >
          <CornerUpLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">
            Chat ({currentRole === 'admin' ? 'Admin View' : 'User View'})
          </h1>
        </div>
      </header>

      <div className="mb-4 flex-grow overflow-y-auto">
        <Card className="h-full border-none shadow-none">
          <CardContent className="pt-6 pb-0">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-auto flex flex-shrink-0 items-center gap-3">
        <Input
          type="text"
          placeholder="Type your message here..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
          className="flex-grow"
        />
        <Button
          onClick={handleSendMessage}
          className="bg-red-400 text-white hover:bg-red-400"
          disabled={inputMessage.trim() === ''}
        >
          <Send className="mr-1 h-5 w-5" />
          Send
        </Button>
      </div>
    </div>
  );
}
