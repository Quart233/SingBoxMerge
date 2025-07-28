export async function loadData(url: string): Promise<string> {
  if (url.startsWith('file://')) {
    return await Deno.readTextFile(new URL(url));
  } else {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
    }
    return await res.text();
  }
}