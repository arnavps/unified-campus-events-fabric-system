import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getMyRegistrations } from '../../services/registration.service';
import type { Registration } from '../../services/registration.service';
import { Calendar, Ticket, Award } from 'lucide-react';
import { format } from 'date-fns';

export default function StudentDashboard() {
    const [recentRegistrations, setRecentRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await getMyRegistrations();
                setRecentRegistrations(data.slice(0, 3)); // Show top 3
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-display font-bold text-gray-900 tracking-tight">Welcome, Scholar! 🎓</h1>
                <p className="text-gray-600 mt-2">Here's what happening on campus today.</p>
            </header>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link to="/events" className="group glass-card p-6 rounded-2xl hover:shadow-glass-hover transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
                    <div className="relative z-10">
                        <div className="h-12 w-12 bg-blue-100/50 rounded-xl flex items-center justify-center mb-4 text-blue-600 group-hover:scale-110 transition-transform">
                            <Calendar className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-display font-bold text-gray-900 mb-1">Browse Events</h3>
                        <p className="text-gray-500 text-sm">Discover workshops, hackathons, and seminars.</p>
                    </div>
                </Link>

                <Link to="/my-registrations" className="group glass-card p-6 rounded-2xl hover:shadow-glass-hover transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
                    <div className="relative z-10">
                        <div className="h-12 w-12 bg-purple-100/50 rounded-xl flex items-center justify-center mb-4 text-purple-600 group-hover:scale-110 transition-transform">
                            <Ticket className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-display font-bold text-gray-900 mb-1">My Tickets</h3>
                        <p className="text-gray-500 text-sm">Access your QR codes and registration status.</p>
                    </div>
                </Link>

                <Link to="/my-certificates" className="group glass-card p-6 rounded-2xl hover:shadow-glass-hover transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-green-500/20 transition-all"></div>
                    <div className="relative z-10">
                        <div className="h-12 w-12 bg-green-100/50 rounded-xl flex items-center justify-center mb-4 text-green-600 group-hover:scale-110 transition-transform">
                            <Award className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-display font-bold text-gray-900 mb-1">Certificates</h3>
                        <p className="text-gray-500 text-sm">Download your earned credentials.</p>
                    </div>
                </Link>
            </div>

            {/* Recent Registrations Section */}
            <section className="glass-card rounded-2xl p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-display font-bold text-gray-900">Upcoming Schedule</h2>
                    <Link to="/my-registrations" className="text-sm font-medium text-primary hover:text-primary-blue-hover hover:underline">View All</Link>
                </div>

                {loading ? (
                    <div className="animate-pulse space-y-4">
                        {[1, 2].map(i => <div key={i} className="h-20 bg-gray-100/50 rounded-xl"></div>)}
                    </div>
                ) : recentRegistrations.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 mb-4">
                            <Calendar className="h-8 w-8 text-gray-300" />
                        </div>
                        <p className="text-gray-500">No upcoming events found.</p>
                        <Link to="/events" className="text-primary font-medium hover:underline mt-2 inline-block">Explore Events</Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {recentRegistrations.map(reg => (
                            <div key={reg.id} className="flex items-center gap-5 p-4 rounded-xl hover:bg-white/60 transition-colors border border-transparent hover:border-white/50 group">
                                <div className="h-14 w-14 bg-white shadow-sm rounded-xl flex flex-col items-center justify-center text-center overflow-hidden border border-gray-100">
                                    {reg.event?.startDateTime && (
                                        <>
                                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider bg-red-50 w-full py-0.5">
                                                {format(new Date(reg.event.startDateTime), 'MMM')}
                                            </span>
                                            <span className="text-xl font-bold text-gray-900 leading-none mt-1">
                                                {format(new Date(reg.event.startDateTime), 'd')}
                                            </span>
                                        </>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-bold text-gray-900 truncate group-hover:text-primary transition-colors">
                                        {reg.event?.title}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {reg.event?.startDateTime && format(new Date(reg.event.startDateTime), 'h:mm a')}
                                        </span>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                        <span>{reg.event?.venue}</span>
                                    </div>
                                </div>
                                <div>
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize border ${reg.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                                        reg.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                            'bg-gray-50 text-gray-600 border-gray-200'
                                        }`}>
                                        {reg.status.toLowerCase()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
