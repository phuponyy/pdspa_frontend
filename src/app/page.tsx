import { redirect } from "next/navigation";
import { getDefaultLang } from "@/lib/i18n";

export default function Home() {
  redirect(`/${getDefaultLang()}`);
}
