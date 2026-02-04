import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, MapPin, Users, ArrowLeft } from 'lucide-react';
import './PublicEvents.css';

interface Event {
    id: string;
    title: string;
    description: string;
    category: string;
    startDateTime: string;
    endDateTime: string;
    location: string;
    maxCapacity: number;
    bannerImage?: string;
    _count?: {
        registrations: number;
    };
}

export default function PublicEvents() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('ALL');
    const navigate = useNavigate();

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            console.log('Fetching events from:', 'http://localhost:5000/api/events');
            const response = await axios.get('http://localhost:5000/api/events');
            console.log('Response received:', response.data);

            // Check if response has the expected structure
            const eventsData = response.data.data || response.data || [];
            console.log('Events data:', eventsData);

            // Filter only published/upcoming events
            const publishedEvents = eventsData.filter((event: Event) =>
                new Date(event.startDateTime) > new Date()
            );
            console.log('Filtered upcoming events:', publishedEvents);
            setEvents(publishedEvents);
        } catch (error) {
            console.error('Failed to fetch events:', error);
            if (axios.isAxiosError(error)) {
                console.error('Error response:', error.response?.data);
                console.error('Error status:', error.response?.status);
            }
        } finally {
            setLoading(false);
        }
    };

    const categories = ['ALL', 'TECHNICAL', 'CULTURAL', 'SPORTS', 'WORKSHOP', 'SEMINAR', 'OTHER'];

    const filteredEvents = filter === 'ALL'
        ? events
        : events.filter(event => event.category === filter);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="public-events-page">
            {/* Header */}
            <header className="public-events-header">
                <div className="header-container">
                    <button onClick={() => navigate('/')} className="back-button">
                        <ArrowLeft className="h-5 w-5" />
                        Back to Home
                    </button>
                    <div className="header-content">
                        <img src="/logo.png" alt="UCEF Logo" className="header-logo" />
                        <div>
                            <h1>Upcoming Events</h1>
                            <p>Discover and join exciting campus events</p>
                        </div>
                    </div>
                    <div className="header-actions">
                        <button onClick={() => navigate('/login')} className="btn-login">Login</button>
                        <button onClick={() => navigate('/register')} className="btn-register">Register</button>
                    </div>
                </div>
            </header>

            {/* Filters */}
            <div className="filters-section">
                <div className="filters-container">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setFilter(category)}
                            className={`filter-btn ${filter === category ? 'active' : ''}`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Events Grid */}
            <div className="events-container">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading events...</p>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="empty-state">
                        <Calendar className="empty-icon" />
                        <h3>No events found</h3>
                        <p>Check back later for upcoming events!</p>
                    </div>
                ) : (
                    <div className="events-grid">
                        {filteredEvents.map(event => (
                            <div key={event.id} className="event-card">
                                <div className="event-banner">
                                    {event.bannerImage ? (
                                        <img src={event.bannerImage} alt={event.title} />
                                    ) : (
                                        <div className="banner-placeholder">
                                            <Calendar className="placeholder-icon" />
                                        </div>
                                    )}
                                    <span className="event-category">{event.category}</span>
                                </div>
                                <div className="event-content">
                                    <h3 className="event-title">{event.title}</h3>
                                    <p className="event-description">{event.description}</p>
                                    <div className="event-meta">
                                        <div className="meta-item">
                                            <Calendar className="meta-icon" />
                                            <span>{formatDate(event.startDateTime)}</span>
                                        </div>
                                        <div className="meta-item">
                                            <MapPin className="meta-icon" />
                                            <span>{event.location}</span>
                                        </div>
                                        <div className="meta-item">
                                            <Users className="meta-icon" />
                                            <span>{event._count?.registrations || 0} / {event.maxCapacity} registered</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate('/register')}
                                        className="register-btn"
                                    >
                                        Register to Join
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer CTA */}
            <div className="footer-cta">
                <div className="cta-content">
                    <h2>Want to create your own events?</h2>
                    <p>Join UCEF as an organizer and start managing campus events today</p>
                    <button onClick={() => navigate('/register')} className="cta-button">
                        Get Started
                    </button>
                </div>
            </div>
        </div>
    );
}
