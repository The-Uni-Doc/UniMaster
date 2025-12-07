import api from './api';

export interface University {
    id: number;
    name: string;
    logo: string | null;
    website: string | null;
}

export interface Course {
    id: number;
    name: string;
    code: string;
    university: number;
    university_name: string;
    description: string;
}

export const getUniversities = async (): Promise<University[]> => {
    const response = await api.get('universities/');
    return response.data;
};

export const getCourses = async (universityId?: number): Promise<Course[]> => {
    const params = universityId ? { university: universityId } : {};
    const response = await api.get('courses/', { params });
    return response.data;
};

export const addUniversity = async (name: string): Promise<University> => {
    const response = await api.post('universities/', { name });
    return response.data;
};

export const updateUniversity = async (id: string, name: string): Promise<University> => {
    const response = await api.patch(`universities/${id}/`, { name });
    return response.data;
};

export const deleteUniversity = async (id: string): Promise<void> => {
    await api.delete(`universities/${id}/`);
};

export const addCourse = async (universityId: string, name: string, code: string): Promise<Course> => {
    const response = await api.post('courses/', { university: universityId, name, code });
    return response.data;
};

export const updateCourse = async (id: string, name: string, code: string): Promise<Course> => {
    const response = await api.patch(`courses/${id}/`, { name, code });
    return response.data;
};

export const deleteCourse = async (id: string): Promise<void> => {
    await api.delete(`courses/${id}/`);
};

export const getYears = async (courseId: string): Promise<any[]> => {
    const response = await api.get('years/', { params: { course: courseId } });
    return response.data;
};

export const ensureYearsForCourse = async (courseId: string): Promise<void> => {
    // Check if years exist, if not create them (1, 2, 3)
    const existingYears = await getYears(courseId);
    if (existingYears.length === 0) {
        await api.post('years/', { course: courseId, year_number: 1 });
        await api.post('years/', { course: courseId, year_number: 2 });
        await api.post('years/', { course: courseId, year_number: 3 });
    }
};
