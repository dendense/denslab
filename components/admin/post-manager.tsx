"use client";

import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { deletePost } from "@/app/admin/actions";
import { PostForm } from "@/components/admin/post-form";
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
      <section className="border-brutal bg-canvas p-4 shadow-brutal-sm sm:p-6">
        <header className="mb-5 flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold sm:text-xl">
            {mode.kind === "create" ? "New post" : "Edit post"}
          </h2>
          <button
            type="button"
            onClick={() => setMode({ kind: "list" })}
            aria-label="Close form"
            className="border-brutal-thin flex h-8 w-8 items-center justify-center brutal-press"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>

        <PostForm
          post={mode.kind === "edit" ? mode.post : undefined}
          onDone={() => setMode({ kind: "list" })}
          onCancel={() => setMode({ kind: "list" })}
        />
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold sm:text-xl">Posts</h2>
        <button
          type="button"
          onClick={() => setMode({ kind: "create" })}
          className="border-brutal-thin inline-flex items-center gap-2 bg-accent px-3 py-2 font-display text-sm font-bold text-on-accent shadow-brutal-sm brutal-press"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New post
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="border-brutal-thin bg-canvas px-3 py-2 font-mono text-xs"
        >
          {error}
        </p>
      )}

      <ul className="space-y-2">
        {posts.map((row) => (
          <li
            key={row.id}
            className="border-brutal-thin flex flex-wrap items-center justify-between gap-3 bg-canvas p-3"
          >
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-bold sm:text-base">
                {row.title}
              </p>
              <p className="font-mono text-[11px]">{row.category}</p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  // The list row is trimmed for display; the form needs the full
                  // post, so it is refetched on the client before editing.
                  fetch(`/api/admin/post/${row.id}`)
                    .then((res) => res.json())
                    .then((full: Post) => setMode({ kind: "edit", post: full }))
                    .catch(() => setError("Could not load this post."));
                }}
                className="border-brutal-thin inline-flex items-center gap-1.5 px-3 py-1.5 font-display text-xs font-bold brutal-press"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                Edit
              </button>

              <button
                type="button"
                onClick={() => setPendingDelete(row)}
                className="border-brutal-thin inline-flex items-center gap-1.5 px-3 py-1.5 font-display text-xs font-bold brutal-press"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {pendingDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-delete-heading"
          className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/80 p-4"
        >
          <div className="border-brutal w-full max-w-md bg-canvas p-5 shadow-brutal-lg sm:p-6">
            <h3
              id="confirm-delete-heading"
              className="font-display text-xl font-bold"
            >
              Delete this post?
            </h3>
            <p className="mt-2 font-mono text-xs leading-relaxed">
              &ldquo;{pendingDelete.title}&rdquo; will be removed permanently.
              This cannot be undone.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                aria-busy={deleting}
                className="border-brutal-thin inline-flex items-center gap-2 bg-accent px-4 py-2 font-display text-sm font-bold text-on-accent shadow-brutal-sm brutal-press disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting && (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                )}
                Yes, delete
              </button>

              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="border-brutal-thin px-4 py-2 font-display text-sm font-bold brutal-press"
              >
                Keep it
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
