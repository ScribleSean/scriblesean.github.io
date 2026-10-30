import { inflateSync } from "node:zlib";

// Enough of PDF to read the text of the résumé export: Type0 fonts with a
// ToUnicode CMap and hex-string Tj/TJ operators. Other text comes back empty.
export function pdfText(pdf: Buffer): string {
  const source = pdf.toString("latin1");
  const objects = new Map<number, { dict: string; stream?: string }>();
  for (const match of source.matchAll(/(\d+) 0 obj([\s\S]*?)endobj/g)) {
    const body = match[2];
    const streamAt = body.search(/stream\r?\n/);
    if (streamAt === -1) {
      objects.set(Number(match[1]), { dict: body });
      continue;
    }
    const dict = body.slice(0, streamAt);
    const start = streamAt + body.slice(streamAt).indexOf("\n") + 1;
    const raw = Buffer.from(body.slice(start, body.lastIndexOf("endstream")), "latin1");
    let stream = raw.toString("latin1");
    if (/\/FlateDecode/.test(dict)) {
      try {
        stream = inflateSync(raw).toString("latin1");
      } catch {
        stream = "";
      }
    }
    objects.set(Number(match[1]), { dict, stream });
  }

  const cmaps = new Map<string, Map<string, string>>();
  for (const { dict } of objects.values()) {
    const fonts = dict.match(/\/Font\s*<<([^>]*)>>/)?.[1] ?? "";
    for (const [, name, ref] of fonts.matchAll(/\/(\w+)\s+(\d+) 0 R/g)) {
      const toUnicode = objects.get(Number(ref))?.dict.match(/\/ToUnicode (\d+) 0 R/)?.[1];
      const cmap = toUnicode && objects.get(Number(toUnicode))?.stream;
      if (cmap) cmaps.set(name, parseCMap(cmap));
    }
  }

  let text = "";
  for (const { stream } of objects.values()) {
    if (!stream || !/T[jJ]/.test(stream)) continue;
    let cmap = new Map<string, string>();
    for (const [, font, strings] of stream.matchAll(/\/(\w+)\s+[\d.]+\s+Tf|(\[[^\]]*\]\s*TJ|<[0-9A-Fa-f]*>\s*Tj)/g)) {
      if (font) {
        cmap = cmaps.get(font) ?? new Map();
        continue;
      }
      for (const [, hex] of strings.matchAll(/<([0-9A-Fa-f]*)>/g)) {
        for (let i = 0; i < hex.length; i += 4) text += cmap.get(hex.slice(i, i + 4).toUpperCase()) ?? "";
      }
    }
    text += "\n";
  }
  return text;
}

function parseCMap(cmap: string): Map<string, string> {
  const map = new Map<string, string>();
  const unicode = (hex: string) => String.fromCodePoint(...(hex.match(/.{4}/g) ?? []).map((h) => parseInt(h, 16)));
  for (const [, block] of cmap.matchAll(/beginbfchar([\s\S]*?)endbfchar/g)) {
    for (const [, code, value] of block.matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)) map.set(code.toUpperCase(), unicode(value));
  }
  for (const [, block] of cmap.matchAll(/beginbfrange([\s\S]*?)endbfrange/g)) {
    for (const [, from, to, value] of block.matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)) {
      const first = parseInt(value, 16);
      for (let code = parseInt(from, 16); code <= parseInt(to, 16); code++) {
        map.set(code.toString(16).toUpperCase().padStart(4, "0"), String.fromCodePoint(first + code - parseInt(from, 16)));
      }
    }
  }
  return map;
}
