import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "~/server/auth";
import { pusherServer } from "~/utils/pusher";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { socket_id, channel_name } = req.body;
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user.id) {
    res.status(404).send("not found");
    return;
  }
  if (!socket_id || typeof socket_id !== "string") {
    res.status(404).send("not found");
    return;
  }
  if (
    (channel_name !== `private-user-deposit-${session.user.id}` &&
      channel_name !== `private-user-bids-${session.user.id}`) ||
    typeof channel_name !== "string"
  ) {
    res.status(403).send("unauthorized");
    return;
  }
  const auth = pusherServer.authorizeChannel(socket_id, channel_name, {
    user_id: session?.user.id,
    user_info: {
      name: session?.user.name,
      email: session?.user.email,
    },
  });
  res.send(auth);
}
