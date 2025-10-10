import { NextRequest } from 'next/server';
import { toggleApprove } from '@/lib/reviews';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  let approved: boolean | undefined = undefined;
  try {
    const body = await req.json();
    if (typeof body?.approved === 'boolean') {
      approved = body.approved;
    }
  } catch (e) {
    // ignore JSON parse errors
  }
  const result = await toggleApprove(id, approved);
  return new Response(JSON.stringify({ success: result.success, approved: result.approved }), {
    status: result.success ? 200 : 404,
    headers: { 'Content-Type': 'application/json' },
  });
}