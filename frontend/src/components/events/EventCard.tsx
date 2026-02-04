import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, MapPin, User } from 'lucide-react';
import type { Event } from '../../services/event.service';

interface EventCardProps {
    event: Event;
}

export default function EventCard({ event }: EventCardProps) {
    return (
        <Link to={`/events/${event.id}`} className="group block h-full">
            <div className="h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary-blue/30">
                <div className="aspect-video w-full bg-gray-100 relative overflow-hidden">
                    {event.bannerImage ? (
                        <img
                            src={event.bannerImage}
                            alt={event.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-200">
                            <span className="text-4xl font-bold opacity-20">{event.title[0]}</span>
                        </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-2">
                        <span className="inline-flex items-center rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium text-primary-blue shadow-sm backdrop-blur-sm">
                            {event.eventType.replace('_', ' ')}
                        </span>
                    </div>
                </div>
                <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(event.startDateTime), 'MMM d, yyyy • h:mm a')}
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-blue transition-colors line-clamp-1 mb-2">
                        {event.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                        {event.description}
                    </p>

                    <div className="mt-auto flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate max-w-[120px]">{event.venue}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{event.organizer.firstName} {event.organizer.lastName}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
