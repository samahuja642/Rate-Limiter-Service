const { rateLimiter } = require("../../rateLimiter");
const { redisClient } = require("../redisClient");
const { rateLimiterLimit } = require("../../rateLimiter");

jest.mock('../redisClient', () => ({
  redisClient: {
    isOpen: true,
    incr: jest.fn(),
    get: jest.fn(),
    expire: jest.fn()
  }
}));

const mockReq = (ip = '127.0.0.1') => ({
  ip
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn();
  return res;
};

let mockNext;

beforeEach(() => {
  jest.clearAllMocks();
  redisClient.isOpen = true;
  mockNext = jest.fn();
});

test('allows request when under limit', async () => {
    redisClient.incr.mockResolvedValue(1);
    redisClient.get.mockResolvedValue(1);
    redisClient.expire.mockResolvedValue(true);
    const req = mockReq();
    const res = mockRes();
    await rateLimiter(req,res,mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
});

test('blocks request when limit is crossed', async()=>{
    redisClient.incr.mockResolvedValue(rateLimiterLimit+1);
    redisClient.get.mockResolvedValue(rateLimiterLimit+1);
    redisClient.expire.mockResolvedValue(true);
    const req = mockReq();
    const res = mockRes();
    await rateLimiter(req,res,mockNext);
    expect(mockNext).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(429);
});

test('bypasses rate limiter when redis is not open', async () => {
  redisClient.isOpen = false;
  const req = mockReq();
  const res = mockRes();
  await rateLimiter(req, res, mockNext);
  expect(mockNext).toHaveBeenCalled();
});

test('handles concurrent requests correctly', async ()=>{
    const totalReq = 100;
    for(let i=1;i<=totalReq;i++){
        redisClient.incr.mockResolvedValueOnce(i);
    }
    const executions = [];
    const results = [];
    for (let i = 1; i <= totalReq; i++) {
        const req = mockReq();
        const res = mockRes();
        const next = jest.fn();

        results.push({ res, next });
        executions.push(rateLimiter(req, res, next));
    }
    await Promise.all(executions);
    results.forEach(({ res, next }, index) => {
        console.log('index',index);
        if (index < rateLimiterLimit) {
            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        } else {
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(429);
        }
    });
})