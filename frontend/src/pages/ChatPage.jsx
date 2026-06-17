import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiMessageSquare, FiSend, FiArrowLeft, FiPackage, FiCheck, FiCheckCircle } from 'react-icons/fi';
import { chatService } from '../services';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { getImageUrl } from '../utils/helpers';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

export default function ChatPage() {
  const { conversationId: paramConvId } = useParams();
  const { user } = useAuth();
  const { socket, joinChat, leaveChat, emitTyping, emitStopTyping, setUnreadChat, refreshUnreadCount } = useSocket();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(paramConvId || null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(null);
  const [mobileShowChat, setMobileShowChat] = useState(!!paramConvId);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const res = await chatService.getConversations();
      setConversations(res.data || []);
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConvId) return;
    let cancelled = false;

    const fetchMessages = async () => {
      setMsgLoading(true);
      try {
        const res = await chatService.getMessages(activeConvId);
        if (!cancelled) setMessages(res.data || []);
      } catch {
        if (!cancelled) setMessages([]);
      } finally {
        if (!cancelled) setMsgLoading(false);
      }
    };

    fetchMessages();
    joinChat(activeConvId);
    refreshUnreadCount();

    return () => {
      cancelled = true;
      leaveChat(activeConvId);
    };
  }, [activeConvId, joinChat, leaveChat, refreshUnreadCount]);

  // Listen for real-time messages
  useEffect(() => {
    if (!socket || !activeConvId) return;

    const handleMessage = (msg) => {
      if (msg.conversationId === activeConvId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        setTyping(null);
      }
      // Refresh conversations sidebar to update last message
      fetchConversations();
    };

    const handleTyping = ({ conversationId, userName, userId }) => {
      if (conversationId === activeConvId && userId !== user?.id) {
        setTyping(userName);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTyping(null), 3000);
      }
    };

    const handleStopTyping = ({ conversationId, userId }) => {
      if (conversationId === activeConvId && userId !== user?.id) {
        setTyping(null);
      }
    };

    socket.on('chat:message', handleMessage);
    socket.on('chat:typing', handleTyping);
    socket.on('chat:stop-typing', handleStopTyping);

    return () => {
      socket.off('chat:message', handleMessage);
      socket.off('chat:typing', handleTyping);
      socket.off('chat:stop-typing', handleStopTyping);
    };
  }, [socket, activeConvId, user?.id, fetchConversations]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConvId || sending) return;

    setSending(true);
    const content = newMessage.trim();
    setNewMessage('');
    emitStopTyping(activeConvId);

    try {
      await chatService.sendMessage(activeConvId, content);
    } catch {
      toast.error('Failed to send message');
      setNewMessage(content);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (activeConvId) {
      emitTyping(activeConvId);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => emitStopTyping(activeConvId), 2000);
    }
  };

  const selectConversation = (convId) => {
    setActiveConvId(convId);
    setMobileShowChat(true);
    navigate(`/chat/${convId}`, { replace: true });
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);
  const otherUser = activeConv
    ? (user?.id === activeConv.buyerId ? activeConv.farmer : activeConv.buyer)
    : null;

  const getOtherUser = (conv) => user?.id === conv.buyerId ? conv.farmer : conv.buyer;

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (loading) return <Loader text="Loading chats..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 8rem)' }}>
        <div className="flex h-full">

          {/* Conversations List */}
          <div className={`w-full md:w-80 lg:w-96 border-r border-gray-100 dark:border-gray-800 flex flex-col ${mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
            {/* List header */}
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FiMessageSquare size={20} className="text-emerald-500" /> Messages
              </h2>
            </div>

            {/* Conversation items */}
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                    <FiMessageSquare className="text-gray-400" size={24} />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No conversations yet</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Start a chat from any crop's detail page</p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const other = getOtherUser(conv);
                  const isActive = conv.id === activeConvId;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => selectConversation(conv.id)}
                      className={`w-full text-left px-4 py-3.5 flex items-start gap-3 border-b border-gray-50 dark:border-gray-800/50 transition-colors ${
                        isActive
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/30'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/40'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                        {other?.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-semibold truncate ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                            {other?.name}
                          </p>
                          {conv.lastMessage && (
                            <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
                              {formatTime(conv.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        {conv.crop && (
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-500 font-medium flex items-center gap-1 mt-0.5">
                            <FiPackage size={9} /> {conv.crop.cropName}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {conv.lastMessage
                              ? `${conv.lastMessage.senderId === user?.id ? 'You: ' : ''}${conv.lastMessage.content}`
                              : 'No messages yet'}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="ml-2 flex-shrink-0 w-5 h-5 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                              {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${!mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
            {activeConvId && activeConv ? (
              <>
                {/* Chat header */}
                <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                  <button
                    onClick={() => { setMobileShowChat(false); setActiveConvId(null); navigate('/chat', { replace: true }); }}
                    className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                  >
                    <FiArrowLeft size={18} />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {otherUser?.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{otherUser?.name}</p>
                    {activeConv.crop && (
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <FiPackage size={10} /> {activeConv.crop.cropName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50/50 dark:bg-gray-950/50">
                  {msgLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <span className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <p className="text-gray-400 text-sm">No messages yet. Say hello! 👋</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isOwn = msg.senderId === user?.id;
                      return (
                        <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                            isOwn
                              ? 'bg-emerald-600 text-white rounded-br-md'
                              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700 rounded-bl-md'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                            <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? 'text-emerald-200' : 'text-gray-400'}`}>
                              <span className="text-[10px]">{formatTime(msg.createdAt)}</span>
                              {isOwn && (
                                msg.isRead
                                  ? <FiCheckCircle size={10} />
                                  : <FiCheck size={10} />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  {typing && (
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-md px-4 py-2.5">
                        <p className="text-xs text-gray-500 italic">{typing} is typing...</p>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message input */}
                <form onSubmit={handleSend} className="px-5 py-3.5 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={handleInputChange}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 border-0 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                  >
                    <FiSend size={16} />
                  </button>
                </form>
              </>
            ) : (
              /* No conversation selected */
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950 dark:to-teal-950 flex items-center justify-center mb-5 shadow-inner">
                  <FiMessageSquare className="text-emerald-500" size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Your Messages</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                  Select a conversation or start chatting with a farmer from any crop's detail page
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
