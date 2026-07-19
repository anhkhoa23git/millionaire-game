// Default question bank — Vietnam culture & history edition.
// Prize amounts and safe havens are NOT stored per-question anymore;
// they are derived from position via buildPrizeLadder() in prize.ts,
// so the set can grow/shrink freely (custom questions).

export interface Question {
  question: string;
  answers: [string, string, string, string]; // A, B, C, D
  correct: 0 | 1 | 2 | 3;                    // index of correct answer
}

export const DEFAULT_QUESTIONS: Question[] = [
  {
    question: "In traditional Vietnamese culture, which farm animal was often treated as a water spirit?",
    answers: ["Con lừa", "Con heo", "Con gà", "Con trâu"],
    correct: 3,
  },
  {
    question: "Which of the following is a traditional Vietnamese folk game?",
    answers: ["Nhảy cá", "Nhảy gà", "Nhảy ngựa", "Nhảy lợn"],
    correct: 2,
  },
  {
    question: "Which fruit is used to cook sour soup (canh chua)?",
    answers: ["Quả dọc", "Quả xuôi", "Quả ngang", "Quả ngược"],
    correct: 0,
  },
  {
    question: "In Vietnamese idioms, which animal is the grasshopper often compared to in a hopelessly uneven fight?",
    answers: ["Ngựa", "Hổ", "Gấu", "Voi"],
    correct: 3,
  },
  {
    question: "In ancient Vietnamese clan traditions, what was the name of the hereditary ancestral land that was strictly prohibited from being sold or transferred, and whose yields were reserved exclusively for ancestor worship?",
    answers: ["Hương hỏa", "Công điền", "Lộc điền", "Thổ cư"],
    correct: 0,
  },
  {
    question: "Which characteristic of the Giao Chỉ people was more prominent compared to Vietnamese today?",
    answers: ["Xương bàn tay", "Xương bàn chân", "Xương cụt", "Xương khuôn mặt"],
    correct: 1,
  },
  {
    question: "The cradle of the Vietnamese dialect originated from?",
    answers: ["Phu Tho", "Ha Noi", "Thanh Hoa", "Hue"],
    correct: 2,
  },
  {
    question: "In the resistance against the second Mongol invasion in 1285, what ancient biological weapon did the Vietnamese successfully use?",
    answers: ["Hỗn hợp rơm và phân bò", "Hỗn hợp nước ớt cay", "Tổ ong vò vẽ và nhện độc", "Bùi nhùi tẩm nọc độc rắn"],
    correct: 0,
  },
  {
    question: "Who is the most handsome?",
    answers: ["Mr. Tâm", "Mr. Trung", "Mr. Quyền", "Mr. Duy"],
    correct: 3,
  },
];

import { buildPrizeLadder } from "./prize";

export const MONEY_LADDER = buildPrizeLadder(DEFAULT_QUESTIONS.length);

export function formatMoney(amount: number): string {
  return amount.toLocaleString("vi-VN");
}
