import { Link } from 'react-router-dom';
import { Plus, Calendar, Users, Award, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getOrganizerStats } from '../../services/analytics.service';
import StatCard from '../../components/charts/StatCard';

export default function OrganizerDashboard() {
    const [stats, setStats] = useState({
        totalEvents: 0,
        activeEvents: 0,
        totalRegistrations: 0,
        totalCertificates: 0
    });

    useEffect(() => {
        getOrganizerStats().then(setStats).catch(console.error);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Organizer Dashboard</h1>
                <Link
                    to="/organizer/create-event"
                    className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-hover transition-colors shadow-sm"
                >
                    <Plus className="h-5 w-5" />
                    Create Event
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Events" value={stats.totalEvents} icon={Calendar} color="text-blue-600" />
                <StatCard title="Active Events" value={stats.activeEvents} icon={TrendingUp} color="text-green-600" />
                <StatCard title="Total Registrations" value={stats.totalRegistrations} icon={Users} color="text-purple-600" />
                <StatCard title="Certificates Issued" value={stats.totalCertificates} icon={Award} color="text-yellow-600" />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link to="/organizer/my-events" className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 flex items-center justify-between">
                        <span className="font-medium text-gray-700">Manage Events</span>
                        <span className="text-gray-400">→</span>
                    </Link>
                    <Link to="/organizer/my-events" className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 flex items-center justify-between">
                        <span className="font-medium text-gray-700">Track Attendance</span>
                        <span className="text-gray-400">→</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
