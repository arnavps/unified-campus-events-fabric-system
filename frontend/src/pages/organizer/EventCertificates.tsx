import { useEffect, useState } from 'react';
import { getMyEvents } from '../../services/event.service';
import { bulkIssueCertificates, getEventCertificates } from '../../services/certificate.service';
import type { Event } from '../../services/event.service';
import type { CertificateWithUser } from '../../services/certificate.service';
import { Award, Users, CheckCircle, Download, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface EventWithCertificates extends Event {
    certificates?: CertificateWithUser[];
    attendeeCount?: number;
}

export default function EventCertificates() {
    const [events, setEvents] = useState<EventWithCertificates[]>([]);
    const [loading, setLoading] = useState(true);
    const [issuingEventId, setIssuingEventId] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            const eventsData = await getMyEvents();

            // Fetch certificates for each event
            const eventsWithCerts = await Promise.all(
                eventsData.map(async (event: Event) => {
                    try {
                        const certificates = await getEventCertificates(event.id);
                        return {
                            ...event,
                            certificates,
                            attendeeCount: event._count?.attendances || 0
                        };
                    } catch (error) {
                        console.error(`Failed to fetch certificates for event ${event.id}`, error);
                        return {
                            ...event,
                            certificates: [],
                            attendeeCount: event._count?.attendances || 0
                        };
                    }
                })
            );

            setEvents(eventsWithCerts);
        } catch (error) {
            console.error('Failed to load events', error);
            alert('Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleBulkIssue = async (eventId: string) => {
        if (!confirm('Issue certificates to all attendees with PRESENT or LATE status?')) {
            return;
        }

        setIssuingEventId(eventId);
        try {
            const result = await bulkIssueCertificates(eventId);
            alert(result.message || 'Certificates issued successfully!');
            fetchData(); // Refresh data
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to issue certificates';
            alert(msg);
        } finally {
            setIssuingEventId(null);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">Certificates</h1>
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
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Certificates</h1>
                <p className="text-gray-500 mt-1">Manage certificates for your events</p>
            </div>

            {events.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No events yet</h3>
                    <p className="text-gray-500">Create events to manage certificates</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {events.map((event) => {
                        const certificateCount = event.certificates?.length || 0;
                        const attendeeCount = event.attendeeCount || 0;
                        const pendingCount = attendeeCount - certificateCount;
                        const allIssued = attendeeCount > 0 && pendingCount === 0;

                        return (
                            <div
                                key={event.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                                            <p className="text-sm text-gray-500">
                                                {format(new Date(event.startDateTime), 'MMM d, yyyy')}
                                            </p>
                                        </div>
                                        {allIssued && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                <CheckCircle className="h-3 w-3" />
                                                All Issued
                                            </span>
                                        )}
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                                                <Users className="h-4 w-4" />
                                                <span className="text-xs font-medium">Attendees</span>
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900">{attendeeCount}</p>
                                        </div>
                                        <div className="text-center border-l border-r border-gray-200">
                                            <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                                                <Award className="h-4 w-4" />
                                                <span className="text-xs font-medium">Issued</span>
                                            </div>
                                            <p className="text-2xl font-bold text-green-600">{certificateCount}</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                                                <AlertCircle className="h-4 w-4" />
                                                <span className="text-xs font-medium">Pending</span>
                                            </div>
                                            <p className="text-2xl font-bold text-orange-600">{Math.max(0, pendingCount)}</p>
                                        </div>
                                    </div>

                                    {/* Issue Button */}
                                    {attendeeCount > 0 && (
                                        <button
                                            onClick={() => handleBulkIssue(event.id)}
                                            disabled={allIssued || issuingEventId === event.id}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                                        >
                                            <Award className="h-5 w-5" />
                                            {issuingEventId === event.id ? 'Issuing...' : allIssued ? 'All Certificates Issued' : 'Issue All Certificates'}
                                        </button>
                                    )}

                                    {attendeeCount === 0 && (
                                        <div className="text-center py-4 text-gray-500 text-sm">
                                            No attendees yet
                                        </div>
                                    )}

                                    {/* Issued Certificates List */}
                                    {certificateCount > 0 && (
                                        <div className="mt-4 border-t border-gray-200 pt-4">
                                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Issued Certificates ({certificateCount})</h4>
                                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                                {event.certificates?.map((cert) => (
                                                    <div
                                                        key={cert.id}
                                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                                    >
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {cert.user.firstName} {cert.user.lastName}
                                                            </p>
                                                            <p className="text-xs text-gray-500">{cert.certificateNumber}</p>
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {format(new Date(cert.issuedAt), 'MMM d, yyyy')}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
