const Stock = require('../models/Stock');
const Product = require('../models/Produit');
const StockMovement = require('../models/stockMovement');
const Order = require('../models/Order');

exports.getDashboardStats = async (req, res) => {
  try {
    // Total produits
    const totalProducts = await Product.countDocuments({ isActive: true });

    // Valeur totale du stock
    const stocks = await Stock.find().populate('product');
    const totalStockValue = stocks.reduce((sum, stock) => {
      return sum + (stock.quantity * (stock.product?.purchasePrice || 0));
    }, 0);

    // Produits en stock faible
    const lowStockProducts = await Stock.find().populate('product');
    const lowStockCount = lowStockProducts.filter(stock => 
      stock.quantity <= (stock.product?.reorderPoint || 0)
    ).length;

    // Produits expirant dans 30 jours
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const expiringProducts = await Stock.find({
      'batches.expirationDate': { $lte: thirtyDaysFromNow, $gte: new Date() }
    }).countDocuments();

    // Mouvements du mois
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyMovements = await StockMovement.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      }
    ]);

    // Commandes en attente
    const pendingOrders = await Order.countDocuments({
      status: { $in: ['pending', 'confirmed'] }
    });

    res.json({
      success: true,
      data: {
        totalProducts,
        totalStockValue: totalStockValue.toFixed(2),
        lowStockCount,
        expiringProducts,
        pendingOrders,
        monthlyMovements
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getStockTrends = async (req, res) => {
  try {
    const { period = '30' } = req.query; // jours
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const movements = await StockMovement.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            type: '$type'
          },
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    res.json({
      success: true,
      data: { movements }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getTopProducts = async (req, res) => {
  try {
    const { type = 'exit', limit = 10 } = req.query;

    const topProducts = await StockMovement.aggregate([
      {
        $match: { type }
      },
      {
        $group: {
          _id: '$product',
          totalQuantity: { $sum: '$quantity' },
          movementCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalQuantity: -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      }
    ]);

    res.json({
      success: true,
      data: { topProducts }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};