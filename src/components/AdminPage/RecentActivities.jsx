const RecentActivities = () => {
  const activities = [
    '12:00 PM - Conference Room B Ready (10 AM)',
    '11:30 AM - Room B set for 10 AM meeting, with AV and refreshments.',
    '11:00 AM - Room 204 cleaned and prepped for new guests.',
    '10:30 AM - Maintenance logged: Toilet issue in Room 109.',
    '10:00 AM - Angus Copper checked in, guest key issued.'
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Recent Activities</h2>
        <button className="text-sm text-gray-500">Popular</button>
      </div>
      <ul className="text-sm text-gray-700 space-y-2">
        {activities.map((a, i) => (
          <li key={i} className="border-l-4 border-blue-500 pl-3">{a}</li>
        ))}
      </ul>
    </div>
  );
};

export default RecentActivities;
