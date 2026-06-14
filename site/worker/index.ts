/**
 * Cloudflare Worker for the 寓言集 site.
 *
 * Serves the static Astro build (the `assets` binding) and adds one dynamic
 * route — POST /api/ask — that powers the premium 追问 module. It proxies a
 * concept-grounded chat turn to the Claude API and streams the answer back as
 * plain text (one decoded delta at a time), so the browser can render tokens
 * live without parsing SSE itself.
 *
 * Requires a secret:  wrangler secret put ANTHROPIC_API_KEY
 * Optional override:  ASK_MODEL var (defaults to claude-opus-4-8).
 */

interface Env {
  ASSETS: { fetch: (req: Request) => Promise<Response> };
  ANTHROPIC_API_KEY?: string;
  ASK_MODEL?: string;
}

interface AskContext {
  concept?: string;
  cluster?: string;
  bridge?: string;
  explanation?: string;
  fable?: string;
}

const SYSTEM = [
  '你是「寓言集」里的一位耐心的研究生助教，帮助一位正在自学大语言模型的学习者。',
  '学习者刚刚读完一则中文寓言，并揭晓了它对应的某个 LLM 概念。现在他就这个概念向你追问。',
  '规则：',
  '1. 只围绕「当前概念」回答；如果问题超出范围，温和地把它拉回到这个概念上。',
  '2. 用学习者能懂的中文解释，必要时借用他刚读过的寓言来打比方。',
  '3. 直接给出最终答案，简明扼要（通常 2–5 句），不要输出思考过程或冗长铺垫。',
  '4. 忠于下面提供的资料，不要编造来源或夸大结论。',
].join('\n');

function buildUserPrompt(ctx: AskContext, question: string): string {
  const parts: string[] = [];
  if (ctx.concept) parts.push(`当前概念：${ctx.concept}${ctx.cluster ? `（${ctx.cluster}）` : ''}`);
  if (ctx.bridge) parts.push(`故事↔概念桥接：${ctx.bridge}`);
  if (ctx.fable) parts.push(`学习者读过的寓言：\n${ctx.fable}`);
  if (ctx.explanation) parts.push(`概念的英文精读（参考资料）：\n${ctx.explanation}`);
  parts.push(`学习者的追问：${question}`);
  return parts.join('\n\n');
}

async function handleAsk(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  if (!env.ANTHROPIC_API_KEY) {
    return new Response('追问服务尚未配置（缺少 ANTHROPIC_API_KEY）。', { status: 503 });
  }

  let body: { question?: string; context?: AskContext };
  try {
    body = await request.json();
  } catch {
    return new Response('Bad request', { status: 400 });
  }
  const question = (body.question ?? '').toString().slice(0, 2000).trim();
  if (!question) return new Response('Empty question', { status: 400 });
  const ctx = body.context ?? {};

  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: env.ASK_MODEL || 'claude-opus-4-8',
      max_tokens: 1024,
      stream: true,
      system: SYSTEM,
      messages: [{ role: 'user', content: buildUserPrompt(ctx, question) }],
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => '');
    return new Response(`模型调用失败（${upstream.status}）。${detail.slice(0, 200)}`, { status: 502 });
  }

  // Transform Anthropic SSE → plain text stream of just the answer deltas.
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = '';

  const stream = new ReadableStream({
    async pull(controller) {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) { controller.close(); return; }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        let emitted = false;
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const payload = trimmed.slice(5).trim();
          if (!payload || payload === '[DONE]') continue;
          try {
            const evt = JSON.parse(payload);
            if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta' && evt.delta.text) {
              controller.enqueue(encoder.encode(evt.delta.text));
              emitted = true;
            }
          } catch { /* ignore non-JSON keepalive lines */ }
        }
        if (emitted) return; // yield a chunk to the client
      }
    },
    cancel() { reader.cancel().catch(() => {}); },
  });

  return new Response(stream, {
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/ask') return handleAsk(request, env);
    return env.ASSETS.fetch(request);
  },
};
