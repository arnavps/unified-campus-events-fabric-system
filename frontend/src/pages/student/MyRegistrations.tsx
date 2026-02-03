import { useEffect, useState } from 'react';
import { getMyRegistrations, cancelRegistration } from '../../services/registration.service';
import type { Registration } from '../../services/registration.service';
import { format } from 'date-fns';
import { Calendar, MapPin, QrCode, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import QRCode from 'react-qr-code';

export default function MyRegistrations() {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<Registration | null>(null);

    const fetchRegistrations = async () => {
        try {
            const data = await getMyRegistrations();
            setRegistrations(data);
        } catch (error) {
            console.error('Failed to load registrations', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const handleCancel = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to cancel your registration for ${title}?`)) return;
        try {
            await cancelRegistration(id);
            fetchRegistrations(); // Refresh list
        } catch (error) {
            alert('Failed to cancel registration');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading registrations...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">My Registrations</h1>

                {registrations.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                        <p className="text-gray-500 mb-4">You haven't registered for any events yet.</p>
                        <Link to="/events" className="text-primary-blue font-medium hover:underline">Browse Events</Link>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {registrations.map((reg) => (
                            <div key={reg.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${reg.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                reg.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                    reg.status === 'CANCELLED' ? 'bg-gray-100 text-gray-800' :
                                                        'bg-red-100 text-red-800'
                                            }`}>
                                            {reg.status}
                                        </span>
                                        {reg.status !== 'CANCELLED' && (
                                            <button onClick={() => setSelectedTicket(reg)} className="text-gray-400 hover:text-gray-600" title="View Ticket">
                                                <QrCode className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>

                                    {reg.event ? (
                                        <>
                                            <h3 className="text-lg font-bold text-gray-900 mb-2">{reg.event.title}</h3>
                                            <div className="space-y-2 text-sm text-gray-500">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    {format(new Date(reg.event.startDateTime), 'MMM d, yyyy • h:mm a')}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4" />
                                                    {reg.event.venue}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-gray-500 italic">Event details unavailable</p>
                                    )}
                                </div>
                                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-100">
                                    {reg.event && <Link to={`/events/${reg.event.id}`} className="text-sm font-medium text-primary-blue hover:underline">View Event</Link>}
                                    {reg.status !== 'CANCELLED' && (
                                        <button
                                            onClick={() => handleCancel(reg.id, reg.event?.title || 'Event')}
                                            className="text-sm font-medium text-red-600 hover:text-red-800"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Ticket Modal */}
            {selectedTicket && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" onClick={() => setSelectedTicket(null)}>
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-end">
                            <button onClick={() => setSelectedTicket(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Event Ticket</h3>
                        <p className="text-sm text-gray-500 mb-6">{selectedTicket.event?.title}</p>

                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-white border-2 border-gray-100 rounded-xl">
                                <QRCode value={selectedTicket.userId} size={180} />
                            </div>
                        </div>

                        <p className="text-xs text-gray-400">Scan this QR code at the venue entry.</p>
                        <p className="text-xs text-gray-300 mt-2 font-mono">{selectedTicket.userId}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
