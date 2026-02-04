import { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Calendar, PlusCircle, List, LogOut, Menu, User, Award } from 'lucide-react';

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (!user) return null;

    const menuItems = [
        { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { path: "/events", icon: List, label: "Browse Events" },
    ];

    if (user.role === 'STUDENT') {
        menuItems.push({ path: "/my-registrations", icon: Calendar, label: "My Registrations" });
        menuItems.push({ path: "/my-certificates", icon: User, label: "My Certificates" });
    }

    if (user.role === 'ORGANIZER') {
        menuItems.push({ path: "/organizer/create-event", icon: PlusCircle, label: "Create Event" });
        menuItems.push({ path: "/organizer/certificates", icon: Award, label: "Certificates" });
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-transparent bg-gradient-to-br from-gray-50 to-blue-50/30">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-50 h-full w-64 bg-white/80 backdrop-blur-md border-r border-white/20 shadow-glass transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex h-16 items-center border-b border-gray-100 px-6">
                    <img src="/logo.png" alt="LTCE Logo" className="h-10 w-10 mr-3 object-contain" />
                    <span className="text-xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                        LTCE
                    </span>
                </div>

                <div className="flex flex-col h-[calc(100%-4rem)] justify-between py-6 px-4">
                    <nav className="space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${isActive
                                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                                        : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm hover:translate-x-1'
                                        }`}
                                    onClick={() => setIsSidebarOpen(false)}
                                >
                                    <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'}`} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="border-t border-gray-100 pt-6">
                        <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100/50">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-100 to-purple-100 p-0.5">
                                <div className="h-full w-full rounded-full bg-white flex items-center justify-center text-gray-700 font-bold">
                                    {user?.firstName?.charAt(0)}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-xs text-gray-500 truncate capitalize">
                                    {user?.role?.toLowerCase() || 'user'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 hover:shadow-sm transition-all duration-200"
                        >
                            <LogOut className="h-5 w-5" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:pl-64 flex flex-col min-h-screen">
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/20 bg-white/70 backdrop-blur-md px-4 shadow-sm lg:hidden">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="LTCE Logo" className="h-8 w-8 object-contain" />
                        <span className="font-display font-bold text-gray-900">LTCE</span>
                    </div>
                    <div className="w-6" /> {/* Spacer */}
                </header>

                <main className="flex-1 p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto animate-in fade-in duration-500 slide-in-from-bottom-2">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
