import { eq, and, asc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { episodes, panels, projects, scripts, styleTemplates, characters, scenes } from '../db/schema.js';

interface BreakdownPanel {
  panelNumber: number;
  description: string;
  dialogue: string;
  imagePrompt: string;
  videoPrompt: string;
}

interface BreakdownCharacter {
  name: string;
  gender: string;
  age: string;
  appearanceDescription: string;
}

interface BreakdownScene {
  name: string;
  description: string;
  styleKeywords: string;
}

interface BreakdownResult {
  panels: BreakdownPanel[];
  characters: BreakdownCharacter[];
  scenes: BreakdownScene[];
}

async function callGeminiBreakdown(
  scriptContent: string,
  templatePrompt: string,
): Promise<BreakdownResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const prompt = `${templatePrompt || 'You are a professional storyboard artist. Analyze the following script and break it down into panels with detailed visual descriptions, dialogue, and image/video generation prompts.'}

For each panel, provide:
1. panelNumber (integer, starting at 1)
2. description (a visual description for the artist, in Chinese)
3. dialogue (any dialogue in this panel, or empty string)
4. imagePrompt (a Stable Diffusion / image generation prompt describing the exact visual composition, character positions, camera angle, lighting, mood, in English)
5. videoPrompt (a video generation prompt describing camera movement and action in the scene, in English)

Also extract:
- characters: list of characters with name, gender (男/女/其他), age, and appearanceDescription (detailed visual description in Chinese)
- scenes: list of scenes with name, description (in Chinese), and styleKeywords (comma-separated English keywords)

Respond ONLY with valid JSON in this exact format:
{
  "panels": [
    {
      "panelNumber": 1,
      "description": "...",
      "dialogue": "...",
      "imagePrompt": "...",
      "videoPrompt": "..."
    }
  ],
  "characters": [
    {
      "name": "...",
      "gender": "男",
      "age": "25",
      "appearanceDescription": "..."
    }
  ],
  "scenes": [
    {
      "name": "...",
      "description": "...",
      "styleKeywords": "..."
    }
  ]
}

Script to analyze:
${scriptContent.substring(0, 60000)}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        },
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${errorText}`);
  }

  const data = await response.json() as any;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('Empty response from Gemini API');
  }

  // Extract JSON from response (may be wrapped in markdown code blocks)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse JSON from Gemini response');
  }

  const parsed = JSON.parse(jsonMatch[0]) as BreakdownResult;

  if (!parsed.panels || !Array.isArray(parsed.panels)) {
    throw new Error('Invalid breakdown response: missing panels array');
  }

  return parsed;
}

export async function breakdownEpisode(
  projectId: number,
  episodeId: number,
): Promise<{ panels: any[]; characters: any[]; scenes: any[] }> {
  // Get scripts for this episode
  const scriptRows = await db
    .select()
    .from(scripts)
    .where(eq(scripts.episodeId, episodeId))
    .orderBy(asc(scripts.createdAt));

  if (scriptRows.length === 0) {
    throw new Error('No scripts found for this episode. Please upload a script first.');
  }

  const scriptContent = scriptRows.map((s) => s.content).join('\n\n');
  if (!scriptContent.trim()) {
    throw new Error('Script content is empty');
  }

  // Get style template breakdown prompt
  const projectRow = await db
    .select({
      templateId: projects.templateId,
      breakdownPrompt: styleTemplates.breakdownPrompt,
    })
    .from(projects)
    .leftJoin(styleTemplates, eq(projects.templateId, styleTemplates.id))
    .where(eq(projects.id, projectId))
    .get();

  const templatePrompt = projectRow?.breakdownPrompt || '';

  // Call Gemini for breakdown
  const result = await callGeminiBreakdown(scriptContent, templatePrompt);

  // Store panels
  const createdPanels: any[] = [];
  for (const p of result.panels) {
    const panelResult = await db
      .insert(panels)
      .values({
        episodeId,
        panelNumber: p.panelNumber,
        description: p.description,
        dialogue: p.dialogue || '',
        imagePrompt: p.imagePrompt || '',
        videoPrompt: p.videoPrompt || '',
        status: 'pending',
      })
      .returning();
    createdPanels.push(panelResult[0]);
  }

  // Store characters
  const createdCharacters: any[] = [];
  for (const c of result.characters) {
    const charResult = await db
      .insert(characters)
      .values({
        projectId,
        name: c.name,
        gender: c.gender || '其他',
        age: c.age || '',
        appearanceDescription: c.appearanceDescription || '',
      })
      .returning();
    createdCharacters.push(charResult[0]);
  }

  // Store scenes
  const createdScenes: any[] = [];
  for (const s of result.scenes) {
    const sceneResult = await db
      .insert(scenes)
      .values({
        projectId,
        name: s.name,
        description: s.description || '',
        styleKeywords: s.styleKeywords || '',
      })
      .returning();
    createdScenes.push(sceneResult[0]);
  }

  return {
    panels: createdPanels,
    characters: createdCharacters,
    scenes: createdScenes,
  };
}
