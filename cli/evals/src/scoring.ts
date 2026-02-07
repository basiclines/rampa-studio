import { CopilotClient } from '@github/copilot-sdk';
import { JUDGE_MODEL } from './config.js';
import type { ModelResult, Score } from './report.js';

/**
 * Score a model result using LLM-as-judge.
 */
export async function scoreResult(
  client: CopilotClient,
  promptName: string,
  prompt: string,
  result: ModelResult,
): Promise<Score> {
  let judgeScore: number | undefined;
  let judgeNotes: string | undefined;

  try {
    const session = await client.createSession({ model: JUDGE_MODEL });
    try {
      const judgePrompt = buildJudgePrompt(promptName, prompt, result);

      const judgeContent = await new Promise<string>((resolve, reject) => {
        let content = '';
        const unsubscribe = session.on((event) => {
          if (event.type === 'assistant.message') {
            content = event.data.content;
          } else if (event.type === 'session.idle') {
            unsubscribe();
            resolve(content);
          } else if (event.type === 'session.error') {
            unsubscribe();
            reject(new Error(event.data.message));
          }
        });
        session.send({ prompt: judgePrompt }).catch(reject);
      });

      if (judgeContent) {
        const parsed = parseJudgeResponse(judgeContent);
        judgeScore = parsed.score;
        judgeNotes = parsed.notes;
      }
    } finally {
      await session.destroy();
    }
  } catch (err) {
    judgeNotes = `Judge error: ${err instanceof Error ? err.message : String(err)}`;
  }

  return { judgeScore, judgeNotes };
}

function buildJudgePrompt(promptName: string, prompt: string, result: ModelResult): string {
  return `You are an eval judge. Rate the following LLM response on a scale of 1-5 for how well it answers the user's request using the rampa CLI tool.

Prompt: ${promptName}
User prompt: ${prompt}

Model response:
${result.response.slice(0, 3000)}

Scoring rubric:
1 = Did not attempt the task or completely wrong approach
2 = Attempted the task but major issues (wrong flags, invented colors)
3 = Reasonable attempt but missing key aspects of the prompt
4 = Good response that addresses the prompt well
5 = Excellent — correct rampa usage, all colors from rampa output, clear explanation

Respond with ONLY a JSON object: {"score": <1-5>, "notes": "<one sentence rationale>"}`;
}

function parseJudgeResponse(text: string): { score?: number; notes?: string } {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*?"score"[\s\S]*?\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const score = typeof parsed.score === 'number' ? Math.min(5, Math.max(1, Math.round(parsed.score))) : undefined;
      return { score, notes: parsed.notes ?? undefined };
    }
  } catch {
    // Fall through
  }
  return { notes: `Could not parse judge response: ${text.slice(0, 200)}` };
}
