import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

function getPublicIdFromUrl(url: string): string | null {
  const match = decodeURIComponent(url).match(
    /\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/
  );
  return match ? match[1] : null;
}

export async function uploadBufferToCloudinary(
  buffer: Buffer,
  filename = "image"
) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "choresprint",
        public_id: filename,
        use_filename: true,
        unique_filename: false,
      },
      (error: any, result: any) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

export async function deletePhotoFromCloudinary(photoUrl: string) {
  const publicId = getPublicIdFromUrl(photoUrl);
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Failed to delete photo from Cloudinary:", error);
  }
}
