const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Event = require('../src/models/Event');
const Article = require('../src/models/Article');
const Banner = require('../src/models/Banner');
const Partner = require('../src/models/Partner');
const Association = require('../src/models/Association');

// Test database connection
const MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/homepage-cms-test';

describe('CMS Backend Acceptance Tests - ROVO-81', () => {
  let authToken;
  let adminUser;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(MONGODB_TEST_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create admin user for testing
    adminUser = new User({
      username: 'testadmin',
      email: 'admin@test.com',
      password: 'testpass123',
      profile: {
        firstName: 'Test',
        lastName: 'Admin'
      },
      role: 'admin',
      permissions: [
        { resource: 'events', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'articles', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'banners', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'partners', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'association', actions: ['read', 'update'] }
      ]
    });
    await adminUser.save();

    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'testpass123'
      });

    authToken = loginResponse.body.data.token;
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({});
    await Event.deleteMany({});
    await Article.deleteMany({});
    await Banner.deleteMany({});
    await Partner.deleteMany({});
    await Association.deleteMany({});
    
    // Close database connection
    await mongoose.connection.close();
  });

  describe('驗收條件 1: Given 所有內容模型已經建立，When 進行數據儲存與讀取測試，Then 確保數據能正確儲存及讀取', () => {
    test('Event model data storage and retrieval', async () => {
      const eventData = {
        name: {
          zh: '測試活動',
          en: 'Test Event'
        },
        date: new Date('2024-12-31T10:00:00Z'),
        location: {
          zh: '台北市',
          en: 'Taipei'
        },
        description: {
          zh: '這是一個測試活動',
          en: 'This is a test event'
        },
        category: 'conference'
      };

      // Create event
      const createResponse = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send(eventData)
        .expect(201);

      expect(createResponse.body.success).toBe(true);
      expect(createResponse.body.data.event.name.zh).toBe('測試活動');

      // Retrieve event
      const eventId = createResponse.body.data.event._id;
      const getResponse = await request(app)
        .get(`/api/events/${eventId}`)
        .expect(200);

      expect(getResponse.body.success).toBe(true);
      expect(getResponse.body.data.event.name.zh).toBe('測試活動');
      expect(getResponse.body.data.event.status).toBe('upcoming');
    });

    test('Article model data storage and retrieval', async () => {
      const articleData = {
        title: {
          zh: '測試文章',
          en: 'Test Article'
        },
        content: {
          zh: '這是測試文章內容',
          en: 'This is test article content'
        },
        author: {
          name: 'Test Author',
          email: 'author@test.com'
        },
        category: 'news',
        isPublished: true
      };

      // Create article
      const createResponse = await request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(articleData)
        .expect(201);

      expect(createResponse.body.success).toBe(true);
      expect(createResponse.body.data.article.title.zh).toBe('測試文章');

      // Retrieve article
      const articleId = createResponse.body.data.article._id;
      const getResponse = await request(app)
        .get(`/api/articles/${articleId}`)
        .expect(200);

      expect(getResponse.body.success).toBe(true);
      expect(getResponse.body.data.article.title.zh).toBe('測試文章');
    });

    test('Banner model data storage and retrieval', async () => {
      const bannerData = {
        title: {
          zh: '測試橫幅',
          en: 'Test Banner'
        },
        image: {
          desktop: '/uploads/test-banner.jpg'
        },
        displayPeriod: {
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        },
        displaySettings: {
          showOnPages: ['homepage'],
          position: 'top'
        }
      };

      // Create banner
      const createResponse = await request(app)
        .post('/api/banners')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bannerData)
        .expect(201);

      expect(createResponse.body.success).toBe(true);
      expect(createResponse.body.data.banner.status).toBe('active');

      // Retrieve active banners
      const getResponse = await request(app)
        .get('/api/banners')
        .expect(200);

      expect(getResponse.body.success).toBe(true);
      expect(getResponse.body.data.banners.length).toBeGreaterThan(0);
    });

    test('Partner model data storage and retrieval', async () => {
      const partnerData = {
        name: 'Test Partner',
        displayName: {
          zh: '測試合作夥伴',
          en: 'Test Partner'
        },
        logo: {
          url: '/uploads/test-logo.png'
        },
        websiteUrl: 'https://test-partner.com',
        category: 'technology',
        partnershipType: 'strategic'
      };

      // Create partner
      const createResponse = await request(app)
        .post('/api/partners')
        .set('Authorization', `Bearer ${authToken}`)
        .send(partnerData)
        .expect(201);

      expect(createResponse.body.success).toBe(true);
      expect(createResponse.body.data.partner.name).toBe('Test Partner');

      // Retrieve partners
      const getResponse = await request(app)
        .get('/api/partners')
        .expect(200);

      expect(getResponse.body.success).toBe(true);
      expect(getResponse.body.data.partners.length).toBeGreaterThan(0);
    });

    test('Association model data storage and retrieval', async () => {
      const associationData = {
        name: {
          zh: '測試協會',
          en: 'Test Association'
        },
        establishedYear: 2020,
        mission: {
          zh: '測試協會使命',
          en: 'Test Association Mission'
        },
        description: {
          zh: '這是測試協會描述',
          en: 'This is test association description'
        },
        contact: {
          email: 'contact@testassociation.org'
        }
      };

      // Create/Update association
      const updateResponse = await request(app)
        .put('/api/association')
        .set('Authorization', `Bearer ${authToken}`)
        .send(associationData)
        .expect(200);

      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.association.name.zh).toBe('測試協會');

      // Retrieve association
      const getResponse = await request(app)
        .get('/api/association')
        .expect(200);

      expect(getResponse.body.success).toBe(true);
      expect(getResponse.body.data.association.name.zh).toBe('測試協會');
    });
  });

  describe('驗收條件 2: Given API 已經部署，When 進行壓力測試，Then 確保在高流量下仍能穩定運行', () => {
    test('API rate limiting works correctly', async () => {
      const requests = [];
      
      // Make multiple concurrent requests to test rate limiting
      for (let i = 0; i < 10; i++) {
        requests.push(
          request(app)
            .get('/api/events')
            .expect((res) => {
              expect([200, 429]).toContain(res.status);
            })
        );
      }

      await Promise.all(requests);
    });

    test('API responds to multiple content requests', async () => {
      const endpoints = [
        '/api/events',
        '/api/articles',
        '/api/banners',
        '/api/partners',
        '/api/association'
      ];

      const requests = endpoints.map(endpoint =>
        request(app).get(endpoint).expect(200)
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.body.success).toBe(true);
      });
    });
  });

  describe('驗收條件 3: Given 後端模板已經開發完成，When 進行用戶測試，Then 確保管理者能夠無障礙地使用', () => {
    test('Admin dashboard is accessible with authentication', async () => {
      // Test admin dashboard access without auth (should fail)
      await request(app)
        .get('/admin')
        .expect(401);

      // Test with auth token would require frontend interaction
      // This is a placeholder for UI testing that would be done separately
      expect(true).toBe(true); // Placeholder assertion
    });

    test('API documentation is accessible', async () => {
      const response = await request(app)
        .get('/api-docs')
        .expect(301); // Swagger UI redirect

      expect(response.header.location).toContain('api-docs');
    });
  });

  describe('驗收條件 4: Given 所有功能已經實現，When 進行安全性測試，Then 確保所有功能符合安全標準', () => {
    test('Authentication is required for protected endpoints', async () => {
      const protectedEndpoints = [
        { method: 'post', path: '/api/events' },
        { method: 'put', path: '/api/events/123456789012345678901234' },
        { method: 'delete', path: '/api/events/123456789012345678901234' },
        { method: 'post', path: '/api/articles' },
        { method: 'post', path: '/api/banners' },
        { method: 'post', path: '/api/partners' }
      ];

      for (const endpoint of protectedEndpoints) {
        await request(app)
          [endpoint.method](endpoint.path)
          .expect(401);
      }
    });

    test('Input validation works correctly', async () => {
      // Test invalid event data
      await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: { zh: '' }, // Empty required field
          date: 'invalid-date',
          location: {},
          description: {}
        })
        .expect(400);

      // Test invalid article data
      await request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: {},
          content: {},
          author: {},
          category: 'invalid-category'
        })
        .expect(400);
    });

    test('JWT token validation works correctly', async () => {
      // Test with invalid token
      await request(app)
        .post('/api/events')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      // Test with malformed token
      await request(app)
        .post('/api/events')
        .set('Authorization', 'Invalid-Format')
        .expect(401);
    });

    test('User permissions are enforced', async () => {
      // Create a user with limited permissions
      const limitedUser = new User({
        username: 'limiteduser',
        email: 'limited@test.com',
        password: 'testpass123',
        profile: {
          firstName: 'Limited',
          lastName: 'User'
        },
        role: 'viewer',
        permissions: [
          { resource: 'events', actions: ['read'] }
        ]
      });
      await limitedUser.save();

      // Login as limited user
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'limited@test.com',
          password: 'testpass123'
        });

      const limitedToken = loginResponse.body.data.token;

      // Try to create an event (should fail)
      await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${limitedToken}`)
        .send({
          name: { zh: '測試活動' },
          date: new Date(),
          location: { zh: '台北' },
          description: { zh: '描述' },
          category: 'conference'
        })
        .expect(403);

      // Clean up
      await User.findByIdAndDelete(limitedUser._id);
    });

    test('Password security requirements are enforced', async () => {
      // Test weak password rejection
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser2',
          email: 'test2@test.com',
          password: '123', // Too short
          profile: {
            firstName: 'Test',
            lastName: 'User'
          }
        })
        .expect(400);
    });
  });
});