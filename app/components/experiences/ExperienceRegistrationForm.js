"use client";

import { useMemo, useState } from "react";

const initialFormData = {
  name: "",
  email: "",
  phone: "",
  participantCount: 1,
  participants: "",
  allergies: "",
  notes: "",
};

export default function ExperienceRegistrationForm({ experience }) {
  const [selectedSessionId, setSelectedSessionId] = useState(experience.sessions[0]?.id || "");
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedSession = useMemo(
    () => experience.sessions.find((session) => session.id === selectedSessionId),
    [experience.sessions, selectedSessionId]
  );

  const participantCount = Number(formData.participantCount) || 1;
  const totalPrice = participantCount * experience.price;

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: name === "participantCount" ? Math.max(1, Number(value) || 1) : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedSession) {
      setError("請選擇課程場次");
      return;
    }

    if (!formData.name.trim()) {
      setError("請填寫報名人姓名");
      return;
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("請填寫有效的電子郵件");
      return;
    }

    if (!formData.phone.trim() || !/^\d{10}$/.test(formData.phone)) {
      setError("請填寫有效的電話號碼（10 位數字）");
      return;
    }

    if (participantCount > selectedSession.remaining) {
      setError(`此場次目前剩餘 ${selectedSession.remaining} 位，請調整報名人數`);
      return;
    }

    setLoading(true);
    setError("");

    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).slice(2, 6);
    const orderId = `EXP${timestamp}${randomStr}`.slice(0, 20);

    try {
      const response = await fetch("/api/ecpay/experience", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          experienceId: experience.id,
          courseTitle: `${experience.title} - ${experience.subtitle}`,
          sessionId: selectedSession.id,
          date: selectedSession.date,
          time: selectedSession.time,
          participantCount,
          amount: totalPrice,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          participants: formData.participants,
          allergies: formData.allergies,
          notes: formData.notes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "報名付款建立失敗，請再試一次");
      }

      const html = await response.text();
      const newWindow = window.open("", "_self");

      if (!newWindow) {
        throw new Error("無法開啟付款頁面，可能是瀏覽器阻擋");
      }

      newWindow.document.write(html);
    } catch (submitError) {
      setError(submitError.message);
      setLoading(false);
    }
  };

  return (
    <form className="experience-form info-panel p-5" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold">報名資訊</h2>

      <div className="mt-4 grid gap-4">
        <label>
          <span>選擇場次</span>
          <select name="sessionId" value={selectedSessionId} onChange={(event) => setSelectedSessionId(event.target.value)}>
            {experience.sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.date} {session.time}（剩餘 {session.remaining} 位）
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>報名人姓名</span>
          <input name="name" type="text" value={formData.name} onChange={handleInputChange} placeholder="請輸入姓名" />
        </label>

        <label>
          <span>電子郵件</span>
          <input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="example@email.com" />
        </label>

        <label>
          <span>電話</span>
          <input name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="0912345678" />
        </label>

        <label>
          <span>報名人數</span>
          <input
            name="participantCount"
            type="number"
            min="1"
            max={selectedSession?.remaining || 1}
            value={formData.participantCount}
            onChange={handleInputChange}
          />
        </label>

        <label>
          <span>參加者姓名 / 年齡</span>
          <textarea
            name="participants"
            value={formData.participants}
            onChange={handleInputChange}
            placeholder="例如：王小明 8歲、王大明 成人"
            rows={3}
          />
        </label>

        <label>
          <span>食物過敏或特殊需求</span>
          <textarea
            name="allergies"
            value={formData.allergies}
            onChange={handleInputChange}
            placeholder="若無可留空"
            rows={3}
          />
        </label>

        <label>
          <span>備註</span>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="其他想讓我們知道的事項"
            rows={3}
          />
        </label>
      </div>

      <div className="mt-5 rounded-2xl p-4" style={{ backgroundColor: "var(--bg-main)" }}>
        <div className="flex justify-between font-bold">
          <span>總金額</span>
          <span>NT$ {totalPrice}</span>
        </div>
        <p className="mt-1 text-sm">
          {experience.price} x {participantCount} 人
        </p>
      </div>

      {error && (
        <p className="mt-3 text-sm" style={{ color: "#a32d2d" }}>
          {error}
        </p>
      )}

      <button type="submit" className="btn-primary mt-4 w-full py-2.5 disabled:opacity-50" disabled={loading}>
        {loading ? "處理中..." : "送出報名並前往付款"}
      </button>
    </form>
  );
}
