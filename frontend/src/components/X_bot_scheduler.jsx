import React, { useState, useEffect } from 'react';
import { db } from '../firebase_config';
import { collection, addDoc, query, where, onSnapshot, orderBy, Timestamp } from "firebase/firestore";

const X_bot_scheduler = () => {
    const [content, setContent] = useState('');
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Hardcoded for this example, normally from Auth
    const userId = "user_123";
    const MAX_FREE_POSTS = 5;

    useEffect(() => {
        // Real-time listener for scheduled posts
        const q = query(
            collection(db, "scheduled_posts"),
            where("authorId", "==", userId),
            orderBy("scheduleTime", "asc")
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const postsData = [];
            querySnapshot.forEach((doc) => {
                postsData.push({ ...doc.data(), id: doc.id });
            });
            setPosts(postsData);
        });

        return () => unsubscribe();
    }, [userId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // 1. Check Limits
        const scheduledCount = posts.filter(p => p.status === 'scheduled').length;
        if (scheduledCount >= MAX_FREE_POSTS) {
            setError(`Limit reached: You can only have ${MAX_FREE_POSTS} scheduled posts.`);
            setLoading(false);
            return;
        }

        // 2. Validate Date
        const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
        if (scheduledDateTime <= new Date()) {
            setError("Schedule time must be in the future.");
            setLoading(false);
            return;
        }

        try {
            // 3. Add to Firestore
            await addDoc(collection(db, "scheduled_posts"), {
                content: content,
                scheduleTime: Timestamp.fromDate(scheduledDateTime),
                authorId: userId,
                status: 'scheduled',
                createdAt: Timestamp.now()
            });

            // Reset form
            setContent('');
            setScheduleDate('');
            setScheduleTime('');
            alert("Post scheduled successfully!");

        } catch (err) {
            console.error("Error adding document: ", err);
            setError("Failed to schedule post. Check console.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
            <h2 className="text-xl font-bold text-gray-900">X Bot Scheduler</h2>

            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Post Content</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        rows="3"
                        maxLength="280"
                        required
                        placeholder="What's happening?"
                    />
                    <p className="text-xs text-gray-500 text-right">{content.length}/280</p>
                </div>

                <div className="flex space-x-2">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">Date</label>
                        <input
                            type="date"
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">Time</label>
                        <input
                            type="time"
                            value={scheduleTime}
                            onChange={(e) => setScheduleTime(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Scheduling...' : 'Schedule Post'}
                </button>
            </form>

            <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900">Scheduled Queue ({posts.filter(p => p.status === 'scheduled').length}/{MAX_FREE_POSTS})</h3>
                <ul className="divide-y divide-gray-200 mt-2">
                    {posts.map((post) => (
                        <li key={post.id} className="py-3 flex justify-between items-center">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{post.content}</p>
                                <p className="text-xs text-gray-500">
                                    {post.scheduleTime?.toDate().toLocaleString()} - <span className={`font-semibold ${post.status === 'posted' ? 'text-green-600' : post.status === 'failed' ? 'text-red-600' : 'text-yellow-600'}`}>{post.status}</span>
                                </p>
                            </div>
                        </li>
                    ))}
                    {posts.length === 0 && <p className="text-sm text-gray-500 text-center py-2">No posts scheduled.</p>}
                </ul>
            </div>
        </div>
    );
};

export default X_bot_scheduler;
