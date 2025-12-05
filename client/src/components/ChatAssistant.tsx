import { motion } from 'framer-motion';
import { FormEvent, useState } from 'react';

interface Message {
  id: string;
  from: 'user' | 'bot';
  text: string;
}

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      from: 'bot',
      text: 'Hi! I will guide you through study plans once the Ollama endpoint is plugged in. For now, drop me quick questions.'
    }
  ]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);

  const genId = () => (crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) return;
    const userMessage: Message = { id: genId(), from: 'user', text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setPending(true);

    // Placeholder response until the assistant endpoint is wired.
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: genId(),
          from: 'bot',
          text: 'Assistant endpoint `/api/assistant/messages` pending. This is a stubbed response summarizing what will happen once connected.'
        }
      ]);
      setPending(false);
    }, 700);
  };

  return (
    <div className={`chat-assistant ${isOpen ? 'open' : ''}`}>
      {isOpen && (
        <motion.div className="chat-panel" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }}>
          <header>
            <strong>Study Copilot</strong>
            <button type="button" onClick={() => setIsOpen(false)}>
              <i className="fa-solid fa-xmark" />
            </button>
          </header>
          <div className="chat-feed">
            {messages.map((message) => (
              <div key={message.id} className={`chat-bubble ${message.from}`}>
                <p>{message.text}</p>
              </div>
            ))}
            {pending && <div className="chat-bubble bot"><p>Thinking…</p></div>}
          </div>
          <form className="chat-input" onSubmit={handleSend}>
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask for a plan or hint" />
            <button type="submit" className="primary" disabled={!input.trim()}>
              Send
            </button>
          </form>
        </motion.div>
      )}
      <button type="button" className="chat-toggle" onClick={() => setIsOpen((prev) => !prev)}>
        <i className="fa-solid fa-robot" /> {isOpen ? 'Close guide' : 'Need guidance?'}
      </button>
    </div>
  );
};

export default ChatAssistant;
