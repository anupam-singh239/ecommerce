const Feature = require("../../models/Feature");

// ADD FEATURE IMAGE
const addFeatureImage = async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    const featureImages = new Feature({
      image,
    });

    await featureImages.save();

    res.status(201).json({
      success: true,
      data: featureImages,
    });
  } catch (e) {
    console.log(e);

    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

// GET FEATURE IMAGES
const getFeatureImages = async (req, res) => {
  try {
    const images = await Feature.find({}).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: images,
    });
  } catch (e) {
    console.log(e);

    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

// DELETE FEATURE IMAGE
const deleteFeatureImage = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedImage = await Feature.findByIdAndDelete(id);

    if (!deletedImage) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
      data: deletedImage,
    });
  } catch (e) {
    console.log(e);

    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

module.exports = {
  addFeatureImage,
  getFeatureImages,
  deleteFeatureImage,
};