const SummaryCard = ({ title, value, color }) => {
  const colors = {
    red: "border-red-500 text-red-600",
    yellow: "border-yellow-500 text-yellow-600",
    green: "border-green-500 text-green-600",
    blue: "border-blue-500 text-blue-600",
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-md p-16 border-l-4 ${colors[color]} hover:shadow-lg transition`}
    >
      <h3 className="text-sm text-gray-500">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
};
export default SummaryCard; 