import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";
import { IconCircle } from "@/components/ui/icon-circle";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  profileUpdate?: any;
  profileUpdateIsValid?: boolean;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  // Don't render empty messages - they show as typing indicator instead
  if (!message.content || message.content.trim() === "") {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
    >
      <IconCircle
        variant={message.role === "assistant" ? "match" : "primary"}
        size="sm"
      >
        {message.role === "assistant" ? (
          <Bot className="w-4 h-4 text-match-foreground" />
        ) : (
          <User className="w-4 h-4 text-primary-foreground" />
        )}
      </IconCircle>
      <div
        className={`max-w-[80%] p-3 rounded-2xl ${
          message.role === "assistant"
            ? "bg-secondary text-secondary-foreground rounded-tl-sm"
            : "gradient-primary text-primary-foreground rounded-tr-sm"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
    </motion.div>
  );
};

export const TypingIndicator = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
      <IconCircle variant="match" size="sm">
        <Bot className="w-4 h-4 text-match-foreground" />
      </IconCircle>
      <div className="bg-secondary p-3 rounded-2xl rounded-tl-sm">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-muted-foreground rounded-full"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};
