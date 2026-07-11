import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Mic, Send, X, Bot, Sparkles, GripHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChat } from '@/hooks/useChat';
interface AssistantProps {
    diseaseName: string;
    cropName: string;
}

interface Message {
    id: number;
    role: 'user' | 'ai';
    text: string;
}

const CropAssistant: React.FC<AssistantProps> = ({ diseaseName, cropName }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [inputText, setInputText] = useState('');
    const [isListening, setIsListening] = useState(false);
    
    // Instead of local state, use the global chat hook but start a fresh conversation 
    // implicitly or we can just use the local state + backend API directly, 
    // but the hook is easier. We will use the hook and manually set the initial message.
    const { messages, isTyping, sendMessage, setMessages } = useChat();

    // Set initial message if empty
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{
                role: 'ai',
                content: `I see ${diseaseName} on your ${cropName}. Is there anything else unusual happening with the plant?`
            }]);
        }
    }, [messages.length, diseaseName, cropName, setMessages]);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isExpanded) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isExpanded, isTyping]);

    // Voice Recognition Logic
    useEffect(() => {
        let recognition: any;
        if (isListening) {
            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = false;
                recognition.lang = 'en-US';

                recognition.onstart = () => {
                    // console.log("Voice started");
                };

                recognition.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    setInputText((prev) => (prev ? prev + ' ' + transcript : transcript));
                    setIsListening(false);
                };

                recognition.onerror = (event: any) => {
                    console.error("Speech error", event);
                    setIsListening(false);
                };

                recognition.onend = () => {
                    setIsListening(false);
                };

                recognition.start();
            } else {
                alert("Voice input is not supported in this browser.");
                setIsListening(false);
            }
        }
        return () => {
            if (recognition) recognition.stop();
        };
    }, [isListening]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const currentQuery = inputText;
        setInputText('');
        
        // The backend automatically injects the user's most recent scans 
        // into the AI's context, but for brand-new unsaved scans, we pass it explicitly.
        await sendMessage(currentQuery, undefined, { cropName, diseaseName });
    };

    return (
        <motion.div
            animate={{ height: isExpanded ? 'auto' : '64px' }}
            initial={false}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="mt-8 bg-[#1a1f1c] rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl relative"
        >
            {/* Header / Drag Handle */}
            <div
                className="flex justify-between items-center px-6 py-4 border-b border-white/5 bg-black/20 cursor-pointer active:bg-black/40 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
                        <Bot size={16} className="text-green-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm leading-tight flex items-center gap-2">
                            Dr. Crop AI
                            {!isExpanded && <span className="text-[10px] font-normal text-muted-foreground">(Tap to expand)</span>}
                        </h3>
                    </div>
                </div>

                {/* Drag Handle Icon */}
                <div className="absolute left-1/2 top-2 -translate-x-1/2 w-12 h-1 bg-white/10 rounded-full" />

                <div className={cn("transition-transform duration-300", isExpanded ? "rotate-180" : "rotate-0")}>
                    <GripHorizontal className="text-white/20 w-5 h-5" />
                </div>
            </div>

            {/* Content Container (Collapsible) */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col"
                    >
                        {/* Chat Area */}
                        <div className="h-[350px] overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={cn("flex", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                                    <div className={cn(
                                        "max-w-[85%] p-4 rounded-2xl text-[14px] leading-relaxed shadow-sm",
                                        msg.role === 'user'
                                            ? 'bg-green-600 text-white rounded-br-none font-medium'
                                            : 'bg-[#2a302c] text-gray-200 rounded-bl-none border border-white/5'
                                    )}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-[#2a302c] border border-white/5 px-4 py-3 rounded-2xl rounded-bl-none flex gap-1.5 items-center">
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150" />
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-300" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-black/20 border-t border-white/5">
                            <div className="flex items-center gap-2 bg-[#2a302c] p-1.5 pr-2 rounded-full border border-white/10 focus-within:border-green-500/50 transition-all shadow-inner">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder="Ask a question..."
                                    className="flex-1 bg-transparent text-white px-4 focus:outline-none text-sm placeholder-gray-500 h-10 min-w-0"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                />

                                <button
                                    onClick={() => setIsListening(!isListening)}
                                    className={cn(
                                        "p-2 rounded-full transition-all flex-shrink-0",
                                        isListening ? 'bg-red-500/20 text-red-500 scale-110' : 'text-gray-400 hover:text-white'
                                    )}
                                >
                                    <Mic size={18} className={cn(isListening && 'animate-pulse')} />
                                </button>

                                <button
                                    onClick={handleSend}
                                    disabled={!inputText.trim()}
                                    className="p-2 bg-green-600 rounded-full text-white hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-900/20 transition-transform active:scale-95 flex-shrink-0"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default CropAssistant;
