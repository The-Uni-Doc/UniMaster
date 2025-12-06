import React from 'react';
import { FileText, Download, Clock, Trash2, Pencil, Sparkles, BrainCircuit } from 'lucide-react';
import { Material, MaterialCategory } from '../types';

interface MaterialCardProps {
  material: Material;
  onDelete?: (id: string) => void;
  onEdit?: (material: Material) => void;
  onStudy?: (material: Material) => void;
  isAdmin?: boolean;
}

const getIcon = (category: MaterialCategory) => {
  switch (category) {
    case MaterialCategory.FLASHCARDS: return <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600"><BrainCircuit className="w-5 h-5" /></div>;
    case MaterialCategory.PAST_PAPERS: return <div className="p-2 bg-red-100 rounded-lg text-red-600"><FileText className="w-5 h-5" /></div>;
    default: return <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><FileText className="w-5 h-5" /></div>;
  }
};

export const MaterialCard: React.FC<MaterialCardProps> = ({ material, onDelete, onEdit, onStudy, isAdmin }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between h-full group hover:-translate-y-1">
      <div>
        <div className="flex justify-between items-start mb-3">
          {getIcon(material.category)}
          <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
            {material.category}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2 leading-tight" title={material.title}>
          {material.title}
        </h3>
        {material.description && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">
            {material.description}
          </p>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3">
        <div className="flex items-center text-xs text-gray-400 gap-1">
          <Clock className="w-3 h-3" />
          {new Date(material.uploadedAt).toLocaleDateString()}
        </div>
        
        <div className="flex gap-2 justify-between items-center">
            {/* Action Buttons */}
            <div className="flex gap-2 w-full">
                <a 
                    href={material.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-gray-700 hover:text-primary-600 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
                    title="Download/View"
                >
                    <Download className="w-3.5 h-3.5" />
                    View
                </a>

                {/* Study With AI Button - Only for Students/Viewers */}
                {!isAdmin && onStudy && (
                     <button 
                        onClick={() => onStudy(material)}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-lg transition-colors shadow-sm shadow-indigo-200"
                        title="Ask AI about this"
                     >
                        <Sparkles className="w-3.5 h-3.5" />
                        Study
                     </button>
                )}
            </div>
            
             {/* Admin Controls */}
             {(isAdmin && (onEdit || onDelete)) && (
                 <div className="flex gap-1 ml-2 border-l pl-2 border-gray-100">
                    {onEdit && (
                        <button 
                        onClick={() => onEdit(material)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit"
                        >
                        <Pencil className="w-4 h-4" />
                        </button>
                    )}

                    {onDelete && (
                        <button 
                        onClick={() => onDelete(material.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete"
                        >
                        <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                 </div>
             )}
        </div>
      </div>
    </div>
  );
};