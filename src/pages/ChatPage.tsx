import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Search, ArrowLeft } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Avatar } from '../components/Avatar';
import { supabase, Profile, Message } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const ChatPage = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<(Message & { sender: Profile })[]>([]);
  const [messageContent, setMessageContent] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, profile } = useAuth();

  useEffect(() => {
    fetchUsers();
    fetchUnreadCounts();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages();
      setShowChatOnMobile(true);
      const subscription = supabase
        .channel('messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
          },
          (payload) => {
            const newMessage = payload.new as Message;
            if (
              (newMessage.sender_id === selectedUser.id && newMessage.receiver_id === user?.id) ||
              (newMessage.sender_id === user?.id && newMessage.receiver_id === selectedUser.id)
            ) {
              fetchMessages();
            }
            fetchUnreadCounts();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (searchQuery) {
      setFilteredUsers(
        users.filter((u) =>
          u.username.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', user?.id || '')
      .order('username');

    if (data) {
      setUsers(data);
      setFilteredUsers(data);
    }
  };

  const fetchMessages = async () => {
    if (!user || !selectedUser) return;

    const { data } = await supabase
      .from('messages')
      .select('*, sender:profiles!messages_sender_id_fkey(*)')
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${user.id})`
      )
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data as any);
      markMessagesAsRead();
    }
  };

  const fetchUnreadCounts = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('messages')
      .select('sender_id, read')
      .eq('receiver_id', user.id)
      .eq('read', false);

    if (!error && data) {
      const counts: Record<string, number> = {};
      data.forEach((msg) => {
        counts[msg.sender_id] = (counts[msg.sender_id] || 0) + 1;
      });
      setUnreadCounts(counts);
    }
  };

  const markMessagesAsRead = async () => {
    if (!user || !selectedUser) return;

    await supabase
      .from('messages')
      .update({ read: true })
      .eq('receiver_id', user.id)
      .eq('sender_id', selectedUser.id)
      .eq('read', false);

    fetchUnreadCounts();
  };

  const sendMessage = async () => {
    if (!user || !selectedUser || (!messageContent.trim() && !fileUrl)) return;

    await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: selectedUser.id,
      content: messageContent,
      file_url: fileUrl,
    });

    setMessageContent('');
    setFileUrl('');
    fetchMessages();
    fetchUnreadCounts();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleUserSelect = (selectedUser: Profile) => {
    setSelectedUser(selectedUser);
    setShowChatOnMobile(true);
  };

  const handleBackToUsers = () => {
    setShowChatOnMobile(false);
    setSelectedUser(null);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex md:gap-4">
      <Card className={`w-full md:w-80 flex-shrink-0 flex flex-col p-0 overflow-hidden ${
        showChatOnMobile ? 'hidden md:flex' : 'flex'
      }`}>
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredUsers.map((u) => {
            const unread = unreadCounts[u.id] || 0;
            return (
              <div
                key={u.id}
                onClick={() => handleUserSelect(u)}
                className={`flex items-center gap-3 p-4 cursor-pointer relative transition-colors ${
                  selectedUser?.id === u.id
                    ? 'bg-blue-50 md:border-l-4 border-blue-700'
                    : 'hover:bg-gray-50'
                }`}
              >
                <Avatar src={u.avatar_url} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{u.username}</p>
                  <p className="text-xs text-gray-500 capitalize">{u.role}</p>
                </div>
                {unread > 0 && (
                  <span className="bg-green-600 text-white text-xs font-semibold rounded-full px-2 py-0.5">
                    {unread}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <Card className={`w-full md:flex-1 flex flex-col p-0 overflow-hidden ${
        !showChatOnMobile ? 'hidden md:flex' : 'flex'
      }`}>
        {selectedUser ? (
          <>
            <div className="p-4 border-b flex items-center gap-3">
              <button
                onClick={handleBackToUsers}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors -ml-2"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <Avatar src={selectedUser.avatar_url} size="md" />
              <div>
                <h3 className="font-semibold text-gray-900">{selectedUser.username}</h3>
                <p className="text-sm text-gray-500 capitalize">{selectedUser.role}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
                const isOwnMessage = message.sender_id === user?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar src={message.sender.avatar_url} size="sm" />
                    <div
                      className={`max-w-[70%] ${
                        isOwnMessage ? 'items-end' : 'items-start'
                      } flex flex-col`}
                    >
                      <p
                        className={`text-xs text-gray-500 mb-1 ${
                          isOwnMessage ? 'text-right' : 'text-left'
                        }`}
                      >
                        {message.sender.username}
                      </p>
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          isOwnMessage
                            ? 'bg-blue-700 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {message.content && <p className="break-words">{message.content}</p>}
                        {message.file_url && (
                          <a
                            href={message.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-sm underline block mt-1 ${
                              isOwnMessage ? 'text-blue-100' : 'text-blue-700'
                            }`}
                          >
                            View attachment
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t">
              {fileUrl && (
                <div className="mb-2 p-2 bg-blue-50 rounded-lg flex items-center justify-between">
                  <p className="text-sm text-blue-700 truncate flex-1">{fileUrl}</p>
                  <button
                    onClick={() => setFileUrl('')}
                    className="text-red-600 text-sm ml-2"
                  >
                    Remove
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const url = prompt('Enter file URL:');
                    if (url) setFileUrl(url);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Paperclip className="w-5 h-5 text-gray-600" />
                </button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button
                  variant="primary"
                  onClick={sendMessage}
                  disabled={!messageContent.trim() && !fileUrl}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-4">
              <p className="text-gray-500 text-lg mb-2">Select a user to start chatting</p>
              <p className="text-gray-400 text-sm hidden md:block">Choose from the list on the left</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
