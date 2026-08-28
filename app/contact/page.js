import { redirect } from "next/navigation";

export const metadata = {
  title: "關於喜洛 | 喜洛 Hero Human",
};

export default function ContactPage() {
  redirect("/about");
}
