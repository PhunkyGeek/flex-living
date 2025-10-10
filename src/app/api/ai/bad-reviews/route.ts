import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

type Review = {
	id: number | string;
	rating?: number | null;
	publicReview?: string | null;
	submittedAt?: string;
	guestName?: string;
	listingName?: string;
	approved?: boolean;
	[k: string]: any;
};

async function heuristic(reviews: Review[]) {
	const keywords = ['dirty', 'smell', 'broken', 'damage', 'late', 'rude', 'noise', 'cancel', 'unreliable', 'wifi', 'smelly'];
	const issues = reviews.filter((r) => {
		const rating = r.rating ?? null;
		const text = (r.publicReview || '').toLowerCase();
		const hasKeyword = keywords.some((k) => text.includes(k));
		return (rating != null && rating <= 2) || hasKeyword;
	});
	return issues;
}

export async function GET() {
	try {
		const file = path.join(process.cwd(), 'data', 'reviews.json');
		const raw = await readFile(file, 'utf-8');
		const reviews: Review[] = JSON.parse(raw || '[]');

		const key = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY?.trim();

		// If no key, return heuristic results immediately
		if (!key) {
			const issues = await heuristic(reviews);
			return NextResponse.json({ source: 'heuristic', issues });
		}

		// Build a compact prompt listing each review
		const items = reviews.map((r) => ({ id: r.id, rating: r.rating ?? null, text: (r.publicReview || '').replace(/\n/g, ' ') }));
		const promptLines = [
			'You are an assistant that detects "bad" guest reviews (complaints, negative sentiment, issues that require host attention).',
			'Given the following array of reviews (id, rating, text), return a JSON object with key "badReviews" containing an array of objects {id: number, reason: string}.',
			'Only return valid JSON and nothing else (no explanation). If uncertain, include the review but mark reason as "unclear".',
			'Reviews:',
			JSON.stringify(items),
		].join('\n');

		// Call Gemini / Generative API (best-effort endpoint). This may need
		// adjustment depending on your Google Cloud project and regional endpoint.
		const endpoint = process.env.GEMINI_API_URL || 'https://generativeai.googleapis.com/v1beta2/models/gemini-1.0:generate';

		try {
			const resp = await fetch(endpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${key}`,
				},
				body: JSON.stringify({
					prompt: { text: promptLines },
					maxOutputTokens: 800,
				}),
			});

			if (!resp.ok) {
				// fallback to heuristic
				const issues = await heuristic(reviews);
				return NextResponse.json({ source: 'heuristic', issues, warning: `AI request failed with status ${resp.status}` }, { status: 200 });
			}

			const json = await resp.json();

			// Try several places where model output may live
			let textOut: string | null = null;
			if (json?.candidates && Array.isArray(json.candidates) && json.candidates[0]?.content) {
				// older generative API shape
				const content = json.candidates[0].content;
				if (Array.isArray(content) && content[0]?.text) textOut = content[0].text;
			}
			if (!textOut && json?.output && Array.isArray(json.output) && json.output[0]?.content) {
				const c = json.output[0].content;
				if (Array.isArray(c) && c[0]?.text) textOut = c[0].text;
			}
			if (!textOut && typeof json?.text === 'string') {
				textOut = json.text;
			}

			// If still no structured text, try resp as string
			if (!textOut) {
				try {
					const txt = await resp.text();
					textOut = txt;
				} catch (e) {
					textOut = null;
				}
			}

			if (!textOut) {
				const issues = await heuristic(reviews);
				return NextResponse.json({ source: 'heuristic', issues, warning: 'AI returned no text' }, { status: 200 });
			}

			// Extract JSON substring if the model returned extra content
			let parsed: any = null;
			try {
				parsed = JSON.parse(textOut);
			} catch (e) {
				// attempt to find a JSON object inside the text
				const m = textOut.match(/\{[\s\S]*\}/m);
				if (m) {
					try {
						parsed = JSON.parse(m[0]);
					} catch (e) {
						parsed = null;
					}
				}
			}

			if (!parsed || !Array.isArray(parsed.badReviews)) {
				const issues = await heuristic(reviews);
				return NextResponse.json({ source: 'heuristic', issues, warning: 'AI output not parsable' }, { status: 200 });
			}

			// Map bad ids to full review objects (preserve fields)
			const badIds = new Set(parsed.badReviews.map((b: any) => String(b.id)));
			const issues = reviews.filter((r) => badIds.has(String(r.id))).map((r) => {
				const reasonObj = (parsed.badReviews.find((b: any) => String(b.id) === String(r.id)) || {}).reason || '';
				return { ...r, aiReason: reasonObj };
			});

			return NextResponse.json({ source: 'ai', issues });
		} catch (e) {
			const issues = await heuristic(reviews);
			return NextResponse.json({ source: 'heuristic', issues, warning: 'AI request threw an error' }, { status: 200 });
		}
	} catch (e) {
		return NextResponse.json({ source: 'error', message: 'failed to read reviews' }, { status: 500 });
	}
}
