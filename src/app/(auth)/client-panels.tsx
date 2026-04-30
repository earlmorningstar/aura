"use client";

import { AIChatPanel } from "@/components/ai/ai-chat-panel";
import { MobileQuickActions } from "@/components/layout/mobile-quick-actions";
import { NewWorkspaceModal } from "@/components/workspace/new-workspace-modal";
import { useUIStore } from "@/stores/ui-store";

export function ClientPanels() {
  const isAIOpen = useUIStore((s) => s.isAIOpen);
  const setAIOpen = useUIStore((s) => s.setAIOpen);

  return (
    <>
      <AIChatPanel isOpen={isAIOpen} onClose={() => setAIOpen(false)} />
      <MobileQuickActions />
            <NewWorkspaceModal />
    </>
  );
}