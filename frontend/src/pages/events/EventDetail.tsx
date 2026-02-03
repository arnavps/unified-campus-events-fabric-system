import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { Event } from '../../services/event.service';
import { getEventById } from '../../services/event.service';
import { registerForEvent, getMyRegistrations } from '../../services/registration.service';
import type { Registration } from '../../services/registration.service';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, MapPin, User, ArrowLeft, Clock, AlertCircle, Plus, Megaphone } from 'lucide-react';
import { format } from 'date-fns';
import FeedbackForm from '../../components/feedback/FeedbackForm';
import AnnouncementList from '../../components/events/AnnouncementList';
import { createAnnouncement } from '../../services/announcement.service';
import { getCurrentPosition } from '../../utils/geolocation';
import { markAttendance } from '../../services/attendance.service';

export default function EventDetail() {
    const { id } = useParams<{ id: string }>();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [registration, setRegistration] = useState<Registration | null>(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    // Announcement State
    const [showAnnounceModal, setShowAnnounceModal] = useState(false);
    const [announceTitle, setAnnounceTitle] = useState('');
    const [announceMessage, setAnnounceMessage] = useState('');
    const [sendEmail, setSendEmail] = useState(false);
    const [announcing, setAnnouncing] = useState(false);
    const [checkingIn, setCheckingIn] = useState(false);

    const handleCheckIn = async () => {
        setCheckingIn(true);
        try {
            let lat, lon;
            // Check if geofence is enabled for this event (we might need to check eventType or a specific field if we exposed it to frontend logic, 
            // but for now we'll just try to get location if it's a physical event or always if we want to support it).
            // The backend checks attendanceMethod.
            // Let's safe bet: Get location if browser supports it.
            try {
                const pos = await getCurrentPosition();
                lat = pos.coords.latitude;
                lon = pos.coords.longitude;
            } catch (e) {
                console.warn('Location not retrieved', e);
                // Continue, backend might accept it if not GEOFENCE method, or reject if it is.
            }

            await markAttendance(event!.id, 'PRESENT', lat, lon);
            alert('Checked In Successfully!');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Check-in failed');
        } finally {
            setCheckingIn(false);
        }
    };

    useEffect(() => {
        if (!id) return;
        const fetchEvent = async () => {
            try {
                const data = await getEventById(id);
                setEvent(data);

                if (isAuthenticated && user?.role === 'STUDENT') {
                    try {
                        const regs = await getMyRegistrations();
                        const reg = regs.find((r: Registration) => r.eventId === id);
                        setRegistration(reg || null);
                    } catch (e) {
                        console.error('Failed to fetch registration status', e);
                    }
                }
            } catch (err) {
                setError('Failed to load event details.');
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id, isAuthenticated, user]);

    const handleRegister = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (!event) return;

        if (!confirm(`Are you sure you want to register for ${event.title}?`)) return;

        setRegistering(true);
        try {
            await registerForEvent(event.id);
            alert('Successfully registered!');
            const regs = await getMyRegistrations();
            const reg = regs.find((r: Registration) => r.eventId === event.id);
            setRegistration(reg || null);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Registration failed');
        } finally {
            setRegistering(false);
        }
    };

    const handleCreateAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!event) return;
        setAnnouncing(true);
        try {
            await createAnnouncement({
                eventId: event.id,
                title: announceTitle,
                message: announceMessage,
                priority: 'NORMAL',
                sendToRegistered: sendEmail
            });
            alert('Announcement posted!');
            setShowAnnounceModal(false);
            setAnnounceTitle('');
            setAnnounceMessage('');
            // Optional: Refresh list (implementation detail: AnnouncementList fetches on mount/prop change. 
            // We could trigger a key change or context update, but a simple reload or "it will just appear next time" is fine for MVP.
            // Actually, let's force a reload of the component by changing a key if we wrapped it, but here we can just accept it appears on refresh.
            // Better UX: Reload page or window.location.reload()
            window.location.reload();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to post announcement');
        } finally {
            setAnnouncing(false);
        }
    }

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (error || !event) return <div className="p-8 text-center text-red-500">{error || 'Event not found'}</div>;

    const isEventEnded = new Date(event.endDateTime) < new Date();
    const isOrganizer = user?.id === event.organizerId;

    return (
        <div className="min-h-screen pb-20">
            {/* Hero Header */}
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-30 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <Link to="/events" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary transition-colors mb-6 group">
                        <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                        Back to Events
                    </Link>

                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                        <div>
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-4">
                                {event.eventType.replace('_', ' ')}
                            </span>
                            <h1 className="text-4xl font-display font-extrabold text-gray-900 leading-tight mb-2 tracking-tight">{event.title}</h1>
                            <div className="flex items-center gap-4 text-gray-500 text-sm mt-3 font-medium">
                                <span className="flex items-center gap-1.5">
                                    <User className="h-4 w-4 text-primary" />
                                    By {event.organizer.firstName} {event.organizer.lastName}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="bg-gray-300 w-1 h-1 rounded-full"></span>
                                    {event.category}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            {isOrganizer ? (
                                <button
                                    onClick={() => setShowAnnounceModal(true)}
                                    className="rounded-xl bg-gray-900 px-6 py-3 text-sm font-bold text-white shadow-lg hover:shadow-xl hover:bg-black transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                                >
                                    <Megaphone className="h-4 w-4" />
                                    Post Update
                                </button>
                            ) : (
                                !registration ? (
                                    <button
                                        onClick={handleRegister}
                                        disabled={registering || isEventEnded}
                                        className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-lg hover:shadow-blue-500/30 hover:to-indigo-500 disabled:opacity-50 transition-all transform hover:-translate-y-0.5"
                                    >
                                        {isEventEnded ? 'Event Ended' : (registering ? 'Registering...' : 'Register Now')}
                                    </button>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-2 text-green-700 bg-green-50/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-green-100 shadow-sm">
                                            <AlertCircle className="h-5 w-5" />
                                            <span className="font-bold">Registered</span>
                                        </div>
                                        {/* Check In Button */}
                                        {!isEventEnded && (
                                            <button
                                                onClick={handleCheckIn}
                                                disabled={checkingIn}
                                                className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg hover:shadow-emerald-500/30 hover:to-teal-400 disabled:opacity-50 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                            >
                                                <MapPin className="h-4 w-4" />
                                                {checkingIn ? 'Locating...' : 'Self Check-In'}
                                            </button>
                                        )}
                                        {isEventEnded && (
                                            <button
                                                onClick={() => setShowFeedbackModal(true)}
                                                className="text-sm font-medium text-primary hover:underline text-center"
                                            >
                                                Leave Feedback
                                            </button>
                                        )}
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Announcements Section */}
                        <AnnouncementList eventId={event.id} />

                        <section className="glass-card rounded-2xl p-8">
                            <h2 className="text-xl font-display font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">About the Event</h2>
                            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{event.description}</p>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="glass-card rounded-2xl p-6">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Date & Time</h3>
                            <div className="space-y-4">
                                <div className="flex gap-4 items-start">
                                    <div className="flex-shrink-0 mt-1 h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <Calendar className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-indigo-600 uppercase mb-0.5">Start</p>
                                        <p className="text-sm font-bold text-gray-900">{format(new Date(event.startDateTime), 'MMM d, yyyy')}</p>
                                        <p className="text-sm text-gray-500">{format(new Date(event.startDateTime), 'h:mm a')}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start border-t border-gray-100 pt-4">
                                    <div className="flex-shrink-0 mt-1 h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <Clock className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-indigo-600 uppercase mb-0.5">End</p>
                                        <p className="text-sm font-bold text-gray-900">{format(new Date(event.endDateTime), 'MMM d, yyyy')}</p>
                                        <p className="text-sm text-gray-500">{format(new Date(event.endDateTime), 'h:mm a')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card rounded-2xl p-6">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Location</h3>
                            <div className="flex gap-4 items-start">
                                <div className="flex-shrink-0 mt-1 h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{event.venue}</p>
                                    <a href={`https://maps.google.com/?q=${event.venue}`} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline mt-1 block">
                                        View on Map
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feedback Modal */}
            {showFeedbackModal && event && (
                <FeedbackForm
                    eventId={event.id}
                    onClose={() => setShowFeedbackModal(false)}
                    onSubmitSuccess={() => {
                        alert('Feedback submitted! Thank you.');
                    }}
                />
            )}

            {/* Announcement Modal */}
            {showAnnounceModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Post Announcement</h2>
                            <button onClick={() => setShowAnnounceModal(false)} className="text-gray-400 hover:text-gray-600">
                                <Plus className="h-6 w-6 rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={announceTitle}
                                    onChange={e => setAnnounceTitle(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea
                                    value={announceMessage}
                                    onChange={e => setAnnounceMessage(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    rows={3}
                                    required
                                />
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="sendEmail"
                                    checked={sendEmail}
                                    onChange={e => setSendEmail(e.target.checked)}
                                    className="h-4 w-4 text-primary-blue border-gray-300 rounded"
                                />
                                <label htmlFor="sendEmail" className="ml-2 text-sm text-gray-700">Send Email Notification to All Registrants</label>
                            </div>
                            <button
                                type="submit"
                                disabled={announcing}
                                className="w-full py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-hover disabled:opacity-50"
                            >
                                {announcing ? 'Posting...' : 'Post Announcement'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
