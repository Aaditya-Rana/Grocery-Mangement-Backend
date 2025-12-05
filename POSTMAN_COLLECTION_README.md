# Grocery Management API - Postman Collection

This Postman collection contains all API endpoints for the Grocery Management Backend with automated test scripts.

## Import Instructions

1. Open Postman
2. Click **Import** button
3. Select `Grocery-Management-API.postman_collection.json`
4. The collection will be imported with all requests and tests

## Collection Structure

### 1. Authentication
- **Register User** - Create a new user account
- **Login** - Authenticate and get JWT token
- **Get Profile** - Get authenticated user's profile

### 2. Lists
- **Create List** - Create a new grocery list
- **Get All Lists** - Retrieve all lists for authenticated user
- **Get List by ID** - Get specific list details
- **Update List** - Update list name and status
- **Duplicate List** - Create a copy of existing list
- **Delete List** - Remove a list

### 3. List Items
- **Add Item to List** - Add grocery item to list
- **Get All Items** - Get all items in a list
- **Get Item by ID** - Get specific item details
- **Update Item Status** - Update item status and notes
- **Delete Item** - Remove item from list

### 4. Sharing (Owner)
- **Generate Share Link** - Create shareable link for shopkeeper
- **Revoke Share Link** - Revoke existing share link

### 5. Sharing (Shopkeeper - Public)
- **View Shared List** - Access list via share token (no auth required)
- **Accept Share** - Shopkeeper accepts the share
- **Update List Status** - Shopkeeper updates list status
- **Update Item Status** - Shopkeeper updates item status (to_buy, in_progress, done, unavailable, substituted)

## Variables

The collection uses the following variables (automatically set by test scripts):

- `baseUrl` - API base URL (default: http://localhost:3000)
- `authToken` - JWT authentication token
- `userId` - Current user ID
- `listId` - Current list ID
- `itemId` - Current item ID
- `shareToken` - Share token for shopkeeper access

## Running the Collection

### Option 1: Run Individual Requests
1. Select any request from the collection
2. Click **Send**
3. View response and test results in the **Test Results** tab

### Option 2: Run Entire Collection
1. Click on the collection name
2. Click **Run** button
3. Select requests to run
4. Click **Run Grocery Management API**
5. View test results summary

### Option 3: Run with Collection Runner
1. Click **Runner** in Postman
2. Select **Grocery Management API** collection
3. Configure iterations and delay if needed
4. Click **Run Grocery Management API**

## Test Scripts

Each request includes automated test scripts that verify:
- Response status codes
- Response data structure
- Required fields presence
- Data validation
- Variable extraction for subsequent requests

## Usage Flow

**Recommended execution order:**

1. **Register User** → Creates account and saves userId
2. **Login** → Gets JWT token and saves to authToken
3. **Create List** → Creates list and saves listId
4. **Add Item to List** → Adds item and saves itemId
5. **Generate Share Link** → Creates share link and saves shareToken
6. **View Shared List** (Public) → Shopkeeper views list
7. **Update Item Status** (Shopkeeper) → Shopkeeper updates items

## Item Status Values

- `to_buy` - Item needs to be purchased
- `in_progress` - Shopkeeper is looking for item
- `done` - Item found and added
- `unavailable` - Item not available
- `substituted` - Alternative item provided

## List Status Values

- `draft` - List is being created
- `shared` - List shared with shopkeeper
- `completed` - All items processed

## Environment Setup

For different environments (dev, staging, production), create Postman environments with:

```json
{
  "baseUrl": "http://localhost:3000"  // or your deployed URL
}
```

## Notes

- All authenticated endpoints require the `authToken` variable to be set (automatically done after login)
- Shopkeeper endpoints (under "Sharing - Public") do not require authentication
- The collection automatically extracts and stores IDs from responses for use in subsequent requests
- Test scripts validate all responses automatically

## Support

For issues or questions, refer to the API documentation or contact the backend team.
