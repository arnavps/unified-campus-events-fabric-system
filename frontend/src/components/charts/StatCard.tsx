import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: number | string;
    icon: LucideIcon;
    color: string;
}

export default function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center">
            <div className={`p-4 rounded-lg bg-opacity-10 mr-4 ${color.replace('text-', 'bg-')}`}>
                <Icon className={`h-8 w-8 ${color}`} />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
}
