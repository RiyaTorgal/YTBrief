const StatsRow = ({ icon, label, value }) => (
  <div className="flex items-center space-x-3">
    <span className="text-xl">{icon}</span>
    <span className="text-lg">{label}:</span>
    <span className="text-lg">{value}</span>
  </div>
);

export default StatsRow;