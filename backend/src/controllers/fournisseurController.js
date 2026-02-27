const Fournisseur = require("../models/Fournisseur");
const { AppError } = require("../utils/appError");
const { successResponse, paginatedResponse } = require("../utils/apiResponse");
const { getPaginationParams } = require("../utils/helpers");

class FournisseurController {
  // GET /api/v1/fournisseurs
  async getFournisseurs(req, res, next) {
    try {
      const organizationId = req.user.organization;
      const {
        page = 1,
        limit = 20,
        search,
        status,
        sortBy = "name",
        order = "asc",
      } = req.query;

      const { skip } = getPaginationParams(req.query);

      const query = { organization: organizationId };

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { code: { $regex: search, $options: "i" } },
        ];
      }

      if (status) query.status = status;

      const sortOptions = {};
      sortOptions[sortBy] = order === "desc" ? -1 : 1;

      const [fournisseurs, total] = await Promise.all([
        Fournisseur.find(query)
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit)),
        Fournisseur.countDocuments(query),
      ]);

      return paginatedResponse(
        res,
        fournisseurs,
        {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
        "Fournisseurs récupérés avec succès",
      );
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/fournisseurs/:id
  async getFournisseur(req, res, next) {
    try {
      const { id } = req.params;
      const organizationId = req.user.organization;

      const fournisseur = await Fournisseur.findOne({
        _id: id,
        organization: organizationId,
      }).populate("createdBy", "firstName lastName");

      if (!fournisseur) {
        throw new AppError("Fournisseur introuvable", 404);
      }

      return successResponse(
        res,
        fournisseur,
        "Fournisseur récupéré avec succès",
      );
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/fournisseurs
  async createFournisseur(req, res, next) {
    try {
      const organizationId = req.user.organization;
      const userId = req.user._id;

      const {
        name,
        email,
        phone,
        code,
        address,
        city,
        country,
        paymentTerms,
        rating,
      } = req.body;

      // Validation requise
      if (!name || !email) {
        throw new AppError("Nom et email requis", 400);
      }

      // Vérifier si fournisseur existe déjà
      const exists = await Fournisseur.findOne({
        organization: organizationId,
        email,
      });

      if (exists) {
        throw new AppError("Ce fournisseur existe déjà", 409);
      }

      const fournisseur = new Fournisseur({
        name,
        email,
        phone,
        code,
        address,
        city,
        country,
        paymentTerms,
        rating: rating || 5,
        organization: organizationId,
        createdBy: userId,
      });

      const savedFournisseur = await fournisseur.save();

      return successResponse(
        res,
        savedFournisseur,
        "Fournisseur créé avec succès",
        201,
      );
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/v1/fournisseurs/:id
  async updateFournisseur(req, res, next) {
    try {
      const { id } = req.params;
      const organizationId = req.user.organization;

      const fournisseur = await Fournisseur.findOneAndUpdate(
        {
          _id: id,
          organization: organizationId,
        },
        req.body,
        { new: true, runValidators: true },
      );

      if (!fournisseur) {
        throw new AppError("Fournisseur introuvable", 404);
      }

      return successResponse(
        res,
        fournisseur,
        "Fournisseur mis à jour avec succès",
      );
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/v1/fournisseurs/:id
  async deleteFournisseur(req, res, next) {
    try {
      const { id } = req.params;
      const organizationId = req.user.organization;

      const fournisseur = await Fournisseur.findOneAndDelete({
        _id: id,
        organization: organizationId,
      });

      if (!fournisseur) {
        throw new AppError("Fournisseur introuvable", 404);
      }

      return successResponse(res, null, "Fournisseur supprimé avec succès");
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/v1/fournisseurs/:id/rating
  async updateRating(req, res, next) {
    try {
      const { id } = req.params;
      const { rating } = req.body;
      const organizationId = req.user.organization;

      if (rating < 1 || rating > 5) {
        throw new AppError("La note doit être entre 1 et 5", 400);
      }

      const fournisseur = await Fournisseur.findOneAndUpdate(
        {
          _id: id,
          organization: organizationId,
        },
        { rating },
        { new: true },
      );

      if (!fournisseur) {
        throw new AppError("Fournisseur introuvable", 404);
      }

      return successResponse(res, fournisseur, "Note mise à jour");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FournisseurController();
