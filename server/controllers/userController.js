import User from "../models/User.js";
export const editProfile = async (req, res) => {
  try {
    const { name, surname } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, surname },
      { new: true },
    ).select("-password");
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    res.status(500).json({
      message: "Server error while updating profile",
    });
  }
};
export const getMyNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("notifications");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const sortedNotifications = user.notifications.sort(
      (a, b) => b.createdAt - a.createdAt,
    );

    res.status(200).json({
      success: true,
      notifications: sortedNotifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await User.updateOne(
      { _id: req.user.id, "notifications._id": id },
      { $set: { "notifications.$.isRead": true } },
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.user.id },
      { $set: { "notifications.$[].isRead": true } },
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
