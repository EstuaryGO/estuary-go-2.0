import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch every EstuaryPerson (service role bypasses RLS) and group names by owner.
    const people = await base44.asServiceRole.entities.EstuaryPerson.list("-created_date", 1000);

    const byUser: Record<string, string[]> = {};
    for (const p of people) {
      const uid = p.created_by_id;
      if (!uid) continue;
      if (!byUser[uid]) byUser[uid] = [];
      if (p.name) byUser[uid].push(p.name);
    }

    const userIds = Object.keys(byUser);
    let sent = 0;
    let failed = 0;

    for (const userId of userIds) {
      const names = byUser[userId];
      const shown = names.slice(0, 5).join(", ");
      const content =
        names.length > 5
          ? `It's time to pray for your Estuary: ${shown} and ${names.length - 5} more.`
          : `It's time to pray for your Estuary: ${shown}.`;

      try {
        await base44.asServiceRole.integrations.Core.SendPushNotification({
          user_id: userId,
          title: "Pray for your Estuary",
          content,
          action_label: "Pray now",
          action_url: "/pray-impact-invite",
        });
        sent++;
      } catch (e) {
        console.error(`Push failed for user ${userId}:`, e.message);
        failed++;
      }
    }

    return Response.json({ success: true, sent, failed, totalUsers: userIds.length });
  } catch (error) {
    console.error("Error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}