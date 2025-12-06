import api from './api';

export interface Material {
    id: number;
    title: string;
    course: number;
    course_name: string;
    uploaded_by: number;
    uploaded_by_email: string;
    file: string;
    file_type: 'lecture' | 'exam' | 'assignment' | 'other';
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

export const getMaterials = async (courseId: number): Promise<Material[]> => {
    const response = await api.get('materials/', { params: { course: courseId, status: 'approved' } });
    return response.data;
};

export const uploadMaterial = async (formData: FormData): Promise<Material> => {
    const response = await api.post('materials/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getAllMaterials = async (): Promise<Material[]> => {
    const response = await api.get('materials/');
    return response.data;
};

export const addMaterial = async (material: any | FormData): Promise<Material> => {
    const isFormData = material instanceof FormData;
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const response = await api.post('materials/', material, config);
    return response.data;
};

export const updateMaterial = async (id: string, updates: any | FormData): Promise<Material> => {
    const isFormData = updates instanceof FormData;
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const response = await api.patch(`materials/${id}/`, updates, config);
    return response.data;
};

export const deleteMaterial = async (id: string): Promise<void> => {
    await api.delete(`materials/${id}/`);
};
