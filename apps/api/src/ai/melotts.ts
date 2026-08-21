export async function generateSpeech(
  ai: { run(model: string, input: unknown): Promise<unknown> },
  text: string,
): Promise<string> {
  const result = await ai.run("@cf/myshell-ai/melotts", { text });
  const bytes = result instanceof ArrayBuffer
    ? new Uint8Array(result)
    : result instanceof Uint8Array
      ? result
      : result && typeof result === "object" && "audio" in result && (result as { audio: unknown }).audio instanceof ArrayBuffer
        ? new Uint8Array((result as { audio: ArrayBuffer }).audio)
        : null;
  if (!bytes || bytes.byteLength === 0 || bytes.byteLength > 256 * 1024) throw new Error("TTS_FAILURE");
  return toBase64(bytes);
}

function toBase64(bytes: Uint8Array): string {
  let output = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    output += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(output);
}
