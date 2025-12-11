# Grocery Management Backend

A robust NestJS-based backend API for managing grocery lists with real-time collaboration features, user authentication, and link-based sharing capabilities.

## 🚀 Features

- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **Grocery List Management**: Create, read, update, and delete grocery lists and items
- **Real-time Updates**: WebSocket integration for live collaboration
- **Link Sharing**: Share grocery lists via secure, revocable links
- **Role-based Access**: Owner and viewer permissions for shared lists
- **RESTful API**: Well-structured endpoints following REST principles
- **Comprehensive Testing**: Unit tests and E2E tests with Jest
- **CORS Enabled**: Cross-origin resource sharing for frontend integration

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MongoDB** (v6 or higher) - Running locally or accessible remotely

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Aaditya-Rana/Grocery-Mangement-Backend.git
   cd Grocery-Mangement-Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/grocery-management
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRATION=7d
   
   # Server Configuration
   PORT=3000
   ```

   > **⚠️ Important**: Replace `JWT_SECRET` with a strong, random secret key in production.

## 🏃 Running the Application

### Development Mode (with hot-reload)
```bash
npm run start:dev
```

### Production Mode
```bash
# Build the application
npm run build

# Start the production server
npm run start:prod
```

### Debug Mode
```bash
npm run start:debug
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## 🧪 Testing

### Run Unit Tests
```bash
npm run test
```

### Run E2E Tests
```bash
npm run test:e2e
```

### Run Tests with Coverage
```bash
npm run test:cov
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register a new user | No |
| POST | `/auth/login` | Login and get JWT token | No |

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users/profile` | Get current user profile | Yes |

### Grocery List Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/lists` | Create a new grocery list | Yes |
| GET | `/lists` | Get all user's grocery lists | Yes |
| GET | `/lists/:id` | Get a specific grocery list | Yes |
| PATCH | `/lists/:id` | Update a grocery list | Yes |
| DELETE | `/lists/:id` | Delete a grocery list | Yes |
| POST | `/lists/:id/items` | Add item to a list | Yes |
| PATCH | `/lists/:id/items/:itemId` | Update a list item | Yes |
| DELETE | `/lists/:id/items/:itemId` | Remove item from a list | Yes |

### Share Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/share/create` | Create a shareable link | Yes |
| POST | `/share/accept/:shareId` | Accept a shared list | Yes |
| DELETE | `/share/revoke/:shareId` | Revoke a share link | Yes |
| GET | `/share/list/:listId` | Get all shares for a list | Yes |

### WebSocket Events

Connect to WebSocket at `ws://localhost:3000`

**Events:**
- `listUpdated` - Emitted when a list is modified
- `itemAdded` - Emitted when an item is added
- `itemUpdated` - Emitted when an item is updated
- `itemRemoved` - Emitted when an item is removed

## 📦 Postman Collection

A complete Postman collection is included in the repository:
- **File**: `Grocery-Management-API.postman_collection.json`
- **Documentation**: See `POSTMAN_COLLECTION_README.md` for detailed usage instructions

Import the collection into Postman to test all API endpoints with pre-configured requests and automated tests.

## 🏗️ Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── dto/             # Data transfer objects
│   ├── guards/          # JWT and Local auth guards
│   ├── strategies/      # Passport strategies
│   └── auth.service.ts  # Authentication logic
├── users/               # User management module
│   ├── schemas/         # Mongoose schemas
│   └── users.service.ts # User service logic
├── lists/               # Grocery lists module
│   ├── dto/             # DTOs for lists and items
│   ├── schemas/         # List and item schemas
│   └── lists.service.ts # List management logic
├── share/               # Link sharing module
│   ├── dto/             # Share DTOs
│   ├── schemas/         # Share schema
│   └── share.service.ts # Share logic
├── events/              # WebSocket gateway
│   └── events.gateway.ts
└── main.ts              # Application entry point

test/
├── auth.e2e-spec.ts     # Auth E2E tests
├── lists.e2e-spec.ts    # Lists E2E tests
└── share.e2e-spec.ts    # Share E2E tests
```

## 🔧 Technologies Used

- **Framework**: [NestJS](https://nestjs.com/) - Progressive Node.js framework
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Authentication**: [Passport](http://www.passportjs.org/) with JWT strategy
- **WebSockets**: [Socket.IO](https://socket.io/)
- **Testing**: [Jest](https://jestjs.io/) with Supertest
- **Validation**: class-validator & class-transformer
- **Password Hashing**: bcryptjs

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt (10 salt rounds)
- Protected routes with JWT guards
- CORS configuration for secure cross-origin requests
- Input validation using class-validator
- Secure share link generation

## 🚀 Deployment

### Environment Variables for Production

Ensure the following environment variables are set:

```env
NODE_ENV=production
MONGODB_URI=<your-production-mongodb-uri>
JWT_SECRET=<strong-random-secret>
JWT_EXPIRATION=7d
PORT=3000
```

### Build for Production

```bash
npm run build
```

The compiled output will be in the `dist/` directory.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the UNLICENSED license.

## 👨‍💻 Author

**Aaditya Rana**

## 🐛 Known Issues

None at the moment. Please report any issues on the GitHub repository.

## 📞 Support

For support, please open an issue on the GitHub repository or contact the maintainer.

---

**Happy Coding! 🎉**
