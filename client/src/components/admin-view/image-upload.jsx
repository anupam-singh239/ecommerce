import { FileIcon, UploadCloudIcon, XIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useEffect, useRef } from "react";
import { Button } from "../ui/button";
import axios from "axios";
import { Skeleton } from "../ui/skeleton";

function ProductImageUpload({
  imageFile,
  setImageFile,
  imageLoadingState,
  uploadedImageUrl,
  setUploadedImageUrl,
  setImageLoadingState,
  isEditMode,
  isCustomStyling = false,
}) {
  const inputRef = useRef(null);

  function handleImageFileChange(event) {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      setImageFile(selectedFile);
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDrop(event) {
    event.preventDefault();

    const droppedFile = event.dataTransfer.files?.[0];

    if (droppedFile) {
      setImageFile(droppedFile);
    }
  }

  function handleRemoveImage() {
    setImageFile(null);
    setUploadedImageUrl("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function uploadImageToCloudinary() {
    if (!imageFile) return;

    try {
      setImageLoadingState(true);

      const data = new FormData();

      data.append("my_file", imageFile);

      const response = await axios.post(
        "http://localhost:5000/api/admin/products/upload-image",
        data,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Image upload response:", response.data);

      if (response?.data?.success) {
        setUploadedImageUrl(response.data.result.url);

        console.log(
          "Image uploaded successfully:",
          response.data.result.url
        );
      } else {
        console.error("Image upload failed:", response.data);

        alert(
          response?.data?.message || "Image upload failed"
        );
      }
    } catch (error) {
      console.error(
        "Image upload error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Image upload failed. Please check your server and Cloudinary settings."
      );
    } finally {
      setImageLoadingState(false);
    }
  }

  useEffect(() => {
    if (imageFile !== null) {
      uploadImageToCloudinary();
    }
  }, [imageFile]);

  return (
    <div
      className={`w-full mt-4 ${
        isCustomStyling ? "" : "max-w-md mx-auto"
      }`}
    >
      <Label className="text-lg font-semibold mb-2 block">
        Upload Image
      </Label>

      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`${
          isEditMode ? "opacity-60" : ""
        } border-2 border-dashed rounded-lg p-4`}
      >
        <Input
          id="image-upload"
          type="file"
          accept="image/*"
          className="hidden"
          ref={inputRef}
          onChange={handleImageFileChange}
          disabled={isEditMode || imageLoadingState}
        />

        {!imageFile ? (
          <Label
            htmlFor="image-upload"
            className={`${
              isEditMode
                ? "cursor-not-allowed"
                : "cursor-pointer"
            } flex flex-col items-center justify-center h-32`}
          >
            <UploadCloudIcon className="w-10 h-10 text-muted-foreground mb-2" />

            <span>
              Drag & drop or click to upload image
            </span>

            <span className="text-xs text-muted-foreground mt-1">
              JPG, PNG, WEBP supported
            </span>
          </Label>
        ) : imageLoadingState ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />

            <p className="text-sm text-center text-muted-foreground">
              Uploading image...
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center min-w-0">
              <FileIcon className="w-8 text-primary mr-2 h-8 shrink-0" />

              <p className="text-sm font-medium truncate">
                {imageFile.name}
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground shrink-0"
              onClick={handleRemoveImage}
            >
              <XIcon className="w-4 h-4" />

              <span className="sr-only">
                Remove File
              </span>
            </Button>
          </div>
        )}
      </div>

      {uploadedImageUrl && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">
            Image uploaded successfully
          </p>

          <img
            src={uploadedImageUrl}
            alt="Uploaded"
            className="w-full max-h-64 object-cover rounded-lg border"
          />
        </div>
      )}
    </div>
  );
}

export default ProductImageUpload;