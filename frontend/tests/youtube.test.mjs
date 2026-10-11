import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/youtube.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
});
const { getYouTubeVideoId, getYouTubeEmbedUrl } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);

test("Shorts and existing YouTube URL formats produce only the video ID", () => {
  for (const url of [
    "https://youtube.com/shorts/csd2p7dmvD4?si=dnr0gXUpfAgXA4NH",
    "https://www.youtube.com/watch?v=csd2p7dmvD4&feature=share",
    "https://youtu.be/csd2p7dmvD4?si=share",
    "https://www.youtube.com/embed/csd2p7dmvD4",
    "https://www.youtube-nocookie.com/embed/csd2p7dmvD4",
    "https://m.youtube.com/live/csd2p7dmvD4",
    "csd2p7dmvD4",
  ]) {
    assert.equal(getYouTubeVideoId(url), "csd2p7dmvD4", url);
    assert.equal(getYouTubeEmbedUrl(url), "https://www.youtube-nocookie.com/embed/csd2p7dmvD4", url);
  }
});

test("invalid URLs never become malformed embed URLs", () => {
  for (const url of ["", "bad-link", "https://example.com/watch?v=csd2p7dmvD4",
    "https://youtube.com/shorts/short", "https://youtube.com/watch",
    "https://youtube.com.evil.test/shorts/csd2p7dmvD4"]) {
    assert.equal(getYouTubeVideoId(url), null, url);
    assert.equal(getYouTubeEmbedUrl(url), null, url);
  }
});
