"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator";
import { useSession, signIn } from "@/lib/auth-client";
import { toast } from "sonner";

export function CreatePlaylistDialog({
    children,
    onCreated,
}: {
    children: React.ReactNode;
    onCreated?: (course: any) => void;
}) {
    const router = useRouter();
    const { data, isPending } = useSession();
    const user = data?.user;

    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState("");
    const [level, setLevel] = useState("BEGINNER");
    const [visibility, setVisibility] = useState("PUBLIC");
    // const [urls, setUrls] = useState<string[]>([""]);
    const [submitting, setSubmitting] = useState(false);

    const reset = () => {
        setTitle("");
        setDescription("");
        setTags("");
        setLevel("BEGINNER");
        setVisibility("PUBLIC");
        // setUrls([""]);
    };

    // const handleAddUrl = () => setUrls((u) => [...u, ""]);
    // const handleRemoveUrl = (idx: number) => setUrls((u) => u.filter((_, i) => i !== idx));
    // const handleUrlChange = (idx: number, value: string) => setUrls((u) => u.map((v, i) => (i === idx ? value : v)));

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast("Please sign in to create a playlist");
            return;
        }
        if (!title.trim()) {
            toast("Title is required");
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch("/api/courses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title.trim(),
                    description,
                    tags: tags
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    level,
                    visibility,
                    creatorId: user.id,
                    creatorName: user.name ?? "User",
                    // youtubeUrls: urls.filter((u) => u && u.trim().length > 0),
                }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || "Failed to create course");
            }
            const { course } = await res.json();
            toast("Playlist created successfully");
            setOpen(false);
            reset();
            onCreated?.(course);
            router.refresh();
        } catch (err: any) {
            console.error(err);
            toast(err.message || "Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => {
            setOpen(o);
            if (o && !user && !isPending) {
                // Optional: prompt sign-in immediately
            }
        }}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Create a Playlist</DialogTitle>
                    <DialogDescription>Add a title and optional YouTube URLs to build your learning path.</DialogDescription>
                </DialogHeader>

                {!isPending && !user ? (
                    <div className="space-y-4">
                        <p className="text-sm">You need to sign in to create a playlist.</p>
                        <Button onClick={() => signIn.social({ provider: "google" })}>Sign in with Google</Button>
                    </div>
                ) : (
                    <form onSubmit={onSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Title</label>
                            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="JavaScript for Complete Beginners" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A curated path to learn JS from scratch" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Level</label>
                                <Select value={level} onValueChange={setLevel} >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="BEGINNER">Beginner</SelectItem>
                                        <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                                        <SelectItem value="ADVANCED">Advanced</SelectItem>
                                        <SelectItem value="EXPERT">Expert</SelectItem>
                                    </SelectContent>
                                </Select>

                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Visibility</label>
                                <Select value={visibility} onValueChange={setVisibility}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select visibility" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PUBLIC">Public</SelectItem>
                                        <SelectItem value="UNLISTED">Unlisted</SelectItem>
                                        <SelectItem value="PRIVATE">Private</SelectItem>
                                    </SelectContent>
                                </Select>

                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tags (comma separated)</label>
                            <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="beginner, javascript, web" />
                        </div>

                        {/* <Separator />

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">YouTube Video URLs</label>
                                <Button type="button" variant="secondary" onClick={handleAddUrl}>
                                    + Add URL
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {urls.map((u, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <Input
                                            value={u}
                                            onChange={(e) => handleUrlChange(idx, e.target.value)}
                                            placeholder="https://www.youtube.com/watch?v=..."
                                        />
                                        {urls.length > 1 && (
                                            <Button type="button" variant="destructive" onClick={() => handleRemoveUrl(idx)}>
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div> */}

                        <div className="pt-2 flex gap-3 justify-end">
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? "Creating..." : "Create Playlist"}
                            </Button>
                        </div>
                    </form>
                )}

            </DialogContent>
        </Dialog>
    );
}
