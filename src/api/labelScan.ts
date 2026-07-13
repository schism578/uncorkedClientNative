import { ANTHROPIC_API_KEY } from '../config/secrets';

export interface ScannedWineData {
  winemaker: string | null;
  wine_type: string | null;
  wine_name: string | null;
  varietal: string | null;
  vintage: string | null;
  region: string | null;
  tasting_notes: string | null;
}

const SCAN_PROMPT = `You are a wine label reader. Extract information from this wine bottle label and return it as JSON with exactly these fields:

- winemaker: the winery or producer name
- wine_type: must be exactly one of: "sparkling", "white", "rose", "red" (lowercase, choose the closest match)
- wine_name: the name of the wine, not including the winery name
- varietal: the grape variety or varieties (e.g. "Cabernet Sauvignon" or "Chardonnay, Viognier")
- vintage: the vintage year as a string (e.g. "2019"), or "NV" for non-vintage
- region: the wine region, appellation, or country of origin
- tasting_notes: any tasting notes, flavor descriptors, or wine description printed on the label

Return ONLY valid JSON, no explanation or markdown. Use null for any field you cannot determine from the label.

Example: {"winemaker":"Jordan Winery","wine_type":"red","wine_name":"Cabernet Sauvignon","varietal":"Cabernet Sauvignon","vintage":"2019","region":"Alexander Valley, Sonoma County","tasting_notes":"Aromas of blackberry and cassis with hints of cedar"}`;

export async function scanWineLabel(base64Image: string): Promise<ScannedWineData> {
  const imageData = base64Image.replace(/^data:image\/\w+;base64,/, '');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: imageData,
              },
            },
            {
              type: 'text',
              text: SCAN_PROMPT,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`API error ${response.status}: ${error.error?.message ?? JSON.stringify(error)}`);
  }

  const data = await response.json();
  const raw: string = data.content?.[0]?.text ?? '';

  // Strip markdown code fences if Claude wrapped the JSON
  const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Could not parse label response. Raw: ${text.slice(0, 200)}`);
  }
}
