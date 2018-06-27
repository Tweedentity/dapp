const sinon = require('sinon');
const request = require('supertest');
const db = require('../lib/db');
const superagent = require('superagent');
const {app} = require('../');

const fixtures = require('./fixtures')

describe('Tweedentity Api integration tests', function () {

  describe('GET / tests', function () {
  	it('should respond 200 for GET /', function () {
  		return request(app)
  			.get('/')
  			.expect(200);
  	});
  });

  describe('404 tests', function () {
  	it('should 404 for bad route', function () {
  		return request(app)
  			.get('/fake')
  			.expect(404);
  	});
  });

  describe('GET /twitter/:userId tests', function () {
  	let dbGet;

  	before(function () {
  		dbGet = sinon.stub(db, 'get');
  	});

  	beforeEach(function () {
  		dbGet.callsFake((_, cb) => cb(null, 'fake'));
  	});

  	afterEach(function () {
  		dbGet.reset();
  	});

  	after(function () {
  		dbGet.restore();
  	});

  	it('should respond 200 for GET /twitter/:userId', function () {
  		return request(app)
  			.get('/twitter/1234')
  			.expect(200);
  	});

  	it('should respond 400 for db.get error', function () {
  		dbGet.callsFake((_, cb) => cb(new Error('fake')));

  		return request(app)
  			.get('/twitter/1234')
  			.expect(400);
  	});

  	it('should call db.get on the userId', function () {
  		return request(app)
  			.get('/twitter/1234')
  			.then(() => {
  				sinon.assert.calledWith(dbGet, '1234');
  			});
  	});

  	it('should respond with json', function () {
  		return request(app)
  			.get('/twitter/1234')
  			.expect('Content-Type', 'application/json; charset=utf-8')
  			.expect(JSON.stringify('fake'));
  	});
  });

  describe('GET /twitter/:tweetId/:address tests', function () {
    let superagentGet;

    before(function () {
      superagentGet = sinon.stub(superagent, 'get');
    });

    afterEach(function () {
      superagentGet.reset();
    });

    after(function () {
      superagentGet.restore();
    });

    it('should validate the params - bad twitter id too short', function () {
      return request(app)
      .get('/twitter/1234/0x0123456789012345678901234567890123456789')
      .expect('wrong-pars');
    });

    it('should validate the params - bad twitter id too long', function () {
      return request(app)
      .get('/twitter/123456789012345678901/0x0123456789012345678901234567890123456789')
      .expect('wrong-pars');
    });

    it('should validate the params - bad twitter id not all digits', function () {
      return request(app)
      .get('/twitter/abc4567890123456789/0x0123456789012345678901234567890123456789adgdfgdfsgdfgdsfgsdfgsdf')
      .expect('wrong-pars');
    });

    it('should validate the params - bad wallet address too short', function () {
      return request(app)
      .get('/twitter/1234567890123456789/0x01234')
      .expect('wrong-pars');
    });

    it('should validate the params - bad wallet address too long', function () {
      return request(app)
      .get('/twitter/1234567890123456789/0x01234567890123456789012345678901234567890')
      .expect('wrong-pars');
    });

    it('should validate the params - bad wallet characters', function () {
      return request(app)
      .get('/twitter/1234567890123456789/0x0***456789012345678901234567890123456789')
      .expect('wrong-pars');
    });

    it('', function () {
      superagentGet.callsFake(_ => Promise.reject('fake'));

      return request(app)
      .get('/twitter/1234567890123456789/0x0123456789012345678901234567890123456789')
      .expect('catch-error');
    });

  });

});
