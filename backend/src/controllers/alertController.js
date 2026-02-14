const Alert = require("../models/Alert");
const NotificationSettings = require("../models/notificationSettings");
const { AppError } = require("../utils/appError");
const { successResponse, paginatedResponse } = require("../utils/apiResponse");
const { getPaginationParams } = require("../utils/helpers");

class AlertController {
  // GET /api/v1/alerts
  async getAlerts(req, res, next) {
    try {
      const organizationId = req.user.organization;
      const { type, severity, isRead, isDismissed, startDate, endDate } =
        req.query;

      const { page, limit, skip } = getPaginationParams(req.query);

      const query = {
        organization: organizationId,
        isDismissed: false, // Par défaut, ne pas afficher les rejetées
      };

      if (type) query.type = type;
      if (severity) query.severity = severity;
      if (isRead !== undefined) query.isRead = isRead === "true";
      if (isDismissed !== undefined) query.isDismissed = isDismissed === "true";

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const [alerts, total] = await Promise.all([
        Alert.find(query)
          .populate("readBy", "firstName lastName")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Alert.countDocuments(query),
      ]);

      return paginatedResponse(
        res,
        alerts,
        {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
        "Alertes récupérées avec succès",
      );
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/alerts/unread
  async getUnreadAlerts(req, res, next) {
    try {
      const organizationId = req.user.organization;

      const alerts = await Alert.find({
        organization: organizationId,
        isRead: false,
        isDismissed: false,
      })
        .sort({ severity: -1, createdAt: -1 })
        .limit(50);

      return successResponse(res, alerts, "Alertes non lues récupérées");
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/alerts/count
  async getAlertsCount(req, res, next) {
    try {
      const organizationId = req.user.organization;

      const [total, unread, bySeverity, byType] = await Promise.all([
        Alert.countDocuments({
          organization: organizationId,
          isDismissed: false,
        }),
        Alert.countDocuments({
          organization: organizationId,
          isRead: false,
          isDismissed: false,
        }),
        Alert.aggregate([
          {
            $match: {
              organization: organizationId,
              isRead: false,
              isDismissed: false,
            },
          },
          {
            $group: {
              _id: "$severity",
              count: { $sum: 1 },
            },
          },
        ]),
        Alert.aggregate([
          {
            $match: {
              organization: organizationId,
              isRead: false,
              isDismissed: false,
            },
          },
          {
            $group: {
              _id: "$type",
              count: { $sum: 1 },
            },
          },
        ]),
      ]);

      const counts = {
        total,
        unread,
        bySeverity: bySeverity.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byType: byType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      };

      return successResponse(res, counts, "Compteurs d'alertes");
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/alerts/:id
  async getAlert(req, res, next) {
    try {
      const { id } = req.params;
      const organizationId = req.user.organization;

      const alert = await Alert.findOne({
        _id: id,
        organization: organizationId,
      })
        .populate("readBy", "firstName lastName")
        .populate("dismissedBy", "firstName lastName");

      if (!alert) {
        throw new AppError("Alerte introuvable", 404);
      }

      return successResponse(res, alert, "Alerte récupérée");
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/v1/alerts/:id/read
  async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const organizationId = req.user.organization;
      const userId = req.user._id;

      const alert = await Alert.findOne({
        _id: id,
        organization: organizationId,
      });

      if (!alert) {
        throw new AppError("Alerte introuvable", 404);
      }

      await alert.markAsRead(userId);

      return successResponse(res, alert, "Alerte marquée comme lue");
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/v1/alerts/read-all
  async markAllAsRead(req, res, next) {
    try {
      const organizationId = req.user.organization;
      const userId = req.user._id;

      const result = await Alert.updateMany(
        {
          organization: organizationId,
          isRead: false,
          isDismissed: false,
        },
        {
          $set: {
            isRead: true,
            readBy: userId,
            readAt: new Date(),
          },
        },
      );

      return successResponse(
        res,
        { count: result.modifiedCount },
        `${result.modifiedCount} alerte(s) marquée(s) comme lue(s)`,
      );
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/v1/alerts/:id
  async deleteAlert(req, res, next) {
    try {
      const { id } = req.params;
      const organizationId = req.user.organization;

      const alert = await Alert.findOneAndDelete({
        _id: id,
        organization: organizationId,
      });

      if (!alert) {
        throw new AppError("Alerte introuvable", 404);
      }

      return successResponse(res, null, "Alerte supprimée");
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/v1/alerts/clear-all
  async clearAll(req, res, next) {
    try {
      const organizationId = req.user.organization;
      const { olderThan } = req.query; // Jours

      const query = {
        organization: organizationId,
        $or: [{ isRead: true }, { isDismissed: true }],
      };

      if (olderThan) {
        const cutoffDate = new Date(
          Date.now() - parseInt(olderThan) * 24 * 60 * 60 * 1000,
        );
        query.createdAt = { $lt: cutoffDate };
      }

      const result = await Alert.deleteMany(query);

      return successResponse(
        res,
        { count: result.deletedCount },
        `${result.deletedCount} alerte(s) supprimée(s)`,
      );
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/alerts/by-type/:type
  async getAlertsByType(req, res, next) {
    try {
      const { type } = req.params;
      const organizationId = req.user.organization;

      const alerts = await Alert.find({
        organization: organizationId,
        type,
        isDismissed: false,
      })
        .sort({ createdAt: -1 })
        .limit(50);

      return successResponse(res, alerts, `Alertes de type ${type}`);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/alerts/by-severity/:severity
  async getAlertsBySeverity(req, res, next) {
    try {
      const { severity } = req.params;
      const organizationId = req.user.organization;

      const alerts = await Alert.find({
        organization: organizationId,
        severity,
        isDismissed: false,
      })
        .sort({ createdAt: -1 })
        .limit(50);

      return successResponse(res, alerts, `Alertes de sévérité ${severity}`);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/alerts/settings
  async getNotificationSettings(req, res, next) {
    try {
      const organizationId = req.user.organization;
      const userId = req.user._id;

      let settings = await NotificationSettings.findOne({
        organization: organizationId,
        user: userId,
      });

      // Créer settings par défaut si n'existe pas
      if (!settings) {
        settings = await NotificationSettings.create({
          organization: organizationId,
          user: userId,
        });
      }

      return successResponse(
        res,
        settings,
        "Paramètres de notification récupérés",
      );
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/v1/alerts/settings
  async updateNotificationSettings(req, res, next) {
    try {
      const organizationId = req.user.organization;
      const userId = req.user._id;

      let settings = await NotificationSettings.findOne({
        organization: organizationId,
        user: userId,
      });

      if (!settings) {
        settings = new NotificationSettings({
          organization: organizationId,
          user: userId,
        });
      }

      Object.assign(settings, req.body);
      await settings.save();

      return successResponse(
        res,
        settings,
        "Paramètres mis à jour avec succès",
      );
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/v1/alerts/:id/dismiss
  async dismissAlert(req, res, next) {
    try {
      const { id } = req.params;
      const organizationId = req.user.organization;
      const userId = req.user._id;

      const alert = await Alert.findOne({
        _id: id,
        organization: organizationId,
      });

      if (!alert) {
        throw new AppError("Alerte introuvable", 404);
      }

      await alert.dismiss(userId);

      return successResponse(res, alert, "Alerte rejetée");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AlertController();
