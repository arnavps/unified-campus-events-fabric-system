import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
    const navigate = useNavigate();

    useEffect(() => {
        // Navbar scroll effect
        const handleScroll = () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 50) {
                navbar?.classList.add('scrolled');
            } else {
                navbar?.classList.remove('scrolled');
            }
        };

        window.addEventListener('scroll', handleScroll);

        // Scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    (entry.target as HTMLElement).style.opacity = '1';
                    (entry.target as HTMLElement).style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        document.querySelectorAll('.feature-card, .stat-card').forEach(el => {
            (el as HTMLElement).style.opacity = '0';
            (el as HTMLElement).style.transform = 'translateY(30px)';
            (el as HTMLElement).style.transition = 'all 0.6s ease-out';
            observer.observe(el);
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            observer.disconnect();
        };
    }, []);

    const handleLogin = () => {
        navigate('/login');
    };

    const handleGetStarted = () => {
        navigate('/register');
    };

    return (
        <div className="landing-page">
            {/* Navbar */}
            <nav className="navbar">
                <div className="nav-container">
                    <div className="logo-container">
                        <img src="/logo.png" alt="UCEF Logo" className="logo-image" />
                        <div className="logo">UCEF</div>
                    </div>
                    <ul className="nav-links">
                        <li><a href="#home">Home</a></li>
                        <li><a href="#features">Features</a></li>
                        <li><a href="#events">Events</a></li>
                        <li><a href="#about">About</a></li>
                    </ul>
                    <div className="nav-cta">
                        <button className="btn-login" onClick={handleLogin}>Login</button>
                        <button className="btn-primary" onClick={handleGetStarted}>Get Started</button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero" id="home">
                <div className="hero-content">
                    <div className="hero-text">
                        <h1>
                            <span className="highlight">Participation</span> is not attendance<br />
                            It's contribution made visible
                        </h1>
                        <p>
                            Transform campus events into meaningful engagement records. UCEF tracks your journey from registration to certification, preserving every contribution over time.
                        </p>
                        <div className="hero-cta">
                            <button className="btn-hero btn-hero-primary" onClick={() => navigate('/explore-events')}>Explore Events</button>
                            <button className="btn-hero btn-hero-secondary">Watch Demo</button>
                        </div>
                    </div>
                    <div className="hero-visual">
                        <div className="visual-container">
                            <div className="card-3d">
                                <div className="card-image">
                                    <span className="event-icon">🎓</span>
                                </div>
                                <h3 className="card-title">React Advanced Workshop</h3>
                                <div className="card-meta">
                                    <span>📅 Feb 15, 2026</span>
                                    <span>📍 CS Lab 401</span>
                                </div>
                                <span className="card-tag">TECHNICAL</span>
                            </div>

                            <div className="floating-card floating-card-1">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                        ✓
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Attendance</div>
                                        <div style={{ fontWeight: 600, color: '#111827' }}>Verified</div>
                                    </div>
                                </div>
                            </div>

                            <div className="floating-card floating-card-2">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                        🏆
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Certificates</div>
                                        <div style={{ fontWeight: 600, color: '#111827' }}>12 Earned</div>
                                    </div>
                                </div>
                            </div>

                            <div className="floating-card floating-card-3">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                        📊
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Attendance Rate</div>
                                        <div style={{ fontWeight: 600, color: '#111827' }}>95%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats">
                <div className="stats-container">
                    <div className="stat-card">
                        <div className="stat-number">500+</div>
                        <div className="stat-label">Active Events</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">15K+</div>
                        <div className="stat-label">Student Participants</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">8K+</div>
                        <div className="stat-label">Certificates Issued</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">95%</div>
                        <div className="stat-label">Satisfaction Rate</div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features" id="features">
                <div className="features-container">
                    <div className="section-header">
                        <h2 className="section-title">Everything You Need</h2>
                        <p className="section-subtitle">
                            From event creation to certificate generation, UCEF handles the complete participation lifecycle
                        </p>
                    </div>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">📅</div>
                            <h3 className="feature-title">Smart Event Management</h3>
                            <p className="feature-description">
                                Create, publish, and manage events with state-based workflows. Track every stage from draft to completion.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">✓</div>
                            <h3 className="feature-title">Multi-Method Attendance</h3>
                            <p className="feature-description">
                                QR codes, geofencing, self-check-in, or manual tracking. Choose what works best for your event.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🎓</div>
                            <h3 className="feature-title">Automated Certificates</h3>
                            <p className="feature-description">
                                Generate verified certificates instantly. Customizable templates with blockchain-style verification.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">📊</div>
                            <h3 className="feature-title">Participation Analytics</h3>
                            <p className="feature-description">
                                Track engagement patterns, attendance rates, and contribution trends over time with detailed insights.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">👤</div>
                            <h3 className="feature-title">Student Profiles</h3>
                            <p className="feature-description">
                                Comprehensive participation history that grows with students throughout their academic journey.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🔔</div>
                            <h3 className="feature-title">Smart Notifications</h3>
                            <p className="feature-description">
                                Automated reminders, announcements, and updates keep everyone informed and engaged.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-container">
                    <h2>Ready to Transform Your Campus Experience?</h2>
                    <p>
                        Join thousands of students who are building their participation legacy. Start tracking your journey today.
                    </p>
                    <div className="cta-buttons">
                        <button className="btn-cta btn-cta-white" onClick={handleGetStarted}>Create Account</button>
                        <button className="btn-cta btn-cta-outline">Learn More</button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-container">
                    <div className="footer-grid">
                        <div className="footer-brand">
                            <h3>UCEF</h3>
                            <p>
                                Unified Campus Events Fabric - Where participation becomes a permanent record of contribution and growth.
                            </p>
                        </div>
                        <div className="footer-links">
                            <h4>Platform</h4>
                            <ul>
                                <li><a href="#features">Features</a></li>
                                <li><a href="#events">Events</a></li>
                                <li><a href="#">Certificates</a></li>
                                <li><a href="#">Analytics</a></li>
                            </ul>
                        </div>
                        <div className="footer-links">
                            <h4>Resources</h4>
                            <ul>
                                <li><a href="#">Documentation</a></li>
                                <li><a href="#">API Reference</a></li>
                                <li><a href="#">Help Center</a></li>
                                <li><a href="#">Community</a></li>
                            </ul>
                        </div>
                        <div className="footer-links">
                            <h4>Company</h4>
                            <ul>
                                <li><a href="#">About Us</a></li>
                                <li><a href="#">Contact</a></li>
                                <li><a href="#">Privacy</a></li>
                                <li><a href="#">Terms</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; 2026 UCEF. All rights reserved. Built with passion for student engagement.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
