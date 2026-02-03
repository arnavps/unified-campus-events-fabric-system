import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { getEventAnnouncements } from '../../services/announcement.service';
import type { Announcement } from '../../services/announcement.service';
import { format } from 'date-fns';

export default function AnnouncementList({ eventId }: { eventId: string }) {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getEventAnnouncements(eventId)
            .then(setAnnouncements)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [eventId]);

    if (loading) return null; // Don't show loading for this secondary widget
    if (announcements.length === 0) return null;

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary-blue" />
                Announcements
            </h3>
            <div className="space-y-4">
                {announcements.map((ann) => (
                    <div
                        key={ann.id}
                        className={`p-4 rounded-lg border-l-4 ${ann.priority === 'URGENT' ? 'bg-red-50 border-red-500' :
                            ann.priority === 'HIGH' ? 'bg-orange-50 border-orange-500' :
                                'bg-blue-50 border-blue-500'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="font-semibold text-gray-900">{ann.title}</h4>
                            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                {format(new Date(ann.createdAt), 'MMM d, h:mm a')}
                            </span>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{ann.message}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
