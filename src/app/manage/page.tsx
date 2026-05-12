import { redirect } from "next/navigation";
// This page is superseded by /admin which has full post management
export default function ManagePage() {
  redirect("/admin");
}