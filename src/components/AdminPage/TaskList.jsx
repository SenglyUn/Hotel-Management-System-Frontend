const TaskList = () => {
  const tasks = [
    { date: 'June 19, 2028', title: 'Prepare Conference Room B (10 AM)', status: 'Completed', color: 'purple-500' },
    { date: 'June 19, 2028', title: 'Restock 3rd Floor Supplies (Housekeeping)', status: 'In Progress', color: 'blue-400' },
    { date: 'June 20, 2028', title: 'Inspect and Clean Pool Area (11 AM)', status: 'Pending', color: 'gray-300' },
    { date: 'June 20, 2028', title: 'Check-In Assistance During Peak Hours (4 PM - 6 PM)', status: 'Pending', color: 'gray-300' }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Tasks</h2>
        <button className="text-blue-500 font-medium">+</button>
      </div>
      <ul className="space-y-2">
        {tasks.map((task, idx) => (
          <li key={idx} className={`p-3 rounded-lg bg-${task.color} text-white text-sm`}>
            {task.date}: {task.title} ({task.status})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
