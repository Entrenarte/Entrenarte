'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export default function ChatBox({ currentUserId, otherUserId, currentUserName, otherUserName, isGroupChat = false }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const containerRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const fetchMessages = async () => {
            let query = supabase
                .from('messages')
                .select(`
                    id, content, created_at, sender_id, receiver_id,
                    profiles:sender_id (first_name, last_name)
                `)
                .order('created_at', { ascending: true });

            if (isGroupChat) {
                query = query.is('receiver_id', null);
            } else {
                query = query.or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`);
            }

            const { data } = await query;
            if (data) setMessages(data);
        };

        fetchMessages();

        // Realtime subscription
        const channel = supabase
            .channel(isGroupChat ? 'group-chat' : `chat-${currentUserId}-${otherUserId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                },
                (payload) => {
                    const msg = payload.new;
                    // Filter messages for this conversation
                    if (isGroupChat && msg.receiver_id === null) {
                        // Fetch the profile info for the sender
                        supabase.from('profiles').select('first_name, last_name').eq('id', msg.sender_id).single().then(({ data: profile }) => {
                            setMessages(prev => [...prev, { ...msg, profiles: profile }]);
                        });
                    } else if (!isGroupChat && (
                        (msg.sender_id === currentUserId && msg.receiver_id === otherUserId) ||
                        (msg.sender_id === otherUserId && msg.receiver_id === currentUserId)
                    )) {
                        supabase.from('profiles').select('first_name, last_name').eq('id', msg.sender_id).single().then(({ data: profile }) => {
                            setMessages(prev => [...prev, { ...msg, profiles: profile }]);
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUserId, otherUserId, isGroupChat]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        const msgData = {
            sender_id: currentUserId,
            receiver_id: isGroupChat ? null : otherUserId,
            content: newMessage.trim(),
        };

        const { error } = await supabase.from('messages').insert([msgData]);

        if (!error) {
            setNewMessage('');
            // Also create a notification for the receiver (if 1-to-1)
            if (!isGroupChat && otherUserId) {
                await supabase.from('notifications').insert([{
                    user_id: otherUserId,
                    type: 'new_message',
                    title: 'Nuevo mensaje',
                    body: `${currentUserName} te envió un mensaje`,
                    metadata: { sender_id: currentUserId }
                }]);
            }
        }
        setSending(false);
    };

    const formatTime = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });
    };

    // Group messages by date
    let lastDate = null;

    return (
        <div className="flex flex-col h-[450px] border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
            {/* Header */}
            <div className="bg-[#0f4c81] text-white px-4 py-3 flex items-center gap-3 shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-300/30 flex items-center justify-center text-sm font-bold">
                    {isGroupChat ? '👥' : (otherUserName?.[0] || '?')}
                </div>
                <div>
                    <p className="font-medium text-sm">{isGroupChat ? 'Chat Grupal' : otherUserName}</p>
                    <p className="text-[11px] text-blue-200">{isGroupChat ? 'Todos los participantes' : 'Conversación privada'}</p>
                </div>
            </div>

            {/* Messages area */}
            <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-1">
                {messages.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-400 text-sm">No hay mensajes todavía. ¡Escribí el primero!</p>
                    </div>
                )}
                {messages.map((msg, i) => {
                    const isOwn = msg.sender_id === currentUserId;
                    const msgDate = formatDate(msg.created_at);
                    let showDate = false;
                    if (msgDate !== lastDate) {
                        showDate = true;
                        lastDate = msgDate;
                    }

                    return (
                        <div key={msg.id || i}>
                            {showDate && (
                                <div className="flex justify-center my-3">
                                    <span className="bg-gray-200 text-gray-500 text-[11px] px-3 py-1 rounded-full">{msgDate}</span>
                                </div>
                            )}
                            <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}>
                                <div className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${isOwn
                                    ? 'bg-[#0f4c81] text-white rounded-br-md'
                                    : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                                    }`}>
                                    {(isGroupChat && !isOwn) && (
                                        <p className="text-[11px] font-semibold mb-0.5 text-blue-300">
                                            {msg.profiles?.first_name} {msg.profiles?.last_name}
                                        </p>
                                    )}
                                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                                    <p className={`text-[10px] mt-1 text-right ${isOwn ? 'text-blue-200' : 'text-gray-400'}`}>
                                        {formatTime(msg.created_at)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <form onSubmit={handleSend} className="shrink-0 border-t border-gray-200 bg-white p-3 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribí un mensaje..."
                    className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#0f4c81] focus:ring-1 focus:ring-[#0f4c81] transition-colors"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="bg-[#0f4c81] text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#0a355c] disabled:opacity-40 transition-colors shrink-0"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </form>
        </div>
    );
}
