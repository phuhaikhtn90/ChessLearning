import { MistakeType } from "@/types";

/** Returns true if the user's move is among the valid moves for this ply. */
export function isCorrectMove(userMove: string, validMoves: string[]): boolean {
  return validMoves.includes(userMove);
}

/**
 * Classify the severity of a mistake based on evaluation delta.
 * delta = evalAfter - evalBefore (from White's perspective)
 */
export function classifyMistake(delta: number): MistakeType {
  if (delta > -0.5) return "inaccuracy";
  if (delta > -1.5) return "mistake";
  return "blunder";
}

/** Compute the evaluation delta between two positions. */
export function evalDelta(evalBefore: number, evalAfter: number): number {
  return evalAfter - evalBefore;
}
