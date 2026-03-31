import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Toast, { showToast } from '../components/Toast';
import api from '../config/api';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';

export default function SessionRoomPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [ending, setEnding] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackTarget, setFeedbackTarget] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({ rating: 0, comment: '' });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [connected, setConnected] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const isCreator = session?.creator_id === user?.user_id;
  const isParticipant = participants.some((p) => p.user_id === user?.user_id);
  const isClosed = session?.status === 'closed';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchSessionData = useCallback(async () => {
    try {
      const [sessionRes, messagesRes] = await Promise.all([
        api.get(`/sessions/${id}`),
        api.get(`/messages/${id}`).catch(() => null),
      ]);
      setSession(sessionRes.data.session);
      setParticipants(sessionRes.data.participants);
      if (messagesRes) {
        setMessages(messagesRes.data.messages);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        showToast('Session not found.', 'error');
        navigate('/sessions');
      } else if (error.response?.status === 403) {
        showToast('You are not a participant of this session.', 'error');
        navigate('/sessions');
      } else {
        showToast('Failed to load session.', 'error');
        navigate('/sessions');
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchSessionData();
  }, [fetchSessionData]);

  useEffect(() => {
    if (!session?.session_id || isClosed || !user?.user_id) return;

    let isUnmounted = false;

    const socket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      upgrade: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      if (isUnmounted) return;
      setConnected(true);
      socket.emit('join_session', {
        session_id: session.session_id,
        user_id: user.user_id
      });
    });

    socket.on('disconnect', () => {
      if (isUnmounted) return;
      setConnected(false);
    });

    socket.on('receive_message', (message) => {
      if (isUnmounted) return;
      setMessages(prev => {
        const exists = prev.some(m => m.message_id === message.message_id);
        if (exists) return prev;
        return [...prev, message];
      });
    });

    socket.on('user_joined', ({ user_id }) => {
      if (isUnmounted) return;
      api.get(`/sessions/${session.session_id}`)
        .then(({ data }) => {
          if (isUnmounted) return;
          setParticipants(data.participants);
          setSession(data.session);
        })
        .catch(() => {});
    });

    socket.on('user_left', ({ user_id }) => {
      if (isUnmounted) return;
      setParticipants(prev =>
        prev.filter(p => p.user_id !== user_id)
      );
    });

    return () => {
      isUnmounted = true;
      socket.emit('leave_session', {
        session_id: session.session_id,
        user_id: user.user_id
      });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [session?.session_id, isClosed, user?.user_id]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    const content = messageInput.trim();

    if (!content || !socketRef.current || !connected) {
      return;
    }

    setSending(true);
    socketRef.current.emit('send_message', {
      session_id: parseInt(id, 10),
      sender_id: user.user_id,
      content,
    });
    setMessageInput('');
    inputRef.current?.focus();
    setSending(false);
  };

  const handleEndSession = async () => {
    setEnding(true);
    try {
      await api.post(`/sessions/${id}/end`);
      showToast('Session ended.');
      setShowEndModal(false);
      fetchSessionData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to end session.', 'error');
    } finally {
      setEnding(false);
    }
  };

  const handleLeaveSession = async () => {
    setLeaving(true);
    try {
      await api.post(`/sessions/${id}/leave`);
      showToast('Left session.');
      navigate('/sessions');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to leave session.', 'error');
    } finally {
      setLeaving(false);
    }
  };

  const handleOpenFeedback = (participant) => {
    if (isClosed && participant.user_id !== user.user_id) {
      setFeedbackTarget(participant);
      setFeedbackForm({ rating: 0, comment: '' });
      setShowFeedbackModal(true);
    }
  };

  const handleSubmitFeedback = async () => {
    if (feedbackForm.rating === 0) {
      showToast('Please select a rating.', 'error');
      return;
    }

    setSubmittingFeedback(true);
    try {
      await api.post('/feedback', {
        session_id: parseInt(id, 10),
        reviewed_user_id: feedbackTarget.user_id,
        rating: feedbackForm.rating,
        comment: feedbackForm.comment.trim() || undefined,
      });
      showToast('Feedback submitted.');
      setShowFeedbackModal(false);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to submit feedback.', 'error');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'open') {
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    }
    if (status === 'ongoing') {
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
    return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  };

  const ratingLabels = {
    0: 'Select a rating',
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent',
  };

  if (loading) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-950 flex flex-col overflow-hidden">
        <Navbar />
        <Toast />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-950 flex flex-col overflow-hidden">
      <Navbar />
      <Toast />

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                to="/sessions"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
              >
                ←
              </Link>

              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">{session?.topic}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusBadgeClass(session?.status)}`}>
                    {session?.status}
                  </span>
                  {!isClosed && (
                    <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                      <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`} />
                      {connected ? 'Connected' : 'Connecting...'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isCreator && !isClosed && (
                <button
                  onClick={() => setShowEndModal(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 transition"
                >
                  End Session
                </button>
              )}

              {!isCreator && !isClosed && isParticipant && (
                <button
                  onClick={handleLeaveSession}
                  disabled={leaving}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition"
                >
                  {leaving ? 'Leaving...' : 'Leave'}
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <div className="text-4xl mb-3">💬</div>
                  <p className="text-gray-400 dark:text-gray-500 text-sm">
                    {isClosed ? 'This session has ended.' : 'No messages yet. Start the conversation!'}
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                const own = msg.sender_id === user?.user_id;
                return (
                  <div key={msg.message_id} className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-xs lg:max-w-md">
                      {!own && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 px-1">
                          {msg.sender_name || `User #${msg.sender_id}`}
                        </p>
                      )}

                      <div
                        className={
                          own
                            ? 'bg-primary-600 text-white rounded-2xl rounded-br-sm px-4 py-2.5'
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-sm px-4 py-2.5'
                        }
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>

                      <p className={`text-xs mt-1 px-1 ${own ? 'text-primary-200 text-right' : 'text-gray-400 dark:text-gray-500 text-left'}`}>
                        {new Date(msg.sent_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-3">
            {isClosed ? (
              <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-2">
                This session has ended. No new messages can be sent.
              </p>
            ) : !isParticipant ? (
              <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-2">
                You are not a participant of this session.
              </p>
            ) : (
              <>
                <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                  <textarea
                    ref={inputRef}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
                    rows={1}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none text-sm max-h-32"
                    style={{ overflowY: 'auto' }}
                    disabled={!connected}
                  />
                  <button
                    type="submit"
                    disabled={!messageInput.trim() || !connected || sending}
                    className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    Send
                  </button>
                </form>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                  Press Enter to send · Shift+Enter for new line
                </p>
              </>
            )}
          </div>
        </div>

        <div className="w-72 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 overflow-y-auto hidden lg:flex flex-col">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Session Info
            </h3>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 dark:text-gray-500">Type</span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{session?.session_type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 dark:text-gray-500">Status</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusBadgeClass(session?.status)}`}>
                  {session?.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 dark:text-gray-500">Created</span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {session?.created_at ? new Date(session.created_at).toLocaleDateString() : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 dark:text-gray-500">Messages</span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{messages.length}</span>
              </div>
            </div>
          </div>

          <div className="p-4 flex-1">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Participants ({participants.length})
            </h3>

            {participants.map((p) => (
              <div
                key={p.user_id}
                className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-xs font-bold text-primary-700 dark:text-primary-300 shrink-0">
                    {(p.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white flex items-center gap-1">
                      {p.name}
                      {p.user_id === user?.user_id && <span className="text-primary-500">(You)</span>}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {p.participant_role === 'creator' ? '👑 Creator' : '👤 Participant'}
                    </p>
                  </div>
                </div>

                {isClosed && p.user_id !== user?.user_id && (
                  <button
                    onClick={() => handleOpenFeedback(p)}
                    className="text-xs px-2 py-1 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition"
                  >
                    Rate
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
            <div className="text-4xl mb-4">🏁</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">End this session?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              This will close the session for all participants. You&apos;ll earn 10 contribution points.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowEndModal(false)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleEndSession}
                disabled={ending}
                className="px-5 py-2.5 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-60"
              >
                {ending ? 'Ending...' : 'End Session'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showFeedbackModal && feedbackTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Rate {feedbackTarget?.name}</h3>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl"
              >
                ×
              </button>
            </div>

            <div className="flex gap-2 justify-center my-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFeedbackForm((prev) => ({ ...prev, rating: star }))}
                  className="text-3xl transition hover:scale-110"
                >
                  {star <= feedbackForm.rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">{ratingLabels[feedbackForm.rating]}</p>

            <textarea
              placeholder="Leave a comment (optional)"
              rows={3}
              value={feedbackForm.comment}
              onChange={(e) => setFeedbackForm((prev) => ({ ...prev, comment: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none"
            />

            <div className="flex gap-3 justify-end mt-4">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFeedback}
                disabled={submittingFeedback || feedbackForm.rating === 0}
                className="px-5 py-2.5 rounded-lg text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white transition disabled:opacity-60"
              >
                {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
