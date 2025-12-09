const Article = require('../models/Article');

// @desc    Get all articles
// @route   GET /api/articles
// @access  Public
const getArticles = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      featured,
      pinned,
      published = true,
      search,
      tags,
      sortBy = 'publishDate',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (published === 'true') {
      query.isPublished = true;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (featured === 'true') {
      query.isFeatured = true;
    }
    
    if (pinned === 'true') {
      query.isPinned = true;
    }
    
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      query.tags = { $in: tagArray };
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const articles = await Article.find(query)
      .populate('createdBy', 'username profile.firstName profile.lastName')
      .populate('relatedArticles', 'title slug featuredImage publishDate')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Article.countDocuments(query);

    res.json({
      success: true,
      data: {
        articles,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError') || 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single article
// @route   GET /api/articles/:id
// @access  Public
const getArticle = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find by ID or slug
    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id };
    
    const article = await Article.findOne(query)
      .populate('createdBy', 'username profile.firstName profile.lastName')
      .populate('updatedBy', 'username profile.firstName profile.lastName')
      .populate('relatedArticles', 'title slug featuredImage publishDate category');

    if (!article) {
      return res.status(404).json({
        success: false,
        message: req.t('articles.notFound') || 'Article not found'
      });
    }

    // Increment view count (only for published articles)
    if (article.isPublished) {
      article.viewCount += 1;
      await article.save();
    }

    res.json({
      success: true,
      data: { article }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError') || 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new article
// @route   POST /api/articles
// @access  Private
const createArticle = async (req, res) => {
  try {
    const articleData = {
      ...req.body,
      createdBy: req.user.id
    };

    const article = new Article(articleData);
    await article.save();

    await article.populate('createdBy', 'username profile.firstName profile.lastName');

    res.status(201).json({
      success: true,
      message: req.t('articles.created') || 'Article created successfully',
      data: { article }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: req.t('errors.validation') || 'Validation error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update article
// @route   PUT /api/articles/:id
// @access  Private
const updateArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: req.t('articles.notFound') || 'Article not found'
      });
    }

    // Check if user has permission to update this article
    if (req.user.role !== 'admin' && article.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: req.t('errors.forbidden') || 'Access denied'
      });
    }

    Object.assign(article, req.body);
    article.updatedBy = req.user.id;

    await article.save();
    await article.populate([
      { path: 'createdBy', select: 'username profile.firstName profile.lastName' },
      { path: 'updatedBy', select: 'username profile.firstName profile.lastName' },
      { path: 'relatedArticles', select: 'title slug featuredImage publishDate category' }
    ]);

    res.json({
      success: true,
      message: req.t('articles.updated') || 'Article updated successfully',
      data: { article }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: req.t('errors.validation') || 'Validation error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete article
// @route   DELETE /api/articles/:id
// @access  Private
const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: req.t('articles.notFound') || 'Article not found'
      });
    }

    // Check if user has permission to delete this article
    if (req.user.role !== 'admin' && article.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: req.t('errors.forbidden') || 'Access denied'
      });
    }

    await Article.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: req.t('articles.deleted') || 'Article deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError') || 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get featured articles for homepage
// @route   GET /api/articles/featured
// @access  Public
const getFeaturedArticles = async (req, res) => {
  try {
    const articles = await Article.find({
      isPublished: true,
      isFeatured: true
    })
      .sort({ publishDate: -1 })
      .limit(5)
      .populate('createdBy', 'username profile.firstName profile.lastName')
      .select('title slug summary featuredImage publishDate category tags viewCount');

    res.json({
      success: true,
      data: { articles }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError') || 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get latest articles
// @route   GET /api/articles/latest
// @access  Public
const getLatestArticles = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const articles = await Article.find({
      isPublished: true
    })
      .sort({ publishDate: -1 })
      .limit(parseInt(limit))
      .populate('createdBy', 'username profile.firstName profile.lastName')
      .select('title slug summary featuredImage publishDate category tags viewCount');

    res.json({
      success: true,
      data: { articles }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: req.t('errors.serverError') || 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  getFeaturedArticles,
  getLatestArticles
};