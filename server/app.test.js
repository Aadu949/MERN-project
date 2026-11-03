jest.mock("./models/User", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

const request = require("supertest");
const app = require("./app");
const User = require("./models/User");
const bcrypt = require("bcryptjs");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /", () => {
  test("returns backend health message", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.text).toContain("MERN Backend is Running");
  });
});

describe("GET /metrics", () => {
  test("returns Prometheus metrics", async () => {
    const response = await request(app).get("/metrics");

    expect(response.status).toBe(200);
    expect(response.text).toContain("http_requests_total");
  });
});

describe("POST /api/login", () => {
  test("returns 400 when fields are missing", async () => {
    const response = await request(app)
      .post("/api/login")
      .send({ email: "test@example.com" });

    expect(response.status).toBe(400);
  });

  test("returns 401 when user does not exist", async () => {
    User.findOne.mockResolvedValue(null);

    const response = await request(app)
      .post("/api/login")
      .send({ email: "test@example.com", password: "password123" });

    expect(response.status).toBe(401);
  });

  test("returns 401 when password is incorrect", async () => {
    User.findOne.mockResolvedValue({
      password: "hashed-password",
    });
    bcrypt.compare.mockResolvedValue(false);

    const response = await request(app)
      .post("/api/login")
      .send({ email: "test@example.com", password: "wrong" });

    expect(response.status).toBe(401);
  });

  test("logs in successfully", async () => {
    User.findOne.mockResolvedValue({
      _id: "user123",
      name: "Test User",
      email: "test@example.com",
      password: "hashed-password",
    });
    bcrypt.compare.mockResolvedValue(true);

    const response = await request(app)
      .post("/api/login")
      .send({ email: "test@example.com", password: "password123" });

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe("test@example.com");
  });

  test("returns 500 when login encounters an error", async () => {
    User.findOne.mockRejectedValue(new Error("Database error"));

    const response = await request(app)
      .post("/api/login")
      .send({ email: "test@example.com", password: "password123" });

    expect(response.status).toBe(500);
  });
});

describe("POST /api/register", () => {
  test("returns 400 when fields are missing", async () => {
    const response = await request(app)
      .post("/api/register")
      .send({ name: "Test User" });

    expect(response.status).toBe(400);
  });

  test("returns 409 when user already exists", async () => {
    User.findOne.mockResolvedValue({ email: "test@example.com" });

    const response = await request(app)
      .post("/api/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

    expect(response.status).toBe(409);
  });

  test("registers a new user successfully", async () => {
    User.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hashed-password");
    User.create.mockResolvedValue({
      _id: "user123",
      name: "Test User",
      email: "test@example.com",
    });

    const response = await request(app)
      .post("/api/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe("test@example.com");
    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
  });

  test("returns 500 when registration encounters an error", async () => {
    User.findOne.mockRejectedValue(new Error("Database error"));

    const response = await request(app)
      .post("/api/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

    expect(response.status).toBe(500);
  });
});

describe("404 route handling", () => {
  test("handles an unknown route", async () => {
    const response = await request(app).get("/unknown-route");

    expect(response.status).toBe(404);
  });
});
