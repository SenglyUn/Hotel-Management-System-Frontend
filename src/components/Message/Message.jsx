import React, { useState } from "react";

const MessagePage = () => {
  const messages = [
    { id: 1, name: "Alice Johnson", message: "Requesting late check-out for Room 305.", time: "09:15 AM", avatar: "https://i.pravatar.cc/150?img=1" },
    { id: 2, name: "Michael Brown", message: "Reports air conditioning issue.", time: "09:30 AM", avatar: "https://i.pravatar.cc/150?img=2" },
    { id: 3, name: "Emily Davis", message: "Requests confirmation for airport pickup.", time: "09:45 AM", avatar: "https://i.pravatar.cc/150?img=3" },
    { id: 4, name: "John Doe", message: "Needs extra towels and pillows.", time: "10:00 AM", avatar: "https://i.pravatar.cc/150?img=4" },
    { id: 5, name: "Jane Smith", message: "Asks if breakfast is included.", time: "10:15 AM", avatar: "https://i.pravatar.cc/150?img=5" },
  ];

  const [selected, setSelected] = useState(messages[0]);
  const [chat, setChat] = useState([
    { from: "user", text: "Can I request a late check-out for Room 305?", time: "9:15 AM" },
    { from: "admin", text: "Hi Alice, we can accommodate a late check-out. How late would you like to stay?", time: "9:20 AM" },
    { from: "user", text: "I was hoping to stay until 2 PM. Is that possible?", time: "9:22 AM" },
    { from: "admin", text: "Let me check the availability for Room 305. One moment, please.", time: "9:25 AM" },
    { from: "admin", text: "Good news, Alice! We can extend your check-out time to 2 PM.", time: "9:30 AM" },
    { from: "user", text: "Thank you so much! That really helps.", time: "9:32 AM" },
    { from: "admin", text: "You're welcome! If you need anything else, feel free to let us know.", time: "9:35 AM" },
  ]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r p-4">
        <h2 className="text-lg font-bold mb-4">Messages</h2>
        <div className="space-y-2 overflow-y-auto h-[calc(100vh-100px)]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-lg cursor-pointer flex gap-3 items-start ${selected.id === msg.id ? "bg-blue-100" : "hover:bg-gray-100"}`}
              onClick={() => setSelected(msg)}
            >
              <img src={msg.avatar} alt={msg.name} className="w-10 h-10 rounded-full" />
              <div>
                <div className="font-semibold text-sm text-gray-800">{msg.name}</div>
                <div className="text-xs text-gray-500 truncate w-40">{msg.message}</div>
                <div className="text-xs text-gray-400 mt-1">{msg.time}</div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Chat */}
      <main className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b bg-white flex items-center justify-between">
          <div className="flex gap-4 items-center">
            <img src={selected.avatar} alt={selected.name} className="w-10 h-10 rounded-full" />
            <div>
              <h3 className="font-semibold text-lg text-gray-800">{selected.name}</h3>
              <p className="text-sm text-gray-400">last seen recently</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search message"
              className="border px-3 py-1.5 text-sm rounded-md w-60"
            />
            <button className="p-2 bg-gray-100 rounded-md hover:bg-gray-200">
              {/* Filter Icon (SVG) */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2l-6 7v5l-4 2v-7L3 6V4z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Chat Body */}
        <div className="flex-1 p-6 overflow-y-auto bg-white">
          <div className="space-y-4 max-w-2xl mx-auto">
            {chat.map((c, idx) => (
              <div key={idx} className={`flex ${c.from === "admin" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`px-4 py-2 rounded-lg max-w-[80%] text-sm ${
                    c.from === "admin"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p>{c.text}</p>
                  <div className="text-xs text-right mt-1 text-gray-300">{c.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t bg-white">
          <input
            type="text"
            placeholder="Type your message..."
            className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring"
          />
        </div>
      </main>
    </div>
  );
};

export default MessagePage;
