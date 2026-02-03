import { useEffect, useState } from 'react';
import { getMyCertificates, downloadCertificate } from '../../services/certificate.service';
import type { Certificate } from '../../services/certificate.service';
import { format } from 'date-fns';
import { Award, Calendar, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyCertificates() {
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getMyCertificates();
                setCertificates(data);
            } catch (error) {
                console.error('Failed to load certificates', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleDownload = async (cert: Certificate) => {
        try {
            await downloadCertificate(cert.id, `Certificate-${cert.certificateNumber}.pdf`);
        } catch (e) {
            alert('Failed to download certificate.');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading certificates...</div>;

    return (
        <div className="min-h-screen pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <h1 className="text-4xl font-display font-bold text-gray-900 mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600 inline-block">
                    My Certificates
                </h1>

                {certificates.length === 0 ? (
                    <div className="glass-card text-center py-16 rounded-3xl">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 mb-6 shadow-inner">
                            <Award className="h-10 w-10 text-primary-blue" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">No Certificates Yet</h3>
                        <p className="text-gray-500 mb-6 mt-2">Participate in events to earn recognized certificates!</p>
                        <Link
                            to="/events"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
                        >
                            <Calendar className="h-4 w-4" />
                            Browse Events
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {certificates.map((cert) => (
                            <div key={cert.id} className="glass-card group hover:scale-[1.02] transition-all duration-300 flex flex-col overflow-hidden">
                                <div className="p-6 flex-1 relative overflow-hidden">
                                    {/* Decorative background element */}
                                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-500"></div>

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                                <Award className="h-6 w-6 text-yellow-600" />
                                            </div>
                                            <span className="text-xs font-mono py-1 px-2 bg-gray-100/80 rounded uppercase text-gray-500">
                                                #{cert.certificateNumber.substring(0, 8)}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-primary-blue transition-colors">
                                            {cert.title}
                                        </h3>

                                        {cert.event && (
                                            <div className="mt-4 pt-4 border-t border-gray-100/50">
                                                <div className="text-sm font-medium text-gray-700 mb-1">{cert.event.title}</div>
                                                <div className="flex items-center gap-2 text-gray-500 text-xs">
                                                    <Calendar className="h-3 w-3" />
                                                    {format(new Date(cert.event.startDateTime), 'MMMM d, yyyy')}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50/50 border-t border-gray-100/50 backdrop-blur-sm">
                                    <button
                                        onClick={() => handleDownload(cert)}
                                        className="w-full flex items-center justify-center gap-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-2.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                                    >
                                        <Download className="h-4 w-4" />
                                        Download PDF
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
