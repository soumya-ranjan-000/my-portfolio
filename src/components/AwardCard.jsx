// src/components/AwardCard.jsx
function AwardCard({ title, org, year, logo, description }) {

return (
    <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-1">
        <h3 className="text-lg font-semibold flex items-center gap-2">
            <img src={logo} alt={org} className="h-12 w-12 rounded-full mr-2" />
            {title}
        </h3>
        <p className="text-sm text-gray-500">{org} • {year}</p>
        <p className="mt-2 text-sm text-gray-700">{description}</p>
    </div>
);
}

export default AwardCard;
