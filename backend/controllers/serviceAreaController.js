import ServiceArea from "../models/serviceAreaModel.js";

// addServiceArea
export const addServiceArea = async (req, res) => {
    try {
      const { address, coordinates, deliveryRadius } = req.body;
  
      if (!address || !coordinates || coordinates.length !== 2) {
        return res.status(400).json({ message: "Address and [lng, lat] required" });
      }
  
      const newArea = new ServiceArea({
        address,
        location: {
          type: "Point",
          coordinates, // [lng, lat]
        },
        deliveryRadius: deliveryRadius ?? 5, // default 5 if not provided
      });
  
      await newArea.save();
      res.status(201).json(newArea);
    } catch (err) {
      res.status(500).json({ message: "Error adding service area", error: err.message });
    }
  };
  
// editServiceArea
export const editServiceArea = async (req, res) => {
    try {
      const { id } = req.params;
      const { address, coordinates, deliveryRadius } = req.body;
  
      const updateObj = {
        ...(address && { address }),
        ...(coordinates && { location: { type: "Point", coordinates } }),
      };
  
      // Conditionally add deliveryRadius if provided
      if (typeof deliveryRadius === "number") {
        updateObj.deliveryRadius = deliveryRadius;
      }
  
      const updatedArea = await ServiceArea.findByIdAndUpdate(id, updateObj, { new: true });
  
      if (!updatedArea) {
        return res.status(404).json({ message: "Service area not found" });
      }
  
      res.status(200).json(updatedArea);
    } catch (err) {
      res.status(500).json({ message: "Error editing service area", error: err.message });
    }
  };
  

// deleteServiceArea
export const deleteServiceArea = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedArea = await ServiceArea.findByIdAndDelete(id);

    if (!deletedArea) {
      return res.status(404).json({ message: "Service area not found" });
    }

    res.status(200).json({ message: "Service area deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting service area", error: err.message });
  }
};

// toggleActive
export const toggleActive = async (req, res) => {
  try {
    const { id } = req.params;

    const area = await ServiceArea.findById(id);

    if (!area) {
      return res.status(404).json({ message: "Service area not found" });
    }

    area.isActive = !area.isActive;
    await area.save();

    res.status(200).json(area);
  } catch (err) {
    res.status(500).json({ message: "Error toggling active state", error: err.message });
  }
};

// getAllServiceAreas
export const getAllServiceAreas = async (req, res) => {
  try {
    const areas = await ServiceArea.find();
    res.status(200).json(areas);
  } catch (err) {
    res.status(500).json({ message: "Error fetching service areas", error: err.message });
  }
};

// getServiceAreaById
export const getServiceAreaById = async (req, res) => {
  try {
    const { id } = req.params;

    const area = await ServiceArea.findById(id);

    if (!area) {
      return res.status(404).json({ message: "Service area not found" });
    }

    res.status(200).json(area);
  } catch (err) {
    res.status(500).json({ message: "Error fetching service area", error: err.message });
  }
};
