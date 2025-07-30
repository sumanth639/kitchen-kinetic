import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface ImageUploadFieldProps {
  imageFile: File | null;
  uploadingImage: boolean;
  isSubmitting: boolean;
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

export function ImageUploadField({
  imageFile,
  uploadingImage,
  isSubmitting,
  onImageChange,
  error,
}: ImageUploadFieldProps) {
  return (
    <FormItem>
      <FormLabel>Recipe Image (Upload)</FormLabel>
      <FormControl>
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept="image/*"
            onChange={onImageChange}
            className="flex-grow"
            disabled={uploadingImage || isSubmitting}
          />
          {(uploadingImage || isSubmitting) && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </FormControl>
      {imageFile && (
        <p className="text-sm text-muted-foreground mt-1">
          Selected: {imageFile.name}
        </p>
      )}
      {error && <FormMessage>{error}</FormMessage>}
    </FormItem>
  );
} 