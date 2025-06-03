// AwardBadges.jsx
import React from 'react';

const awards = [
  'Habit Bearer Award 🎗️',
  'Victory League Award 🏆',
  'The Bright Beginning Award 🌟',
  'Inspiring Performance Award 🏅',
  'Habit Flagbearer - Demonstrating Stewardship Award 🏳️‍🌈',
];

function AwardBadges() {
return (
    <div
        className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center items-center w-72 sm:w-[80rem] mx-auto p-4"
        style={{ minHeight: '8rem' }}
    >
        {awards.map((award, idx) => (
            <span
                key={idx}
                className="inline-block border border-black-900 bg-stone-100 
                text-zinc-900 px-2 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold 
                shadow-xl transition-transform duration-200 hover:-translate-y-1 text-center
                hover:border-b-4 hover:border-b-blue-400"
                style={{
                    borderBottomWidth: '2px',
                    boxShadow: ' 0 2px 8px 0 rgba(77, 77, 77, 0.38)',
                }}
            >
                {award}
            </span>
        ))}
    </div>
);
}

export default AwardBadges;
