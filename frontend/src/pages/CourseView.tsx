import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCourses, Course } from '../services/universityService';

export const CourseView: React.FC = () => {
    const { universityId } = useParams<{ universityId: string }>();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            if (universityId) {
                try {
                    const data = await getCourses(parseInt(universityId));
                    setCourses(data);
                } catch (error) {
                    console.error('Failed to fetch courses', error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchCourses();
    }, [universityId]);

    if (loading) return <div className="p-8 text-center">Loading courses...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
                <Link to="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
                    &larr; Back to Universities
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                    <Link
                        key={course.id}
                        to={`/course/${course.id}`}
                        className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 p-6"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full mb-2">
                                    {course.code}
                                </span>
                                <h3 className="text-lg font-medium text-gray-900">{course.name}</h3>
                                <p className="mt-2 text-sm text-gray-500 line-clamp-2">{course.description}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {courses.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                    No courses found for this university.
                </div>
            )}
        </div>
    );
};
