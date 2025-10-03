// lib/chunk.ts
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
export async function chunkText(text: string) {
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
  return splitter.splitText(text);
}
