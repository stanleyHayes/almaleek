import { InviteExperience } from "@/components/invite-experience";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <InviteExperience token={token} />;
}
