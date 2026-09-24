import { NextResponse, type NextRequest } from "next/server";
import { getViewer } from "@/lib/auth/viewer";
import { fetchPostByIdFresh } from "@/lib/posts-repository";

/**
 * Returns one post for the admin edit form. The list view only carries the
 * trimmed fields, so the form refetches the full record before editing.
 *
 * Admin-only: the role is re-checked here rather than trusting the page that
 * linked in.
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteContext<"/api/admin/post/[id]">,
) {
  const viewer = await getViewer();

  if (!viewer?.isAdmin) {
    return NextResponse.json({ error: "Not authorised." }, { status: 403 });
  }

  const { id } = await params;
  const post = await fetchPostByIdFresh(id);

  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  return NextResponse.json(post);
}
