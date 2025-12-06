
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    GraduationCap, CheckCircle, Search, User, Mail,
    Lock, Calendar, Briefcase, CreditCard, ArrowRight, Shield
} from 'lucide-react';
import { getUniversities, getCourses } from '../services/universityService';
import { authService } from '../services/authService';
import { University, Course, UserRole } from '../types';

type SignupStep = 'PERSONAL' | 'EMAIL' | 'ADMIN_SETUP' | 'COURSE_SELECT' | 'SUBSCRIPTION';

export const Signup: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [currentStep, setCurrentStep] = useState<SignupStep>('PERSONAL');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form State - Personal
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [role, setRole] = useState<'Student' | 'Teacher' | 'Other'>('Student');
    const [otherRole, setOtherRole] = useState('');

    // Form State - Email
    const [email, setEmail] = useState('');
    const [isAdminInvite, setIsAdminInvite] = useState(false);

    // Form State - Course (New Student)
    const [universities, setUniversities] = useState<University[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedUni, setSelectedUni] = useState<string>('');
    const [selectedCourse, setSelectedCourse] = useState<string>('');

    // Form State - Password & Payment
    const [password, setPassword] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');

    // Initialization: Load params and data
    useEffect(() => {
        const loadData = async () => {
            const unis = await getUniversities();
            setUniversities(unis);

            const uniParam = searchParams.get('uniId');
            const courseParam = searchParams.get('courseId');

            if (uniParam) {
                setSelectedUni(uniParam);
                const courseData = await getCourses(Number(uniParam)); // Assuming ID is number based on service signature
                setCourses(courseData);
                if (courseParam) setSelectedCourse(courseParam);
            }
        };
        loadData();
    }, [searchParams]);

    // Load courses when uni changes
    useEffect(() => {
        if (selectedUni) {
            getCourses(Number(selectedUni)).then(setCourses);
        } else {
            setCourses([]);
        }
    }, [selectedUni]);

    // --- Handlers ---

    const handlePersonalStep = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentStep('EMAIL');
    };

    const handleEmailStep = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // Check if email is associated with an Admin account
            const status = await authService.checkEmailStatus(email);

            if (status.exists && (status.role === UserRole.ADMIN || status.role === UserRole.SUPER_ADMIN)) {
                setIsAdminInvite(true);
                setCurrentStep('ADMIN_SETUP');
            } else {
                setIsAdminInvite(false);
                // If params were passed (came from Home), skip course select? 
                // Better to show it to confirm.
                setCurrentStep('COURSE_SELECT');
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleAdminActivation = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const success = await authService.activateAdmin(email, password, {
                name, dob, profession: role === 'Other' ? otherRole : role
            });
            if (success) {
                navigate('/admin');
            } else {
                setError("Failed to activate account.");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCourseSelection = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUni || !selectedCourse) {
            setError("Please select both a university and a course.");
            return;
        }
        setCurrentStep('SUBSCRIPTION');
    };

    const handleStudentSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            setLoading(false);
            return;
        }

        try {
            // Simulate Payment processing
            await new Promise(r => setTimeout(r, 1000));

            await authService.register(email, password, selectedUni, selectedCourse, {
                name, dob, profession: role === 'Other' ? otherRole : role, otherProfession: otherRole
            });

            navigate('/');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- Render Steps ---

    const renderPersonalStep = () => (
        <form onSubmit={handlePersonalStep} className="space-y-5 animate-fade-in">
            <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-2.5 border"
                        placeholder="John Doe"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="date"
                        required
                        value={dob}
                        onChange={e => setDob(e.target.value)}
                        className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-2.5 border"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">I am a...</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Briefcase className="h-4 w-4 text-gray-400" />
                    </div>
                    <select
                        value={role}
                        onChange={e => setRole(e.target.value as any)}
                        className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-2.5 border"
                    >
                        <option value="Student">Student</option>
                        <option value="Teacher">Teacher</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>
            {role === 'Other' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700">Please specify</label>
                    <input
                        type="text"
                        required
                        value={otherRole}
                        onChange={e => setOtherRole(e.target.value)}
                        className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-lg p-2.5 border"
                        placeholder="e.g. Researcher"
                    />
                </div>
            )}
            <button type="submit" className="w-full flex justify-center items-center gap-2 bg-primary-600 text-white rounded-lg py-3 hover:bg-primary-700 font-bold">
                Next Step <ArrowRight className="w-4 h-4" />
            </button>
        </form>
    );

    const renderEmailStep = () => (
        <form onSubmit={handleEmailStep} className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <Mail className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">What's your email?</h3>
                <p className="text-sm text-gray-500">We'll check if you have an invite.</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-lg p-3 border"
                    placeholder="you@example.com"
                />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white rounded-lg py-3 hover:bg-primary-700 font-bold disabled:opacity-50">
                {loading ? 'Checking System...' : 'Continue'}
            </button>
            <button type="button" onClick={() => setCurrentStep('PERSONAL')} className="w-full text-gray-500 text-sm py-2 hover:text-gray-700">Back</button>
        </form>
    );

    const renderAdminSetup = () => (
        <form onSubmit={handleAdminActivation} className="space-y-6 animate-fade-in">
            <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl flex items-start gap-3">
                <Shield className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                    <h4 className="font-bold text-purple-900 text-sm">Admin Invite Found</h4>
                    <p className="text-xs text-purple-700 mt-1">
                        Welcome, {name || 'User'}. You have been appointed as an administrator. Please set your secure password to activate your account.
                    </p>
                </div>
            </div>

            {/* Fallback Inputs if name/dob is missing (e.g. fresh reload) */}
            {!name && (
                <div className="space-y-4 pt-2 border-t border-purple-100">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Confirm Full Name</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-3 border"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                        <input
                            type="date"
                            required
                            value={dob}
                            onChange={e => setDob(e.target.value)}
                            className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-lg p-3 border"
                        />
                    </div>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700">Create Password</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-3 border"
                        placeholder="Minimum 6 characters"
                    />
                </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-purple-600 text-white rounded-lg py-3 hover:bg-purple-700 font-bold disabled:opacity-50">
                {loading ? 'Activating...' : 'Activate Account & Login'}
            </button>
        </form>
    );

    const renderCourseSelect = () => (
        <form onSubmit={handleCourseSelection} className="space-y-6 animate-fade-in">
            <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900">Find your Content</h3>
                <p className="text-sm text-gray-500">Select your university course to continue.</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
                <select
                    className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-3 border"
                    value={selectedUni}
                    onChange={e => {
                        setSelectedUni(e.target.value);
                        setSelectedCourse('');
                    }}
                    required
                >
                    <option value="">Select University</option>
                    {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <select
                    className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-3 border"
                    value={selectedCourse}
                    onChange={e => setSelectedCourse(e.target.value)}
                    disabled={!selectedUni}
                    required
                >
                    <option value="">Select Course</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            <button type="submit" className="w-full bg-primary-600 text-white rounded-lg py-3 hover:bg-primary-700 font-bold">
                Continue to Subscription
            </button>
        </form>
    );

    const renderSubscription = () => (
        <form onSubmit={handleStudentSignup} className="space-y-6 animate-fade-in">
            <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-green-900">Premium Student Plan</h4>
                    <span className="bg-green-200 text-green-800 text-xs font-bold px-2 py-1 rounded">£9.99/mo</span>
                </div>
                <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
                    <li>Access all notes & past papers</li>
                    <li>Unlimited AI Tutor chat</li>
                    <li>Flashcard generator</li>
                </ul>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Details</label>
                <div className="space-y-3">
                    <div className="relative">
                        <CreditCard className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Card Number"
                            value={cardNumber}
                            onChange={e => setCardNumber(e.target.value)}
                            className="pl-10 block w-full border-gray-300 rounded-lg p-3 border focus:ring-primary-500 focus:border-primary-500"
                            maxLength={19}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="text"
                            placeholder="MM/YY"
                            value={expiry}
                            onChange={e => setExpiry(e.target.value)}
                            className="block w-full border-gray-300 rounded-lg p-3 border focus:ring-primary-500 focus:border-primary-500"
                            maxLength={5}
                        />
                        <input
                            type="text"
                            placeholder="CVC"
                            value={cvc}
                            onChange={e => setCvc(e.target.value)}
                            className="block w-full border-gray-300 rounded-lg p-3 border focus:ring-primary-500 focus:border-primary-500"
                            maxLength={3}
                        />
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Set Password</label>
                <input
                    type="password"
                    required
                    placeholder="Create a secure password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="block w-full border-gray-300 rounded-lg p-3 border focus:ring-primary-500 focus:border-primary-500"
                    minLength={6}
                />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white rounded-lg py-3 hover:bg-primary-700 font-bold shadow-lg shadow-primary-200 disabled:opacity-70">
                {loading ? 'Processing...' : 'Pay & Create Account'}
            </button>
        </form>
    );

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="bg-white p-3 rounded-xl shadow-md">
                        <GraduationCap className="h-10 w-10 text-primary-600" />
                    </div>
                </div>
                <h2 className="text-center text-3xl font-extrabold text-gray-900">
                    {currentStep === 'PERSONAL' && 'Tell us about yourself'}
                    {currentStep === 'EMAIL' && 'Your Contact Info'}
                    {currentStep === 'ADMIN_SETUP' && 'Activate Admin Account'}
                    {currentStep === 'COURSE_SELECT' && 'Select Your Course'}
                    {currentStep === 'SUBSCRIPTION' && 'Complete Subscription'}
                </h2>

                {/* Progress Dots */}
                <div className="flex justify-center gap-2 mt-4">
                    {['PERSONAL', 'EMAIL', 'COURSE_SELECT', 'SUBSCRIPTION'].map((step, idx) => (
                        <div
                            key={step}
                            className={`h-2 w-2 rounded-full transition-all ${
                                // Simple logic for progress bar visualization
                                (step === currentStep) ||
                                    (step === 'PERSONAL' && currentStep !== 'PERSONAL') ||
                                    (step === 'EMAIL' && (currentStep === 'COURSE_SELECT' || currentStep === 'SUBSCRIPTION' || currentStep === 'ADMIN_SETUP')) ||
                                    (step === 'COURSE_SELECT' && currentStep === 'SUBSCRIPTION')
                                    ? 'bg-primary-600 w-6' : 'bg-gray-200'
                                }`}
                        />
                    ))}
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100 relative overflow-hidden">

                    {error && (
                        <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-100 flex items-center gap-2">
                            <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                            {error}
                        </div>
                    )}

                    {currentStep === 'PERSONAL' && renderPersonalStep()}
                    {currentStep === 'EMAIL' && renderEmailStep()}
                    {currentStep === 'ADMIN_SETUP' && renderAdminSetup()}
                    {currentStep === 'COURSE_SELECT' && renderCourseSelect()}
                    {currentStep === 'SUBSCRIPTION' && renderSubscription()}

                </div>

                <div className="mt-6 text-center">
                    {currentStep === 'PERSONAL' && (
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <span
                                onClick={() => navigate('/login')}
                                className="font-medium text-primary-600 hover:text-primary-500 cursor-pointer"
                            >
                                Sign in
                            </span>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
