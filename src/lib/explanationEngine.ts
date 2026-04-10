import { MistakeType } from "@/types";

export type CoachingLevel = "correct" | "close" | "wrong";

export interface MoveFeedback {
  level: CoachingLevel;
  title: string;
  message: string;
  detail: string;
}

/** Rule-based explanation map keyed by concept tag. */
const TAG_EXPLANATIONS: Record<string, string> = {
  center_control: "Bạn không kiểm soát trung tâm",
  king_safety: "Vua của bạn đang nguy hiểm",
  hanging_piece: "Bạn đang treo quân",
  development: "Bạn chưa phát triển quân đầy đủ",
  pawn_structure: "Cấu trúc tốt của bạn bị yếu",
  tempo: "Bạn mất tempo quan trọng",
  gambit: "Hãy chú ý khi nhận gambit",
  pin: "Quân của bạn đang bị ghim",
  fork: "Cẩn thận – đối thủ có thể fork!",
  sacrifice: "Đây là hy sinh có tính toán",
  trap: "Bạn đã mắc bẫy!",
  tactic: "Có chiến thuật quan trọng ở đây",
};

/** Mistake severity to short Vietnamese message. */
const MISTAKE_MESSAGES: Record<MistakeType, string> = {
  inaccuracy: "⚠️ Chưa tối ưu",
  mistake: "❌ Sai lầm",
  blunder: "💥 Sai lầm nghiêm trọng",
};

/**
 * Get the short explanation for a wrong move.
 * Uses the move's tags first; falls back to a generic message.
 */
export function getExplanation(
  explainText?: string,
  tags?: string[]
): string {
  if (explainText) return explainText;
  if (tags && tags.length > 0) {
    for (const tag of tags) {
      if (TAG_EXPLANATIONS[tag]) return TAG_EXPLANATIONS[tag];
    }
  }
  return "Nước đi này chưa phải tốt nhất";
}

/** Get human-readable label for mistake severity. */
export function getMistakeLabel(type: MistakeType): string {
  return MISTAKE_MESSAGES[type];
}

/** Return an encouraging message when the line is completed correctly. */
export function getRewardMessage(correctStreak: number): string {
  if (correctStreak >= 5) return "Nhớ khá chắc rồi. Mình giữ nhịp này nhé.";
  if (correctStreak >= 3) return "Đúng rồi. Nhịp học đang rất ổn.";
  return "Đúng rồi. Mình đi tiếp.";
}

function formatExpectedMoves(validMoves: string[]): string {
  if (validMoves.length === 0) return "";
  if (validMoves.length === 1) return validMoves[0];
  if (validMoves.length === 2) return `${validMoves[0]} hoặc ${validMoves[1]}`;
  return `${validMoves.slice(0, -1).join(", ")} hoặc ${validMoves.at(-1)}`;
}

export function getPreviewExplanation(
  explainText?: string,
  tags?: string[]
): MoveFeedback {
  return {
    level: "correct",
    title: "Mục tiêu của nước này",
    message: getExplanation(explainText, tags),
    detail: "Bé thử tìm nước đi đúng với ý tưởng này nhé.",
  };
}

export function getMoveFeedback({
  level,
  explainText,
  tags,
  validMoves,
}: {
  level: CoachingLevel;
  explainText?: string;
  tags?: string[];
  validMoves: string[];
}): MoveFeedback {
  const explanation = getExplanation(explainText, tags);
  const expectedMoveText = formatExpectedMoves(validMoves);

  if (level === "correct") {
    return {
      level,
      title: "Đúng hướng rồi",
      message: explanation,
      detail: "Đây là đúng ý tưởng của line này. Bé cứ tiếp tục như vậy nhé.",
    };
  }

  if (level === "close") {
    return {
      level,
      title: "Cũng khá gần rồi",
      message: `${explanation}.`,
      detail: expectedMoveText
        ? `Nước này vẫn là một ý tưởng hợp lệ, nhưng trong bài đang muốn bé nhớ ${expectedMoveText}. Mình thử lại một lần nữa nhé.`
        : "Nước này chưa khớp với line đang học. Mình thử lại một lần nữa nhé.",
    };
  }

  return {
    level,
    title: "Mình đổi sang một ý khác nhé",
    message: explanation,
    detail: expectedMoveText
      ? `Ở đây bài đang muốn bé đi ${expectedMoveText} để bám đúng kế hoạch khai cuộc. Không sao đâu, mình thử lại chậm rãi nhé.`
      : "Nước này chưa khớp với kế hoạch của bài. Không sao đâu, mình thử lại chậm rãi nhé.",
  };
}
