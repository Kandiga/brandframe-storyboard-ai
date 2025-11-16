import React from 'react';
import { Storyboard } from '../types';

interface StoryWorldPanelProps {
  storyboard: Storyboard | null;
}

const StoryWorldPanel: React.FC<StoryWorldPanelProps> = ({ storyboard }) => {
  if (!storyboard?.storyWorld) {
    return null;
  }

  const sw = storyboard.storyWorld;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <h2 className="text-2xl font-bold text-gray-900">Story-World Blueprint</h2>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-2">Premise / Logline</h3>
          <p className="text-gray-800 leading-relaxed">{sw.premise}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-2">Theme</h3>
          <p className="text-gray-700 leading-relaxed">{sw.theme}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-2">Three-Act Structure</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-bold text-blue-900 mb-2">Act 1: Setup</h4>
              <p className="text-sm text-blue-800">{sw.structure.act1}</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <h4 className="font-bold text-amber-900 mb-2">Act 2: Confrontation</h4>
              <p className="text-sm text-amber-800">{sw.structure.act2}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-bold text-green-900 mb-2">Act 3: Resolution</h4>
              <p className="text-sm text-green-800">{sw.structure.act3}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-2">Structural Attractors</h3>
          <div className="flex flex-wrap gap-2">
            {sw.structure.attractors.map((attractor, idx) => (
              <span
                key={idx}
                className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                {attractor}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-2">Character Blueprint</h3>
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
            {sw.characterBlueprint}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-2">Internal Conflict</h3>
            <p className="text-gray-700 text-sm leading-relaxed bg-red-50 p-3 rounded-lg">
              {sw.coreConflict.internal}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-2">External Conflict</h3>
            <p className="text-gray-700 text-sm leading-relaxed bg-orange-50 p-3 rounded-lg">
              {sw.coreConflict.external}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-2">World Boundaries</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="border-l-4 border-blue-500 pl-3">
              <h4 className="text-xs font-bold text-gray-600 uppercase mb-1">Spatial Logic</h4>
              <p className="text-sm text-gray-700">{sw.boundaries.spatial}</p>
            </div>
            <div className="border-l-4 border-green-500 pl-3">
              <h4 className="text-xs font-bold text-gray-600 uppercase mb-1">Temporal Logic</h4>
              <p className="text-sm text-gray-700">{sw.boundaries.temporal}</p>
            </div>
            <div className="border-l-4 border-amber-500 pl-3">
              <h4 className="text-xs font-bold text-gray-600 uppercase mb-1">Historical Setting</h4>
              <p className="text-sm text-gray-700">{sw.boundaries.historical}</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-3">
              <h4 className="text-xs font-bold text-gray-600 uppercase mb-1">Visual Style</h4>
              <p className="text-sm text-gray-700">{sw.boundaries.visual}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryWorldPanel;
