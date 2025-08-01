import { useToast } from '@/hooks/use-toast';

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
const CLOUDINARY_UPLOAD_PRESET = 'kitchen-kinetic';

export const cloudinaryConfig = {
  cloudName: CLOUDINARY_CLOUD_NAME || '',
  apiKey: CLOUDINARY_API_KEY || '',
  uploadPreset: CLOUDINARY_UPLOAD_PRESET,
};

export const uploadImageToCloudinary = async (
  imageFile: File | null,
  setUploadingImage: (loading: boolean) => void,
  toast: ReturnType<typeof useToast>['toast']
): Promise<string | null> => {
  if (!imageFile) {
    return null;
  }

  setUploadingImage(true);
  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('upload_preset', cloudinaryConfig.uploadPreset);
  formData.append('cloud_name', cloudinaryConfig.cloudName);

 

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary API response error:', errorText);
      throw new Error(
        `Cloudinary upload failed: ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();
    toast({
      title: 'Image Uploaded!',
      description: 'Your recipe image has been successfully uploaded.',
    });
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    toast({
      title: 'Image Upload Error',
      description: `Failed to upload image: ${
        error instanceof Error ? error.message : String(error)
      }`,
      variant: 'destructive',
    });
    return null;
  } finally {
    setUploadingImage(false);
  }
};
