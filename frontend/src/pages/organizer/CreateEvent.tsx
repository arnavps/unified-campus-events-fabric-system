import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { createEvent } from '../../services/event.service';

const createEventSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    eventType: z.enum(['WORKSHOP', 'HACKATHON', 'SEMINAR', 'WEBINAR', 'CULTURAL_EVENT', 'SPORTS_EVENT', 'CLUB_ACTIVITY', 'COMPETITION', 'CONFERENCE', 'GUEST_LECTURE', 'OTHER']),
    category: z.enum(['TECHNICAL', 'CULTURAL', 'SPORTS', 'SOCIAL', 'ACADEMIC', 'PROFESSIONAL', 'ENTERTAINMENT']),
    startDateTime: z.string().min(1, 'Start date is required'),
    endDateTime: z.string().min(1, 'End date is required'),
    venue: z.string().min(1, 'Venue is required'),
    maxParticipants: z.string().optional(), // Keep as string for form
});

type CreateEventForm = z.infer<typeof createEventSchema>;

export default function CreateEvent() {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateEventForm>({
        resolver: zodResolver(createEventSchema),
    });

    const onSubmit = async (data: CreateEventForm) => {
        try {
            // Manual conversion for API
            const payload = {
                ...data,
                maxParticipants: data.maxParticipants ? parseInt(data.maxParticipants, 10) : undefined
            };

            await createEvent(payload);
            navigate('/events');
        } catch (error) {
            console.error('Failed to create event', error);
            alert('Failed to create event');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Event</h1>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Event Title</label>
                            <input type="text" {...register('title')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-blue focus:ring-primary-blue sm:text-sm h-10 px-3 border" />
                            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea rows={4} {...register('description')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-blue focus:ring-primary-blue sm:text-sm p-3 border" />
                            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Event Type</label>
                                <select {...register('eventType')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-blue focus:ring-primary-blue sm:text-sm h-10 px-3 border">
                                    {['WORKSHOP', 'HACKATHON', 'SEMINAR', 'WEBINAR', 'CULTURAL_EVENT', 'SPORTS_EVENT', 'CLUB_ACTIVITY', 'COMPETITION', 'CONFERENCE', 'GUEST_LECTURE', 'OTHER'].map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <select {...register('category')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-blue focus:ring-primary-blue sm:text-sm h-10 px-3 border">
                                    {['TECHNICAL', 'CULTURAL', 'SPORTS', 'SOCIAL', 'ACADEMIC', 'PROFESSIONAL', 'ENTERTAINMENT'].map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Start Date & Time</label>
                                <input type="datetime-local" {...register('startDateTime')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-blue focus:ring-primary-blue sm:text-sm h-10 px-3 border" />
                                {errors.startDateTime && <p className="text-red-500 text-xs mt-1">{errors.startDateTime.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">End Date & Time</label>
                                <input type="datetime-local" {...register('endDateTime')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-blue focus:ring-primary-blue sm:text-sm h-10 px-3 border" />
                                {errors.endDateTime && <p className="text-red-500 text-xs mt-1">{errors.endDateTime.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Venue</label>
                            <input type="text" {...register('venue')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-blue focus:ring-primary-blue sm:text-sm h-10 px-3 border" />
                            {errors.venue && <p className="text-red-500 text-xs mt-1">{errors.venue.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Max Participants (Optional)</label>
                            <input type="number" {...register('maxParticipants')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-blue focus:ring-primary-blue sm:text-sm h-10 px-3 border" />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-primary-blue py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-blue-hover focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Creating...' : 'Create Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
