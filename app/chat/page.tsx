import { AuthGuard } from "@/components/auth-guard";
import { ChatWorkspace } from "@/components/chat-workspace";

export default function ChatPage() {
  return (
    // <AuthGuard>
      <ChatWorkspace />
    // </AuthGuard>
  );
}
