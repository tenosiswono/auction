import { v4 as uuidv4 } from "uuid";
import { createClient } from "@supabase/supabase-js";
import { env } from "~/env";

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
const supabase = createClient<any>(env.SUPABASE_URL, env.SUPABASE_KEY);

export async function uploadImg(imageURI: string) {
  let imageUrl = "";
  const image = imageURI;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const imageName: string = uuidv4();
  const imageData = image.replace(/^data:image\/\w+;base64,/, "");
  const imageBuffer = Buffer.from(imageData, "base64");
  
  imageUrl = env.IMAGE_SERVER.endsWith("/")
    ? env.IMAGE_SERVER + imageName
    : env.IMAGE_SERVER + "/" + imageName;

  const { data, error } = await supabase.storage
    .from(env.SUPABASE_BUCKET)
    .upload(imageName, imageBuffer);

  console.info("upload data:", data, "err", error);

  return {
    imageUrl,
    error
  };
}
