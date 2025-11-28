export default {
  post: jest.fn(),
  get: jest.fn(),
  create: () => ({
    post: jest.fn(),
    get: jest.fn(),
  }),
};
