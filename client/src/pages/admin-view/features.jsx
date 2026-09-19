
import ProductImageUpload from "@/components/admin-view/image-upload";
import { Button } from "@/components/ui/button";
import {
  addFeatureImage,
  getFeatureImages,
  deleteFeatureImage,
} from "@/store/common-slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

function AdminFeatures() {
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);

  const dispatch = useDispatch();

  const { featureImageList } = useSelector(
    (state) => state.commonFeature
  );

  function handleUploadFeatureImage() {
    if (!uploadedImageUrl) return;

    dispatch(addFeatureImage(uploadedImageUrl)).then((data) => {
      if (data?.payload?.success) {
        dispatch(getFeatureImages());

        setImageFile(null);
        setUploadedImageUrl("");
      }
    });
  }

  function handleDeleteFeatureImage(id) {
    if (!id) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this home banner?"
    );

    if (!confirmDelete) return;

    dispatch(deleteFeatureImage(id)).then((data) => {
      if (data?.payload?.success) {
        dispatch(getFeatureImages());
      }
    });
  }

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Home Page Features
        </h1>

        <p className="text-muted-foreground mt-1">
          Upload large banner images that will appear on the
          home page.
        </p>
      </div>

      {/* Upload Section */}
      <div className="rounded-xl border bg-background p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">
          Upload Home Page Banner
        </h2>

        <ProductImageUpload
          imageFile={imageFile}
          setImageFile={setImageFile}
          uploadedImageUrl={uploadedImageUrl}
          setUploadedImageUrl={setUploadedImageUrl}
          setImageLoadingState={setImageLoadingState}
          imageLoadingState={imageLoadingState}
          isCustomStyling={true}
        />

        <Button
          onClick={handleUploadFeatureImage}
          disabled={!uploadedImageUrl || imageLoadingState}
          className="mt-5 w-full"
        >
          {imageLoadingState
            ? "Uploading..."
            : "Upload Banner"}
        </Button>
      </div>

      {/* Existing Banners */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Home Page Banners
        </h2>

        <div className="flex flex-col gap-5">
          {featureImageList &&
          featureImageList.length > 0 ? (
            featureImageList.map((featureImgItem) => (
              <div
                key={featureImgItem._id}
                className="relative overflow-hidden rounded-xl border shadow-sm"
              >
                <img
                  src={featureImgItem.image}
                  alt="Home Banner"
                  className="w-full h-[350px] object-cover"
                />

                {/* DELETE BUTTON */}
                <div className="absolute right-4 top-4 z-20">
                  <Button
                    variant="destructive"
                    onClick={() =>
                      handleDeleteFeatureImage(
                        featureImgItem._id
                      )
                    }
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed p-10 text-center">
              <p className="text-muted-foreground">
                No home page banners uploaded yet.
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default AdminFeatures;