const StatsRow = ({ icon, label, value }) => (
  <div className="flex items-center space-x-3">
    <span >{icon}</span>
    <span className="text-xl font-bold">{label}:</span>
    <span className="text_tone text-xl font-bold">{value}</span>
  </div>
);

export default StatsRow;