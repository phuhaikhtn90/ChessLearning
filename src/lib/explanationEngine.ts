import { MistakeType } from "@/types";

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
  if (correctStreak >= 5) return "🔥 Xuất sắc! Bạn đang vào guồng!";
  if (correctStreak >= 3) return "⭐ Tuyệt vời! Tiếp tục phát huy!";
  return "✅ Đúng rồi! Tiếp tục nào!";
}
