import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUniversities, University } from '../services/universityService';

export const Home: React.FC = () => {
    const [universities, setUniversities] = useState<University[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUniversities = async () => {
            try {
                const data = await getUniversities();
                setUniversities(data);
            } catch (error) {
                console.error('Failed to fetch universities', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUniversities();
    }, []);

    if (loading) return <div className="p-8 text-center">Loading universities...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                    Find Your University
                </h1>
                <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
                    Select your university to access course materials, lecture notes, and more.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {universities.map((uni) => (
                    <Link
                        key={uni.id}
                        to={`/university/${uni.id}`}
                        className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-200"
                    >
                        <div className="p-6 flex items-center space-x-4">
                            {uni.logo ? (
                                <img src={uni.logo} alt={uni.name} className="h-16 w-16 object-contain" />
                            ) : (
                                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                                    {uni.name.charAt(0)}
                                </div>
                            )}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {uni.name}
                                </h3>
                                {uni.website && (
                                    <span className="text-sm text-gray-500 truncate block max-w-[200px]">
                                        {uni.website}
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {universities.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                    No universities found.
                </div>
            )}
        </div>
    );
};
