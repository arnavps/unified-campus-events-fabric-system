import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyEvents } from '../../services/event.service';
import type { Event } from '../../services/event.service';
import { Calendar, Users, CheckCircle, Award, Plus, Eye, ClipboardList } from 'lucide-react';
import { format } from 'date-fns';

export default function MyEvents() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyEvents = async () => {
            try {
                const data = await getMyEvents();
                setEvents(data);
            } catch (error) {
                console.error('Failed to load events', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyEvents();
    }, []);

    const getStatusBadge = (state?: string) => {
        const statusColors: Record<string, string> = {
            CREATED: 'bg-gray-100 text-gray-800',
            PUBLISHED: 'bg-blue-100 text-blue-800',
            LIVE: 'bg-green-100 text-green-800',
            COMPLETED: 'bg-purple-100 text-purple-800',
            CANCELLED: 'bg-red-100 text-red-800',
            ARCHIVED: 'bg-gray-100 text-gray-600'
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[state || 'CREATED']}`}>
                {state || 'CREATED'}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
                </div>
                <div className="grid grid-cols-1 gap-6">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-48 bg-gray-200 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
                    <p className="text-gray-500 mt-1">Manage your created events and track attendance</p>
                </div>
                <Link
                    to="/organizer/create-event"
                    className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-hover transition-colors shadow-sm"
                >
                    <Plus className="h-5 w-5" />
                    Create Event
                </Link>
            </div>

            {events.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No events yet</h3>
                    <p className="text-gray-500 mb-6">Create your first event to get started</p>
                    <Link
                        to="/organizer/create-event"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-hover transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        Create Event
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {events.map((event) => (
                        <div
                            key={event.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                                            {getStatusBadge(event.state)}
                                        </div>
                                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{event.description}</p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                {format(new Date(event.startDateTime), 'MMM d, yyyy • h:mm a')}
                                            </span>
                                            <span className="text-gray-300">•</span>
                                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                                {event.eventType.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                                            <Users className="h-4 w-4" />
                                            <span className="text-xs font-medium">Registrations</span>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">{event._count?.registrations || 0}</p>
                                    </div>
                                    <div className="text-center border-l border-r border-gray-200">
                                        <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                                            <CheckCircle className="h-4 w-4" />
                                            <span className="text-xs font-medium">Attended</span>
                                        </div>
                                        <p className="text-2xl font-bold text-green-600">{event._count?.attendances || 0}</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                                            <Award className="h-4 w-4" />
                                            <span className="text-xs font-medium">Certificates</span>
                                        </div>
                                        <p className="text-2xl font-bold text-yellow-600">{event._count?.certificates || 0}</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <Link
                                        to={`/events/${event.id}`}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <Eye className="h-4 w-4" />
                                        View Details
                                    </Link>
                                    <Link
                                        to={`/organizer/events/${event.id}/attendance`}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-hover transition-colors"
                                    >
                                        <ClipboardList className="h-4 w-4" />
                                        Manage Attendance
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
