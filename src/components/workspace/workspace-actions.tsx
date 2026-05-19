"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ConfirmDialog } from "../ui/confirm-dialog";

interface Props {
    workspace: { slug: string; name: string };
    onClose: () => void;
}

export function WorkspaceActions({ workspace, onClose }: Props) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [newName, setNewName] = useState(workspace.name);
    const queryClient = useQueryClient();
    const { currentWorkspace, setWorkspace } = useWorkspaceStore();


    const handleRename = async () => {
        const trimmed = newName.trim();
        if (!trimmed || trimmed === workspace.name) return;
        const newSlug = trimmed
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");

        const { error } = await supabase
            .from("workspaces")
            .update({ name: trimmed, slug: newSlug })
            .eq("slug", workspace.slug);

        if (error) {
            console.error("Rename error:", error.message);
            alert("Could not rename: " + error.message);
            return;
        }

        await queryClient.invalidateQueries({ queryKey: ["workspaces"] });
        if (currentWorkspace === workspace.slug) {
            setWorkspace(newSlug);
        }
        setEditing(false);
        onClose();
    };

    return (
        <div className="relative">
            <button
                className="p-1 rounded-md hover:bg-white/10 text-white/40"
                onClick={() => setOpen(!open)}
            >
                <MoreHorizontal size={14} />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        className="absolute right-0 top-8 w-44 rounded-xl bg-black/90 border border-white/10 backdrop-blur p-1 z-50"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        {!editing ? (
                            <>
                                <button
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 rounded-lg flex items-center gap-2 text-white/80"
                                    onClick={() => setEditing(true)}
                                >
                                    <Pencil size={14} /> Rename
                                </button>
                                <button
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-red-500/10 rounded-lg flex items-center gap-2 text-red-400"
                                    onClick={() => setConfirmDelete(true)}
                                >
                                    <Trash2 size={14} /> Delete
                                </button>
                            </>
                        ) : (
                            <div className="p-2">
                                <input
                                    type="text"
                                    className="input text-xs w-full mb-2"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <button
                                        className="text-xs bg-white/10 px-2 py-1 rounded hover:bg-white/20 text-white"
                                        onClick={handleRename}
                                    >
                                        Save
                                    </button>
                                    <button
                                        className="text-xs bg-white/5 px-2 py-1 rounded hover:bg-white/10 text-white/60"
                                        onClick={() => setEditing(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
            <ConfirmDialog
                open={confirmDelete}
                title="Delete workspace?"
                message={`Are you sure you want to delete "${workspace.name}"? This action cannot be undone.`}
                confirmLabel="Delete"
                onConfirm={async () => {
                    await supabase.from("workspaces").delete().eq("slug", workspace.slug);
                    await queryClient.invalidateQueries({ queryKey: ["workspaces"] });
                    if (currentWorkspace === workspace.slug) setWorkspace("personal");
                    setConfirmDelete(false);
                    onClose();
                }}
                onCancel={() => setConfirmDelete(false)}
            />
        </div>
    );
}