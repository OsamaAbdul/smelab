import { useState } from "react";
import { Button } from "@/components/ui/button";

const SocialMediaScheduler = () => {
  const [post, setPost] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");

  const handleSchedule = () => {
    alert(`Post scheduled for ${scheduleDate}!\nContent: ${post}`);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-4">
      <h1 className="text-2xl font-bold">Social Media Scheduler</h1>
      <textarea
        placeholder="Write your post here..."
        className="w-full p-2 border rounded"
        value={post}
        onChange={(e) => setPost(e.target.value)}
      />
      <input
        type="datetime-local"
        className="w-full p-2 border rounded"
        value={scheduleDate}
        onChange={(e) => setScheduleDate(e.target.value)}
      />
      <Button onClick={handleSchedule} className="w-full">Schedule Post</Button>
    </div>
  );
};

export default SocialMediaScheduler;
