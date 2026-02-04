import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getEventAttendance, markUserAttendance } from '../../services/attendance.service';
import type { AttendanceRecord } from '../../services/attendance.service';
import { getEventById } from '../../services/event.service';
import type { Event } from '../../services/event.service';
import { Check, X, QrCode, Info } from 'lucide-react';

export default function EventAttendance() {
    const { id } = useParams<{ id: string }>();
    const [event, setEvent] = useState<Event | null>(null);
    const [attendees, setAttendees] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!id) return;
        try {
            const [eventData, attendanceData] = await Promise.all([
                getEventById(id),
                getEventAttendance(id)
            ]);
            setEvent(eventData);
            setAttendees(attendanceData);
        } catch (e) {
            console.error(e);
            alert('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleMark = async (userId: string, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
        if (!id) return;
        try {
            await markUserAttendance(id, userId, status);
            fetchData(); // Refresh list
        } catch (e) {
            alert('Failed to mark attendance');
        }
    };

    const handleSimulateScan = async () => {
        // In a real app, this would use a camera scanner library
        const userId = prompt("Enter User ID to Simulate Scan:");
        if (userId) {
            handleMark(userId, 'PRESENT');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!event) return <div>Event not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{event.title} - Attendance</h1>
                    <p className="text-gray-500">{attendees.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length} Present</p>
                </div>
                <button
                    onClick={handleSimulateScan}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-hover"
                >
                    <QrCode className="h-5 w-5" />
                    Scan QR (Simulate)
                </button>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <p className="text-sm text-blue-900 font-medium">Certificate Issuance</p>
                    <p className="text-sm text-blue-700 mt-1">
                        Certificates can be issued in bulk from the <strong>Certificates</strong> page in the sidebar after the event is completed.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {attendees.map((record) => (
                            <tr key={record.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {record.user?.firstName} {record.user?.lastName}
                                    <div className="text-xs text-gray-500">{record.user?.rollNumber}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {record.user?.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${record.status === 'PRESENT' ? 'bg-green-100 text-green-800' :
                                        record.status === 'LATE' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                        {record.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleMark(record.userId, 'PRESENT')} className="text-green-600 hover:text-green-900" title="Mark Present">
                                            <Check className="h-5 w-5" />
                                        </button>
                                        <button onClick={() => handleMark(record.userId, 'ABSENT')} className="text-red-600 hover:text-red-900" title="Mark Absent">
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {attendees.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No attendance records found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
