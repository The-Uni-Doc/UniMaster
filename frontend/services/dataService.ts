import { University, Course, Year, Material, MaterialCategory } from '../types';

// Initial Mock Data
const INITIAL_UNIS: University[] = [
  { id: 'u1', name: 'Global Tech University' },
  { id: 'u2', name: 'Institute of Arts & Design' },
];

const INITIAL_COURSES: Course[] = [
  { id: 'c1', universityId: 'u1', name: 'Computer Science', code: 'CS101' },
  { id: 'c2', universityId: 'u1', name: 'Mechanical Engineering', code: 'ME200' },
  { id: 'c3', universityId: 'u2', name: 'Graphic Design', code: 'GD101' },
];

const INITIAL_YEARS: Year[] = [
  { id: 'y1', courseId: 'c1', yearNumber: 1 },
  { id: 'y2', courseId: 'c1', yearNumber: 2 },
  { id: 'y3', courseId: 'c1', yearNumber: 3 },
  { id: 'y4', courseId: 'c2', yearNumber: 1 },
  { id: 'y5', courseId: 'c3', yearNumber: 1 },
];

const INITIAL_MATERIALS: Material[] = [
  {
    id: 'm1',
    yearId: 'y1',
    title: 'Introduction to Algorithms Lecture Notes',
    category: MaterialCategory.NOTES,
    fileUrl: '#',
    uploadedAt: new Date().toISOString(),
    description: 'Comprehensive notes on sorting and searching.'
  },
  {
    id: 'm2',
    yearId: 'y1',
    title: '2023 Midterm Exam',
    category: MaterialCategory.PAST_PAPERS,
    fileUrl: '#',
    uploadedAt: new Date().toISOString(),
  },
  {
    id: 'm3',
    yearId: 'y1',
    title: 'Data Structures Flashcards',
    category: MaterialCategory.FLASHCARDS,
    fileUrl: '#',
    uploadedAt: new Date().toISOString(),
  }
];

// Helper to simulate DB delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generic LocalStorage Wrapper
const getStorage = <T,>(key: string, initial: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(stored);
};

const setStorage = <T,>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const dataService = {
  getUniversities: async (): Promise<University[]> => {
    await delay(300);
    return getStorage('unimaster_unis', INITIAL_UNIS);
  },

  addUniversity: async (name: string): Promise<University> => {
    const unis = getStorage('unimaster_unis', INITIAL_UNIS);
    const newUni = { id: crypto.randomUUID(), name };
    setStorage('unimaster_unis', [...unis, newUni]);
    return newUni;
  },

  updateUniversity: async (id: string, name: string): Promise<University> => {
      const unis = getStorage('unimaster_unis', INITIAL_UNIS);
      const index = unis.findIndex(u => u.id === id);
      if (index === -1) throw new Error("University not found");
      
      unis[index].name = name;
      setStorage('unimaster_unis', unis);
      return unis[index];
  },

  deleteUniversity: async (id: string): Promise<void> => {
    // Cascade: Get all courses for this Uni
    const courses = getStorage('unimaster_courses', INITIAL_COURSES);
    const uniCourses = courses.filter(c => c.universityId === id);
    
    // 1. Delete content for each course FIRST (Bottom-up deletion)
    for (const course of uniCourses) {
        await dataService.deleteCourseContent(course.id);
    }

    // 2. Delete courses from storage
    setStorage('unimaster_courses', courses.filter(c => c.universityId !== id));

    // 3. Delete the University
    const unis = getStorage('unimaster_unis', INITIAL_UNIS);
    setStorage('unimaster_unis', unis.filter(u => u.id !== id));
  },

  getCourses: async (universityId?: string): Promise<Course[]> => {
    await delay(300);
    const courses = getStorage('unimaster_courses', INITIAL_COURSES);
    if (universityId) {
      return courses.filter(c => c.universityId === universityId);
    }
    return courses;
  },

  getCourse: async (id: string): Promise<Course | undefined> => {
      const courses = getStorage('unimaster_courses', INITIAL_COURSES);
      return courses.find(c => c.id === id);
  },

  addCourse: async (universityId: string, name: string, code: string): Promise<Course> => {
    const courses = getStorage('unimaster_courses', INITIAL_COURSES);
    const newCourse = { id: crypto.randomUUID(), universityId, name, code };
    setStorage('unimaster_courses', [...courses, newCourse]);
    return newCourse;
  },

  updateCourse: async (id: string, name: string, code: string): Promise<Course> => {
      const courses = getStorage('unimaster_courses', INITIAL_COURSES);
      const index = courses.findIndex(c => c.id === id);
      if (index === -1) throw new Error("Course not found");
      
      courses[index].name = name;
      courses[index].code = code;
      setStorage('unimaster_courses', courses);
      return courses[index];
  },

  // Helper to delete course content (years and materials)
  deleteCourseContent: async (courseId: string) => {
      const years = getStorage('unimaster_years', INITIAL_YEARS);
      const courseYears = years.filter(y => y.courseId === courseId);
      const yearIds = new Set(courseYears.map(y => y.id));
      
      // Delete Materials for those years
      const materials = getStorage('unimaster_materials', INITIAL_MATERIALS);
      setStorage('unimaster_materials', materials.filter(m => !yearIds.has(m.yearId)));

      // Delete Years
      setStorage('unimaster_years', years.filter(y => y.courseId !== courseId));
  },

  deleteCourse: async (id: string): Promise<void> => {
      // Cascade delete content first
      await dataService.deleteCourseContent(id);
      // Then delete course
      const courses = getStorage('unimaster_courses', INITIAL_COURSES);
      setStorage('unimaster_courses', courses.filter(c => c.id !== id));
  },

  getYears: async (courseId?: string): Promise<Year[]> => {
    await delay(200);
    const years = getStorage('unimaster_years', INITIAL_YEARS);
    if (courseId) {
      return years.filter(y => y.courseId === courseId).sort((a, b) => a.yearNumber - b.yearNumber);
    }
    return years;
  },

  // Ensure years exist for a course (simple mock logic)
  ensureYearsForCourse: async (courseId: string) => {
    const allYears = getStorage('unimaster_years', INITIAL_YEARS);
    const existing = allYears.filter(y => y.courseId === courseId);
    if (existing.length === 0) {
      // Create default 4 years
      const newYears = [1, 2, 3, 4].map(num => ({
        id: crypto.randomUUID(),
        courseId,
        yearNumber: num
      }));
      setStorage('unimaster_years', [...allYears, ...newYears]);
    }
  },

  getMaterials: async (yearId: string): Promise<Material[]> => {
    await delay(500);
    const materials = getStorage('unimaster_materials', INITIAL_MATERIALS);
    return materials.filter(m => m.yearId === yearId);
  },

  getAllMaterials: async (): Promise<Material[]> => {
    return getStorage('unimaster_materials', INITIAL_MATERIALS);
  },

  addMaterial: async (material: Omit<Material, 'id' | 'uploadedAt'>): Promise<Material> => {
    const materials = getStorage('unimaster_materials', INITIAL_MATERIALS);
    const newMaterial: Material = {
      ...material,
      id: crypto.randomUUID(),
      uploadedAt: new Date().toISOString()
    };
    setStorage('unimaster_materials', [...materials, newMaterial]);
    return newMaterial;
  },

  updateMaterial: async (id: string, updates: Partial<Material>): Promise<Material> => {
      const materials = getStorage('unimaster_materials', INITIAL_MATERIALS);
      const index = materials.findIndex(m => m.id === id);
      if (index === -1) throw new Error("Material not found");
      
      const updated = { ...materials[index], ...updates };
      materials[index] = updated;
      setStorage('unimaster_materials', materials);
      return updated;
  },
  
  deleteMaterial: async (id: string): Promise<void> => {
      const materials = getStorage('unimaster_materials', INITIAL_MATERIALS);
      const filtered = materials.filter(m => m.id !== id);
      setStorage('unimaster_materials', filtered);
  }
};