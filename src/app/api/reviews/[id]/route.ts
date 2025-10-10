import { NextRequest } from 'next/server';
import { deleteReview } from '../../../../lib/reviews';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  const ok = await deleteReview(id);
  return new Response(JSON.stringify({ success: ok }), {
    status: ok ? 200 : 404,
    headers: { 'Content-Type': 'application/json' },
  });
}
