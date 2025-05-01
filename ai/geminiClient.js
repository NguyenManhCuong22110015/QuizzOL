import 'dotenv/config.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.API);

// ✅ Định nghĩa tool đơn giản: trả lời với số
const answerNumberFunction = {
  name: 'answerNumber',
  description: 'Nhận một số và trả lời lại bằng văn bản đơn giản',
  parameters: {
    type: 'object',
    properties: {
      number: {
        type: 'integer',
        description: 'Số nguyên bất kỳ',
      },
    },
    required: ['number'],
  },
};

// ✅ Hàm thực thi tool này
function answerNumber({ number }) {
  return {
    message: `Bạn vừa gửi số: ${number}. Đây là một số rất thú vị!`,
  };
}

// ✅ Gọi Gemini
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-pro',
  tools: [{ functionDeclarations: [answerNumberFunction] }],
});

export async function testGeminiFunctionCalling(prompt) {
  try {
    const chat = await model.startChat();
    const result = await chat.sendMessage(prompt);

    const call = result.response.functionCalls?.()[0];
    if (call) {
      console.log("✅ Function được gọi:", call.name);
      const res = answerNumber(call.args);
      console.log("🔹 Kết quả:", res.message);
      return res.message;
    } else {
      console.warn("⚠️ Không có function call. Trả lời thẳng từ Gemini:");
      const text = await result.response.text();
      console.log("👉", text);
      return text;
    }
  } catch (err) {
    console.error("❌ Lỗi khi gọi Gemini:", err);
    return "Lỗi xảy ra.";
  }
}
