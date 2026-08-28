export const experiences = [
  {
    id: "farm-baking-001",
    title: "食農教育體驗課程",
    subtitle: "認識小麥與烘焙日常",
    price: 600,
    imageUrl: "/original_bagel_800px_800px.jpg",
    duration: "2 小時",
    location: "喜洛烘焙教室",
    targetAge: "6 歲以上，親子可參加",
    capacityNote: "小班制，完成付款後保留名額",
    summary:
      "從食材觀察、麵團製作到烘焙分享，帶參與者認識日常飲食背後的土地、原料與製作過程。",
    description:
      "這堂課以小麥與烘焙為主題，透過觀察、討論與手作體驗，讓孩子與家長理解食物從原料到餐桌的過程。課程不追求複雜技巧，而是讓參與者用輕鬆的方式感受食農教育與烘焙生活的連結。",
    flow: [
      "認識小麥、麵粉與烘焙原料",
      "觀察麵團變化與發酵概念",
      "手作簡易貝果或烘焙點心",
      "成品分享與飲食回顧",
    ],
    includes: ["課程材料", "現場工具使用", "完成品帶回", "講師教學"],
    notes: [
      "請於課程開始前 10 分鐘報到。",
      "若有食物過敏，請於報名表備註。",
      "名額有限，完成付款後才算報名成功。",
    ],
    sessions: [
      {
        id: "2026-08-10-1400",
        date: "2026-08-10",
        time: "14:00 - 16:00",
        capacity: 20,
        remaining: 12,
      },
      {
        id: "2026-08-24-1000",
        date: "2026-08-24",
        time: "10:00 - 12:00",
        capacity: 20,
        remaining: 8,
      },
    ],
  },
  {
    id: "moon-festival-001",
    title: "節慶點心食農體驗",
    subtitle: "月餅文化與手作分享",
    price: 750,
    imageUrl: "/3pcs_mooncakes_800px_800px.jpg",
    duration: "2.5 小時",
    location: "喜洛烘焙教室",
    targetAge: "8 歲以上，適合親子與團體",
    capacityNote: "適合節慶前預約，團體可另洽",
    summary:
      "用月餅作為節慶食物入口，認識食材、文化與分享禮俗，並完成一份可帶回的手作點心。",
    description:
      "課程會從節慶飲食故事開始，帶參與者認識月餅常見原料與製作步驟，再進入手作體驗。適合親子、朋友或小型團體在節慶前一起參與。",
    flow: [
      "節慶飲食與月餅故事",
      "認識餅皮、內餡與常見原料",
      "手作節慶點心",
      "包裝與分享禮俗介紹",
    ],
    includes: ["課程材料", "包裝材料", "完成品帶回", "講師教學"],
    notes: [
      "課程含麩質、蛋、奶或堅果相關食材，過敏者請事先告知。",
      "節慶檔期名額較容易額滿，建議提前報名。",
      "完成付款後才算報名成功。",
    ],
    sessions: [
      {
        id: "2026-09-05-1400",
        date: "2026-09-05",
        time: "14:00 - 16:30",
        capacity: 18,
        remaining: 10,
      },
      {
        id: "2026-09-12-1400",
        date: "2026-09-12",
        time: "14:00 - 16:30",
        capacity: 18,
        remaining: 6,
      },
    ],
  },
];

export function getExperienceById(id) {
  return experiences.find((experience) => experience.id === id);
}
