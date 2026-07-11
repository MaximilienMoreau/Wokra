import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserByHandle } from "@/lib/data/users";
import { ProfileForm } from "@/components/profile/profile-form";

export default async function EditProfilePage() {
  const session = await auth();
  if (!session?.user?.handle) {
    redirect("/sign-in");
  }

  const user = await getUserByHandle(session.user.handle);
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <main className="mx-auto max-w-lg space-y-8 px-4 py-12">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Modifier ton profil</h1>
        <p className="text-muted-foreground text-sm">
          Ton profil est public. Le titre de poste reste secondaire — ce sont tes artefacts qui
          parlent.
        </p>
      </div>

      <ProfileForm
        defaultBio={user.bio ?? ""}
        defaultSkills={user.skills.map(({ skill }) => skill.name).join(", ")}
        defaultInterests={user.interests.map(({ skill }) => skill.name).join(", ")}
      />
    </main>
  );
}
