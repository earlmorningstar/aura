import type { Metadata } from "next";
import { SettingsContent } from "./settings-content";

export const metadata: Metadata = {
    title: "Settings",
    description: "Manage your Aura account and preferences.",
};

export default function SettingsPage() {
    return <SettingsContent />;
}