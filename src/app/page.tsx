import { ChatInterface } from "@/components/configurator/ChatInterface";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      <ChatInterface />
    </div>
  );
}
