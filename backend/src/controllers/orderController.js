const Order = require("../models/Orders");
const Product = require("../models/Product");
const Supplier = require("../models/Suppliers");
const { AppError } = require("../utils/appError");
const { successResponse, paginatedResponse } = require("../utils/apiResponse");
const { getPaginationParams } = require("../utils/helpers");

class OrderController {
  // GET /api/v1/orders
  async getOrders(req, res, next) {
    try {
      const organizationId = req.user.organization;
      const {
        type,
        status,
        paymentStatus,
        supplier,
        customer,
        startDate,
        endDate,
        search,
        sortBy = "orderDate",
        order = "desc",
      } = req.query;

      const { page, limit, skip } = getPaginationParams(req.query);

      // Construction query
      const query = { organization: organizationId };

      if (type) query.type = type;
      if (status) query.status = status;
      if (paymentStatus) query.paymentStatus = paymentStatus;
      if (supplier) query.supplier = supplier;

      if (customer) {
        query["customer.name"] = { $regex: customer, $options: "i" };
      }

      if (startDate || endDate) {
        query.orderDate = {};
        if (startDate) query.orderDate.$gte = new Date(startDate);
        if (endDate) query.orderDate.$lte = new Date(endDate);
      }

      if (search) {
        query.$or = [
          { orderNumber: { $regex: search, $options: "i" } },
          { reference: { $regex: search, $options: "i" } },
          { "customer.name": { $regex: search, $options: "i" } },
          { "customer.email": { $regex: search, $options: "i" } },
        ];
      }

      // Sort
      const sortOptions = {};
      sortOptions[sortBy] = order === "desc" ? -1 : 1;

      const [orders, total] = await Promise.all([
        Order.find(query)
          .populate("supplier", "name phone email")
          .populate("items.product", "name sku")
          .populate("createdBy", "firstName lastName")
          .sort(sortOptions)
          .skip(skip)
          .limit(limit),
        Order.countDocuments(query),
      ]);

      return paginatedResponse(
        res,
        orders,
        {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
        "Commandes récupérées avec succès",
      );
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/orders/:id
  async getOrder(req, res, next) {
    try {
      const { id } = req.params;
      const organizationId = req.user.organization;

      const order = await Order.findOne({
        _id: id,
        organization: organizationId,
      })
        .populate("supplier")
        .populate("items.product")
        .populate("createdBy", "firstName lastName email")
        .populate("updatedBy", "firstName lastName")
        .populate("confirmedBy", "firstName lastName")
        .populate("statusHistory.changedBy", "firstName lastName");

      if (!order) {
        throw new AppError("Commande introuvable", 404);
      }

      return successResponse(res, order, "Commande récupérée avec succès");
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/orders
  async createOrder(req, res, next) {
    try {
      const organizationId = req.user.organization;
      const userId = req.user._id;

      const {
        type,
        supplier,
        customer,
        items,
        paymentMethod,
        paymentDetails,
        delivery,
        notes,
        internalNotes,
        reference,
        expectedDeliveryDate,
        totals,
      } = req.body;

      // Validation type
      if (!["purchase", "sale"].includes(type)) {
        throw new AppError("Type de commande invalide", 400);
      }

      // Validation fournisseur/client selon type
      if (type === "purchase" && !supplier) {
        throw new AppError("Fournisseur requis pour commande d'achat", 400);
      }

      if (type === "sale" && !customer) {
        throw new AppError("Client requis pour commande de vente", 400);
      }

      // Validation items
      if (!items || items.length === 0) {
        throw new AppError(
          "La commande doit contenir au moins un article",
          400,
        );
      }

      // Enrichir items avec snapshots produits
      const enrichedItems = await Promise.all(
        items.map(async (item) => {
          const product = await Product.findOne({
            _id: item.product,
            organization: organizationId,
          });

          if (!product) {
            throw new AppError(`Produit ${item.product} introuvable`, 404);
          }

          return {
            product: item.product,
            productSnapshot: {
              name: product.name,
              sku: product.sku,
              unit: product.unit,
            },
            quantity: item.quantity,
            unitPrice:
              item.unitPrice ||
              (type === "purchase"
                ? product.pricing.cost
                : product.pricing.sellingPrice),
            discount: item.discount || 0,
            taxRate: item.taxRate || product.pricing.taxRate || 0,
            notes: item.notes,
          };
        }),
      );

      // Vérifier fournisseur existe
      if (type === "purchase") {
        const supplierExists = await Supplier.findOne({
          _id: supplier,
          organization: organizationId,
        });

        if (!supplierExists) {
          throw new AppError("Fournisseur invalide", 400);
        }
      }

      // Créer commande
      const order = await Order.create({
        organization: organizationId,
        type,
        supplier: type === "purchase" ? supplier : undefined,
        customer: type === "sale" ? customer : undefined,
        items: enrichedItems,
        paymentMethod,
        paymentDetails,
        delivery,
        notes,
        internalNotes,
        reference,
        expectedDeliveryDate,
        totals: totals || {},
        createdBy: userId,
        status: "draft",
      });

      // Populer pour retour
      await order.populate("supplier");
      await order.populate("items.product");

      return successResponse(res, order, "Commande créée avec succès", 201);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/v1/orders/:id
  async updateOrder(req, res, next) {
    try {
      const { id } = req.params;
      const organizationId = req.user.organization;
      const userId = req.user._id;

      const order = await Order.findOne({
        _id: id,
        organization: organizationId,
      });

      if (!order) {
        throw new AppError("Commande introuvable", 404);
      }

      // Vérifier si peut être modifiée
      if (!order.canBeModified()) {
        throw new AppError(
          "Cette commande ne peut plus être modifiée (statut: " +
            order.status +
            ")",
          400,
        );
      }

      // Champs autorisés à être modifiés
      const allowedFields = [
        "supplier",
        "customer",
        "items",
        "paymentMethod",
        "delivery",
        "notes",
        "internalNotes",
        "reference",
        "expectedDeliveryDate",
        "totals",
      ];

      // Mettre à jour champs autorisés
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          order[field] = req.body[field];
        }
      });

      order.updatedBy = userId;
      await order.save();

      await order.populate("supplier");
      await order.populate("items.product");

      return successResponse(res, order, "Commande mise à jour avec succès");
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/v1/orders/:id
  async deleteOrder(req, res, next) {
    try {
      const { id } = req.params;
      const organizationId = req.user.organization;

      const order = await Order.findOne({
        _id: id,
        organization: organizationId,
      });

      if (!order) {
        throw new AppError("Commande introuvable", 404);
      }

      // Seules les commandes draft peuvent être supprimées
      if (order.status !== "draft") {
        throw new AppError(
          "Seules les commandes en brouillon peuvent être supprimées. Utilisez l'annulation pour les autres",
          400,
        );
      }

      await order.deleteOne();

      return successResponse(res, null, "Commande supprimée avec succès");
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/v1/orders/:id/status
  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const organizationId = req.user.organization;
      const userId = req.user._id;

      // Validation statut
      const validStatuses = [
        "draft",
        "pending",
        "confirmed",
        "processing",
        "completed",
        "cancelled",
      ];
      if (!validStatuses.includes(status)) {
        throw new AppError("Statut invalide", 400);
      }

      const order = await Order.findOne({
        _id: id,
        organization: organizationId,
      });

      if (!order) {
        throw new AppError("Commande introuvable", 404);
      }

      // Empêcher certaines transitions
      if (order.status === "completed" && status !== "completed") {
        throw new AppError(
          "Une commande complétée ne peut pas changer de statut",
          400,
        );
      }

      if (order.status === "cancelled" && status !== "cancelled") {
        throw new AppError(
          "Une commande annulée ne peut pas être réactivée",
          400,
        );
      }

      // Mettre à jour statut
      order.updateStatus(status, userId, notes);
      await order.save();

      await order.populate("supplier");
      await order.populate("items.product");

      return successResponse(res, order, `Statut mis à jour: ${status}`);
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/v1/orders/:id/confirm
  async confirmOrder(req, res, next) {
    try {
      const { id } = req.params;
      const organizationId = req.user.organization;
      const userId = req.user._id;

      const order = await Order.findOne({
        _id: id,
        organization: organizationId,
      });

      if (!order) {
        throw new AppError("Commande introuvable", 404);
      }

      if (order.status !== "pending" && order.status !== "draft") {
        throw new AppError(
          "Seules les commandes en attente ou brouillon peuvent être confirmées",
          400,
        );
      }

      order.updateStatus("confirmed", userId, "Commande confirmée");
      await order.save();

      return successResponse(res, order, "Commande confirmée avec succès");
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/v1/orders/:id/complete
  async completeOrder(req, res, next) {
    try {
      const { id } = req.params;
      const organizationId = req.user.organization;
      const userId = req.user._id;

      const order = await Order.findOne({
        _id: id,
        organization: organizationId,
      });

      if (!order) {
        throw new AppError("Commande introuvable", 404);
      }

      if (order.status === "completed") {
        throw new AppError("Commande déjà complétée", 400);
      }

      if (order.status === "cancelled") {
        throw new AppError(
          "Une commande annulée ne peut pas être complétée",
          400,
        );
      }

      // Vérifier stock disponible pour ventes
      if (order.type === "sale") {
        const Stock = require("../inventory/stock.model");

        for (const item of order.items) {
          const stock = await Stock.findOne({
            organization: organizationId,
            product: item.product,
          });

          if (!stock || stock.availableQuantity < item.quantity) {
            throw new AppError(
              `Stock insuffisant pour ${item.productSnapshot.name} (disponible: ${stock?.availableQuantity || 0}, requis: ${item.quantity})`,
              400,
            );
          }
        }
      }

      order.updateStatus("completed", userId, "Commande complétée");
      await order.save();

      return successResponse(
        res,
        order,
        "Commande complétée avec succès. Stock mis à jour",
      );
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/v1/orders/:id/cancel
  async cancelOrder(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const organizationId = req.user.organization;
      const userId = req.user._id;

      const order = await Order.findOne({
        _id: id,
        organization: organizationId,
      });

      if (!order) {
        throw new AppError("Commande introuvable", 404);
      }

      if (!order.canBeCancelled()) {
        throw new AppError(
          `Commande avec statut "${order.status}" ne peut pas être annulée`,
          400,
        );
      }

      order.updateStatus("cancelled", userId, reason || "Commande annulée");
      await order.save();

      return successResponse(res, order, "Commande annulée avec succès");
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/v1/orders/:id/payment
  async updatePaymentStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { amount, method, transactionId } = req.body;
      const organizationId = req.user.organization;

      if (!amount || amount <= 0) {
        throw new AppError("Montant invalide", 400);
      }

      const order = await Order.findOne({
        _id: id,
        organization: organizationId,
      });

      if (!order) {
        throw new AppError("Commande introuvable", 404);
      }

      // Vérifier montant ne dépasse pas total
      const currentPaid = order.paymentDetails.paidAmount || 0;
      if (currentPaid + amount > order.totals.total) {
        throw new AppError("Le montant dépasse le total de la commande", 400);
      }

      order.recordPayment(amount, method, transactionId);
      await order.save();

      return successResponse(
        res,
        order,
        `Paiement de ${amount} XAF enregistré. Statut: ${order.paymentStatus}`,
      );
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/orders/purchases
  async getPurchaseOrders(req, res, next) {
    try {
      req.query.type = "purchase";
      return this.getOrders(req, res, next);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/orders/sales
  async getSalesOrders(req, res, next) {
    try {
      req.query.type = "sale";
      return this.getOrders(req, res, next);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/orders/stats
  async getOrderStats(req, res, next) {
    try {
      const organizationId = req.user.organization;
      const { startDate, endDate } = req.query;

      const stats = await Order.getOrderStats(
        organizationId,
        startDate,
        endDate,
      );

      // Compléter avec compteurs statuts
      const statusCounts = await Order.aggregate([
        {
          $match: {
            organization: organizationId,
            ...(startDate && { orderDate: { $gte: new Date(startDate) } }),
            ...(endDate && { orderDate: { $lte: new Date(endDate) } }),
          },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      const paymentStatusCounts = await Order.aggregate([
        {
          $match: {
            organization: organizationId,
            status: { $ne: "cancelled" },
          },
        },
        {
          $group: {
            _id: "$paymentStatus",
            count: { $sum: 1 },
            totalAmount: { $sum: "$totals.total" },
          },
        },
      ]);

      return successResponse(
        res,
        {
          typeStats: stats,
          statusStats: statusCounts,
          paymentStats: paymentStatusCounts,
        },
        "Statistiques récupérées",
      );
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/orders/:id/pdf
  async generatePDF(req, res, next) {
    try {
      const { id } = req.params;
      const organizationId = req.user.organization;

      const order = await Order.findOne({
        _id: id,
        organization: organizationId,
      })
        .populate("organization")
        .populate("supplier")
        .populate("items.product");

      if (!order) {
        throw new AppError("Commande introuvable", 404);
      }

      // TODO: Implémenter génération PDF avec puppeteer ou pdfkit
      throw new AppError("Génération PDF en développement", 501);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/orders/export
  async exportOrders(req, res, next) {
    try {
      // TODO: Implémenter export CSV/Excel
      throw new AppError("Export en développement", 501);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();
