"use client";

import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { deletePost } from "@/app/admin/actions";
import { PostForm } from "@/components/admin/post-form";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { Post } from "@/lib/posts";

type Row = Pick<Post, "id" | "title" | "category" | "tags"> & {
  createdAt?: string;
};

export function PostManager({ posts }: { posts: Row[] }) {
  const [mode, setMode] = useState<
    { kind: "list" } | { kind: "create" } | { kind: "edit"; post: Post }
  >({ kind: "list" });
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmDelete() {
    if (!pendingDelete) return;

    setDeleting(true);
    setError(null);

    const result = await deletePost(pendingDelete.id);

    if (!result.ok) {
      setError(result.error);
      setDeleting(false);
      return;
    }

    setDeleting(false);
    setPendingDelete(null);
  }

  if (mode.kind === "create" || mode.kind === "edit") {
    return (
      <Card className="p-6">
        <CardHeader className="flex-row items-center justify-between space-y-0 p-0 pb-5">
          <CardTitle>
            {mode.kind === "create" ? "New post" : "Edit post"}
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setMode({ kind: "list" })}
            aria-label="Close form"
          >
            <X aria-hidden="true" />
          </Button>
        </CardHeader>

        <PostForm
          post={mode.kind === "edit" ? mode.post : undefined}
          onDone={() => setMode({ kind: "list" })}
          onCancel={() => setMode({ kind: "list" })}
        />
      </Card>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold sm:text-xl font-mono">Posts</h2>
        <Button type="button" onClick={() => setMode({ kind: "create" })}>
          <Plus aria-hidden="true" />
          New post
        </Button>
      </div>

      {error && (
        <p
          role="alert"
          className="bg-muted text-muted-foreground rounded-md px-3 py-2 text-sm"
        >
          {error}
        </p>
      )}

      <ul className="space-y-2">
        {posts.map((row) => (
          <li
            key={row.id}
            className="bg-card text-card-foreground flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium sm:text-base">
                {row.title}
              </p>
              <p className="text-muted-foreground text-sm">{row.category}</p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  // The list row is trimmed for display; the form needs the full
                  // post, so it is refetched on the client before editing.
                  fetch(`/api/admin/post/${row.id}`)
                    .then((res) => res.json())
                    .then((full: Post) => setMode({ kind: "edit", post: full }))
                    .catch(() => setError("Could not load this post."));
                }}
              >
                <Pencil aria-hidden="true" />
                Edit
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPendingDelete(row)}
              >
                <Trash2 aria-hidden="true" />
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {pendingDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-delete-heading"
          className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="bg-background w-full max-w-md rounded-lg border p-6 shadow-lg">
            <h3 id="confirm-delete-heading" className="text-lg font-semibold font-mono">
              Delete this post?
            </h3>
            <p className="text-muted-foreground mt-2 text-sm">
              &ldquo;{pendingDelete.title}&rdquo; will be removed permanently.
              This cannot be undone.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleting}
                aria-busy={deleting}
              >
                {deleting && <Loader2 className="animate-spin" aria-hidden="true" />}
                Yes, delete
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setPendingDelete(null)}
              >
                Keep it
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
