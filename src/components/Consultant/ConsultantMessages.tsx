import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Send, User } from "lucide-react";
import supabase from "@/utils/supabase";
import { toast } from "sonner";

const ConsultantMessages = () => {
    const [conversations, setConversations] = useState<any[]>([]);
    const [activeChat, setActiveChat] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Fetch conversations (unique users who have messaged or been messaged)
    // This is a simplified version. In a real app, you'd have a 'conversations' table or complex query.
    // For now, we'll just list users from profiles who have role='user' as a mock contact list
    const fetchContacts = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setCurrentUserId(user.id);

        // Fetch users who have businesses (likely clients)
        const { data } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, email")
            .eq("role", "user")
            .limit(20); // Limit for demo

        setConversations(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchMessages = async (userId: string) => {
        if (!currentUserId) return;

        const { data } = await supabase
            .from("messages")
            .select("*")
            .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${currentUserId})`)
            .order("created_at", { ascending: true });

        setMessages(data || []);
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !activeChat || !currentUserId) return;
        setSending(true);

        const { error } = await supabase.from("messages").insert({
            sender_id: currentUserId,
            receiver_id: activeChat.id,
            content: newMessage
        });

        if (error) {
            toast.error("Failed to send");
        } else {
            setNewMessage("");
            fetchMessages(activeChat.id);
        }
        setSending(false);
    };

    return (
        <div className="flex h-[calc(100vh-100px)] gap-6">
            {/* Sidebar List */}
            <div className="w-1/3 bg-white rounded-xl shadow overflow-hidden flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="font-bold text-lg">Messages</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center"><Loader2 className="animate-spin mx-auto" /></div>
                    ) : (
                        conversations.map((user) => (
                            <div
                                key={user.id}
                                onClick={() => { setActiveChat(user); fetchMessages(user.id); }}
                                className={`p-4 border-b cursor-pointer hover:bg-gray-50 flex items-center gap-3 ${activeChat?.id === user.id ? "bg-blue-50" : ""}`}
                            >
                                <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                    <User className="text-gray-500" />
                                </div>
                                <div>
                                    <p className="font-medium">{user.first_name} {user.last_name}</p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-white rounded-xl shadow flex flex-col">
                {activeChat ? (
                    <>
                        <div className="p-4 border-b flex items-center gap-3">
                            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="text-blue-600 h-4 w-4" />
                            </div>
                            <span className="font-bold">{activeChat.first_name} {activeChat.last_name}</span>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
                            {messages.length === 0 ? (
                                <div className="text-center text-gray-400 mt-10">No messages yet. Start the conversation!</div>
                            ) : (
                                messages.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.sender_id === currentUserId ? "justify-end" : "justify-start"}`}>
                                        <div className={`max-w-[70%] p-3 rounded-lg text-sm ${msg.sender_id === currentUserId
                                                ? "bg-blue-600 text-white rounded-br-none"
                                                : "bg-white border text-gray-800 rounded-bl-none"
                                            }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-4 border-t bg-white flex gap-2">
                            <Input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                            />
                            <Button onClick={handleSendMessage} disabled={sending || !newMessage.trim()}>
                                {sending ? <Loader2 className="animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        Select a contact to start messaging
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConsultantMessages;
