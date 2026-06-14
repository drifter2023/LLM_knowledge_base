export function splitStory(body: string): { parable: string; explanation: string } {
  const hr = body.match(/^[ \t]*---[ \t]*$/m);
  if (hr && hr.index !== undefined) {
    return {
      parable: body.slice(0, hr.index).trim(),
      explanation: body.slice(hr.index + hr[0].length).trim(),
    };
  }
  const h2 = body.search(/^## /m);
  if (h2 > 0) return { parable: body.slice(0, h2).trim(), explanation: body.slice(h2).trim() };
  return { parable: body.trim(), explanation: '' };
}
