import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function OwnProfileRedirect() {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }
  redirect(`/profile/${session.user.handle}`);
}
